import Post from "../models/Post.js";

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

// @desc    AI-powered search for TrashIt posts
// @route   POST /api/ai/search
// @access  Private
export const searchPosts = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        if (query.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Search query must be 200 characters or less"
            });
        }

        const searchTerm = query.trim();

        // Use AI to understand the search query and extract relevant keywords
        let aiKeywords = [];
        let aiAvailable = true;

        try {
            const prompt = `You are a search assistant for TrashIt, a marketplace for recyclable materials. The user searched: "${searchTerm}".

Extract 3-5 relevant search keywords or short phrases that would help find matching posts in the database. Focus on material names, item types, and related terms.

Return ONLY a valid JSON array of strings (no markdown, no code fences, no extra text).
Example: ["plastic bottles", "PET containers", "recyclable plastic"]`;

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

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    let cleaned = text.trim();
                    if (cleaned.startsWith("```json")) {
                        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
                    } else if (cleaned.startsWith("```")) {
                        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
                    }
                    aiKeywords = JSON.parse(cleaned);
                    if (!Array.isArray(aiKeywords)) aiKeywords = [];
                }
            } else {
                aiAvailable = false;
            }
        } catch (aiError) {
            aiAvailable = false;
        }

        // Build search filter using AI keywords + original search term
        const allTerms = [searchTerm, ...aiKeywords].filter(Boolean);
        const searchConditions = allTerms.map(term => ({
            $or: [
                { title: { $regex: term, $options: "i" } },
                { description: { $regex: term, $options: "i" } }
            ]
        }));

        // Search real TrashIt posts
        const posts = await Post.find({
            $and: [
                { status: "active" },
                { $or: searchConditions }
            ]
        })
            .populate("user", "username name email")
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            query: searchTerm,
            posts,
            count: posts.length,
            aiAvailable,
            message: posts.length === 0 ? "No matching items found yet." : undefined
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error searching posts",
            error: error.message
        });
    }
};