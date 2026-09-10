export const whatCouldIMake = async (req, res) => {
    try {
        const { material } = req.body;

        if (!material || typeof material !== "string" || material.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Material is required and must be a non-empty string"
            });
        }

        if (material.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Material must be 100 characters or less"
            });
        }

        const prompt = `You are a creative recycling and upcycling assistant for TrashIt, a marketplace for buying and selling recyclable materials. The user has the following material: "${material.trim()}".

Provide 5 practical, safe, and creative ideas for what they could make from this material. Each idea should be realistic for a DIY project at home.

Return ONLY a valid JSON array (no markdown, no code fences, no extra text) with exactly 5 objects. Each object must have these fields:
- "title": short project name (string)
- "description": one sentence describing the project (string)
- "steps": array of 3-5 simple step strings
- "difficulty": one of "easy", "medium", or "hard"

Example format:
[{"title":"...","description":"...","steps":["...","..."],"difficulty":"easy"}, ...]`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(502).json({
                success: false,
                message: "AI service temporarily unavailable",
                error: errorData.error?.message || `Gemini API returned ${response.status}`
            });
        }

        const data = await response.json();

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(502).json({
                success: false,
                message: "AI returned an empty response"
            });
        }

        // Clean up response - remove markdown code fences if present
        let cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        let ideas;
        try {
            ideas = JSON.parse(cleaned);
        } catch (parseError) {
            return res.status(502).json({
                success: false,
                message: "AI returned an invalid format"
            });
        }

        if (!Array.isArray(ideas)) {
            return res.status(502).json({
                success: false,
                message: "AI response was not in the expected format"
            });
        }

        return res.status(200).json({
            success: true,
            material: material.trim(),
            ideas
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error generating ideas",
            error: error.message
        });
    }
};