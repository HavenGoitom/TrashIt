import Post from "../models/Post.js";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";

// Normalize a post title for matching:
// lowercase, trim, collapse spaces, drop common filler words and suffixes
// ("s" plural marker, "a"/"an"/"the", "for sale", "wanted", "need", etc.).
export function normalizeTitle(title) {
    if (!title) return [];

    let t = String(title)
        .toLowerCase()
        .trim()
                .replace(/\b(for\s+)?sale\b/g, "")
        .replace(/\bwanted\b|\blooking\s+for\b|\bneed\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Tokenize and normalize each word so "bottles" and "bottle" match.
    const tokens = t
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter((w) => w && w.length >= 2)
        .map((w) => {
            // Collapse simple plurals: bottles -> bottle, boxes -> boxx
            if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) {
                return w.slice(0, -1);
            }
            return w;
        });

    return tokens;
}

// Check whether two normalized titles are similar using word-set logic.
// Returns true if one title's word set overlaps the other's by at least
// 50% of the smaller set. This makes "wine bottle" vs "wine" match because
// the single word "wine" trivially overlaps 100% of the smaller set.
export function areTitlesSimilar(titleA, titleB) {
    const wordsA = normalizeTitle(titleA);
    const wordsB = normalizeTitle(titleB);

    if (wordsA.length === 0 || wordsB.length === 0) return false;

    // Exact set match
    if (wordsA.length === wordsB.length) {
        const setA = new Set(wordsA);
        const allMatch = wordsB.every((w) => setA.has(w));
        if (allMatch) return true;
    }

    // One contains all words of the other (>= 50% of smaller set)
    const small = wordsA.length <= wordsB.length ? wordsA : wordsB;
    const bigSet = new Set(wordsA.length <= wordsB.length ? wordsB : wordsA);
    let overlap = 0;
    for (const w of small) {
        if (bigSet.has(w)) overlap++;
    }
    return overlap >= small.length / 2;
}

// Prices and quantities are intentionally NOT used for matching.
// Matching is based solely on the post title/name and the Buy/Sell type.

// Main matching function - call this after creating a post
export async function findMatchesForPost(newPost) {
    try {
        const matches = [];
        const newPostId = newPost._id;
        // user may be populated (object) or a plain ObjectId
        const newPostUser = newPost.user._id || newPost.user;

        // Matching is bidirectional: when a Sell post is created we look for
        // compatible Buy posts, and vice-versa. (In practice the system
        // triggers on either type so both directions are covered.)
        const oppositeType = newPost.type === "buy" ? "sell" : "buy";

        console.log("[MATCHING] findMatchesForPost", {
            newPostId: newPost._id?.toString(),
            title: newPost.title,
            type: newPost.type,
            lookingFor: oppositeType,
            userId: newPostUser.toString()
        });

        const oppositePosts = await Post.find({
            type: oppositeType,
            status: "active",
            _id: { $ne: newPostId },
            user: { $ne: newPostUser }
        }).populate("user", "username name");

        console.log("[MATCHING] found", oppositePosts.length, "opposite posts");

        for (const oppPost of oppositePosts) {
            // Match on title/name ONLY — no price, quantity, location, or AI.
            if (!areTitlesSimilar(newPost.title, oppPost.title)) {
                console.log("[MATCHING] no match:", newPost.title, "vs", oppPost.title);
                continue;
            }
            console.log("[MATCHING] MATCH:", newPost.title, "vs", oppPost.title);

            // Determine which post is buy vs sell
            const buyPost = newPost.type === "buy" ? newPost : oppPost;
            const sellPost = newPost.type === "sell" ? newPost : oppPost;

            // Check if match already exists
            const existingMatch = await Match.findOne({
                buyPost: buyPost._id,
                sellPost: sellPost._id
            });
            if (existingMatch) {
                console.log("[MATCHING] match already exists");
                continue;
            }

            // Create match record
            const match = await Match.create({
                buyPost: buyPost._id,
                sellPost: sellPost._id
            });

            matches.push(match);

            // Notify both users
            await notifyMatch(match, buyPost, sellPost);
        }

        console.log("[MATCHING] created", matches.length, "matches");
        return matches;
    } catch (error) {
        console.error("[MATCHING] ERROR:", error);
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
            message: "🔥 Potential Match: We found someone selling what you're looking for.",
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
            message: "🔥 Potential Match: Someone is looking for what you're selling.",
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
