import Post from "../models/Post.js";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";
import { generateAIText } from "./aiService.js";

// Extract item info from a post using the AI provider fallback chain
// (Gemini → OpenRouter → Grok). Returns null if all providers fail.
async function extractItemInfo(post) {
    const prompt = `Given this marketplace post, extract the item name and category.
Title: "${post.title}"
Description: "${post.description || ""}"
Type: ${post.type}
Price: ${post.price.fixed ? post.price.fixed + " birr" : post.price.min + "-" + post.price.max + " birr"}
Quantity: ${post.quantity.fixed ? post.quantity.fixed : post.quantity.min + "-" + post.quantity.max}

Return ONLY a JSON object (no markdown, no code fences) with:
- "item": the main item name (e.g., "plastic chairs", "wine bottles")
- "category": a broad category (e.g., "furniture", "plastic", "glass", "textile", "metal", "electronics", "wood", "other")

Example: {"item": "plastic chairs", "category": "furniture"}`;

    try {
        const text = (await generateAIText(prompt)).text.trim();
        if (!text) return null;

        // Clean markdown fences
        let cleaned = text;
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        try {
            return JSON.parse(cleaned);
        } catch {
            // Some providers wrap JSON in prose — try to pull the object out
            const m = cleaned.match(/\{[\s\S]*\}/);
            if (m) {
                try {
                    return JSON.parse(m[0]);
                } catch {
                    return null;
                }
            }
            return null;
        }
    } catch {
        return null;
    }
}

// Check if two items are similar (simple string matching + Gemini fallback)
function areItemsSimilar(item1, item2) {
    if (!item1 || !item2) return false;

    const a = item1.toLowerCase().trim();
    const b = item2.toLowerCase().trim();

    // Direct match
    if (a === b) return true;

    // One contains the other
    if (a.includes(b) || b.includes(a)) return true;

    // Word overlap
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    let overlap = 0;
    for (const word of wordsA) {
        if (wordsB.has(word)) overlap++;
    }
    // If more than half of the words match
    return overlap >= Math.min(wordsA.size, wordsB.size) / 2;
}

// Check if prices are compatible
function arePricesCompatible(buyPost, sellPost) {
    const buyPrice = buyPost.price.fixed || buyPost.price.max || buyPost.price.min;
    const sellPrice = sellPost.price.fixed || sellPost.price.min || sellPost.price.max;

    if (!buyPrice || !sellPrice) return false;

    // Buyer's price should be >= seller's price (or within range)
    if (buyPost.price.fixed && sellPost.price.fixed) {
        return buyPost.price.fixed >= sellPost.price.fixed;
    }

    // Check if ranges overlap
    const buyMin = buyPost.price.min || buyPost.price.fixed;
    const buyMax = buyPost.price.max || buyPost.price.fixed;
    const sellMin = sellPost.price.min || sellPost.price.fixed;
    const sellMax = sellPost.price.max || sellPost.price.fixed;

    return buyMax >= sellMin && buyMin <= sellMax;
}

// Check if quantities are compatible
function areQuantitiesCompatible(buyPost, sellPost) {
    const buyQty = buyPost.quantity.fixed || buyPost.quantity.max || buyPost.quantity.min;
    const sellQty = sellPost.quantity.fixed || sellPost.quantity.min || sellPost.quantity.max;

    if (!buyQty || !sellQty) return false;

    // Seller should have at least what buyer wants (or close)
    if (buyPost.quantity.fixed && sellPost.quantity.fixed) {
        return sellPost.quantity.fixed >= buyPost.quantity.fixed * 0.5; // within 50%
    }

    // Check if ranges overlap
    const buyMin = buyPost.quantity.min || buyPost.quantity.fixed;
    const buyMax = buyPost.quantity.max || buyPost.quantity.fixed;
    const sellMin = sellPost.quantity.min || sellPost.quantity.fixed;
    const sellMax = sellPost.quantity.max || sellPost.quantity.fixed;

    return sellMax >= buyMin * 0.5 && sellMin <= buyMax * 1.5;
}

// Main matching function - call this after creating a post
export async function findMatchesForPost(newPost) {
    try {
        // Extract item info from the new post
        const newInfo = await extractItemInfo(newPost);
        if (!newInfo) return [];

        // Find opposite posts (active only, different user)
        const oppositeType = newPost.type === "buy" ? "sell" : "buy";
        const oppositePosts = await Post.find({
            type: oppositeType,
            status: "active",
            user: { $ne: newPost.user }
        }).populate("user", "username name");

        const matches = [];

        for (const oppPost of oppositePosts) {
            // Extract item info from opposite post
            const oppInfo = await extractItemInfo(oppPost);
            if (!oppInfo) continue;

            // Check if items are similar
            if (!areItemsSimilar(newInfo.item, oppInfo.item)) continue;

            // Check price compatibility
            const buyPost = newPost.type === "buy" ? newPost : oppPost;
            const sellPost = newPost.type === "sell" ? newPost : oppPost;

            if (!arePricesCompatible(buyPost, sellPost)) continue;
            if (!areQuantitiesCompatible(buyPost, sellPost)) continue;

            // Check if match already exists
            const existingMatch = await Match.findOne({
                buyPost: buyPost._id,
                sellPost: sellPost._id
            });

            if (existingMatch) continue;

            // Create match record
            const match = await Match.create({
                buyPost: buyPost._id,
                sellPost: sellPost._id
            });

            matches.push(match);

            // Notify both users
            await notifyMatch(match, buyPost, sellPost);
        }

        return matches;
    } catch (error) {
        // If matching fails, don't break post creation
        return [];
    }
}

async function notifyMatch(match, buyPost, sellPost) {
    try {
        const io = getIO();

        // Notify buyer
        const buyerNotification = await Notification.create({
            recipient: buyPost.user,
            type: "post_response",
            message: `🔥 Potential Match: We found someone selling what you're looking for.`,
            relatedPost: sellPost._id,
            sender: sellPost.user
        });

        match.buyerNotified = true;
        await match.save();

        io.to(buyPost.user.toString()).emit("new_notification", buyerNotification);
        io.to(buyPost.user.toString()).emit("new_match", {
            matchId: match._id,
            buyPost: buyPost._id,
            sellPost: sellPost._id,
            message: buyerNotification.message
        });

        // Notify seller
        const sellerNotification = await Notification.create({
            recipient: sellPost.user,
            type: "post_response",
            message: `🔥 Potential Match: Someone is looking for what you're selling.`,
            relatedPost: buyPost._id,
            sender: buyPost.user
        });

        match.sellerNotified = true;
        await match.save();

        io.to(sellPost.user.toString()).emit("new_notification", sellerNotification);
        io.to(sellPost.user.toString()).emit("new_match", {
            matchId: match._id,
            buyPost: buyPost._id,
            sellPost: sellPost._id,
            message: sellerNotification.message
        });
    } catch (error) {
        // Notification failure shouldn't break matching
    }
}