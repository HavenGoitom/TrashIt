// ─── AI provider fallback chain ────────────────────────────────────────────────
// Primary provider is Gemini. If it fails for any reason (API error, quota,
// rate limit, service unavailable, bad response) we transparently fall back to
// OpenRouter and then Grok. The frontend never needs to know which provider
// answered — it always calls the TrashIt backend AI endpoint.
//
// All API keys live in the backend .env and are never returned to clients.

const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);

async function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ─── Gemini (primary) ──────────────────────────────────────────────────────────

async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    // Try the configured model first, then well-known aliases so a renamed or
    // retired model does not take down the whole AI feature.
    const models = [
        process.env.GEMINI_MODEL,
        "gemini-3.6-flash",
        "gemini-flash-latest",
    ].filter(Boolean);

    let lastError = "Gemini API request failed";

    for (const model of models) {
        try {
            const response = await fetchWithTimeout(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-goog-api-key": apiKey
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                lastError = errorData.error?.message || `Gemini API returned ${response.status}`;
                continue;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) return text;
            lastError = "Gemini returned an empty response";
        } catch (error) {
            lastError = error.message;
        }
    }

    throw new Error(lastError);
}

// ─── OpenRouter (fallback 1) ───────────────────────────────────────────────────

async function callOpenRouter(prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash-latest";

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };
    if (process.env.OPENROUTER_HTTP_REFERER) {
        headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER;
    }
    if (process.env.OPENROUTER_X_TITLE) {
        headers["X-Title"] = process.env.OPENROUTER_X_TITLE;
    }

    const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }]
            })
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error?.message || `OpenRouter API returned ${response.status}`
        );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) throw new Error("OpenRouter returned an empty response");

    return text;
}
// ─── Grok (fallback 2) ─────────────────────────────────────────────────────────

async function callGrok(prompt) {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) throw new Error("GROK_API_KEY is not configured");

    const model = process.env.GROK_MODEL || "grok-3-latest";
    const baseUrl = process.env.GROK_BASE_URL || "https://api.x.ai/v1";

    const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error?.message || `Grok API returned ${response.status}`
        );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) throw new Error("Grok returned an empty response");

    return text;
}

// ─── Fallback chain ────────────────────────────────────────────────────────────

const PROVIDERS = [
    { name: "gemini", isConfigured: () => !!process.env.GEMINI_API_KEY, call: callGemini },
    { name: "openrouter", isConfigured: () => !!process.env.OPENROUTER_API_KEY, call: callOpenRouter },
    { name: "grok", isConfigured: () => !!process.env.GROK_API_KEY, call: callGrok },
];

// Tries each configured provider in order and returns the first usable response.
export async function generateAIText(prompt) {
    const failures = [];

    for (const provider of PROVIDERS) {
        if (!provider.isConfigured()) {
            failures.push(`${provider.name}: not configured`);
            continue;
        }

        try {
            const text = await provider.call(prompt);
            if (text && text.trim()) {
                return { text, provider: provider.name };
            }
            failures.push(`${provider.name}: empty response`);
        } catch (error) {
            // Keep developer detail in the server log, never send it to users.
            console.warn(`[TrashIt AI] ${provider.name} failed: ${error.message}`);
            failures.push(`${provider.name}: ${error.message}`);
        }
    }

    const error = new Error("All AI providers failed");
    error.details = failures.join(" | ");
    throw error;
}

export default generateAIText;