import Match from "../models/Match.js";
import Post from "../models/Post.js";

// @desc    Get current user's matches
// @route   GET /api/matches
// @access  Private
export const getMyMatches = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all posts by the current user
        const userPosts = await Post.find({ user: userId }).select("_id");
        const userPostIds = userPosts.map((p) => p._id);

        // Find matches where user's post is either buy or sell
        const matches = await Match.find({
            $or: [
                { buyPost: { $in: userPostIds } },
                { sellPost: { $in: userPostIds } }
            ]
        })
            .populate({
                path: "buyPost",
                populate: { path: "user", select: "username name email" }
            })
            .populate({
                path: "sellPost",
                populate: { path: "user", select: "username name email" }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: matches.length,
            matches
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching matches",
            error: error.message
        });
    }
};