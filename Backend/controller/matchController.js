import Match from "../models/Match.js";
import Post from "../models/Post.js";

// @desc    Get current user's matches
// @route   GET /api/matches
// @access  Private
export const getMyMatches = async (req, res) => {
    try {
        const userId = req.user._id;

        const userPosts = await Post.find({ user: userId }).select("_id");
        const userPostIds = userPosts.map((p) => p._id);

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

// @desc    Get a specific match by ID
// @route   GET /api/matches/:id
// @access  Private (participants only)
export const getMatchById = async (req, res) => {
    try {
        const userId = req.user._id;

        const match = await Match.findById(req.params.id)
            .populate({
                path: "buyPost",
                populate: { path: "user", select: "username name email" }
            })
            .populate({
                path: "sellPost",
                populate: { path: "user", select: "username name email" }
            });

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found"
            });
        }

        // Verify user is a participant (owns one of the posts)
        const userPosts = await Post.find({ user: userId }).select("_id");
        const userPostIds = userPosts.map((p) => p._id.toString());

        if (
            !userPostIds.includes(match.buyPost._id.toString()) &&
            !userPostIds.includes(match.sellPost._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own matches."
            });
        }

        return res.status(200).json({
            success: true,
            match
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid match ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error fetching match",
            error: error.message
        });
    }
};
