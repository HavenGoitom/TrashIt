import Report from "../models/Report.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// @desc    Report a post
// @route   POST /api/reports/post/:postId
// @access  Private
export const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Report reason is required"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check for existing pending report
        const existing = await Report.findOne({
            reporter: req.user._id,
            reportedPost: postId,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this post"
            });
        }

        const report = await Report.create({
            reporter: req.user._id,
            targetType: "post",
            reportedPost: postId,
            reason
        });

        return res.status(201).json({
            success: true,
            message: "Post reported successfully",
            report
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this post"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error submitting report",
            error: error.message
        });
    }
};

// @desc    Report a user
// @route   POST /api/reports/user/:userId
// @access  Private
export const reportUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Report reason is required"
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot report yourself"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existing = await Report.findOne({
            reporter: req.user._id,
            reportedUser: userId,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this user"
            });
        }

        const report = await Report.create({
            reporter: req.user._id,
            targetType: "user",
            reportedUser: userId,
            reason
        });

        return res.status(201).json({
            success: true,
            message: "User reported successfully",
            report
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this user"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error submitting report",
            error: error.message
        });
    }
};

// @desc    Get current user's submitted reports
// @route   GET /api/reports/my
// @access  Private
export const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporter: req.user._id })
            .populate("reportedPost", "title type status")
            .populate("reportedUser", "username name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching reports",
            error: error.message
        });
    }
};