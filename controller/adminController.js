import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from "../models/Report.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// @desc    Suspend a user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin
export const suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Cannot suspend an admin"
            });
        }
        user.suspended = true;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "User suspended",
            user: { _id: user._id, username: user.username, suspended: user.suspended }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error suspending user",
            error: error.message
        });
    }
};

// @desc    Unsuspend a user
// @route   PATCH /api/admin/users/:id/unsuspend
// @access  Admin
export const unsuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.suspended = false;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "User unsuspended",
            user: { _id: user._id, username: user.username, suspended: user.suspended }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error unsuspending user",
            error: error.message
        });
    }
};

// @desc    Get all posts (admin view)
// @route   GET /api/admin/posts
// @access  Admin
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate("user", "username name email")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching posts",
            error: error.message
        });
    }
};

// @desc    Remove a post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
export const removePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Post removed by admin"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error removing post",
            error: error.message
        });
    }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Admin
export const getReports = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const reports = await Report.find(filter)
            .populate("reporter", "username name")
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

// @desc    Resolve a report
// @route   PATCH /api/admin/reports/:id/resolve
// @access  Admin
export const resolveReport = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }
        report.status = "resolved";
        report.adminNote = adminNote || "";
        await report.save();
        return res.status(200).json({
            success: true,
            message: "Report resolved",
            report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error resolving report",
            error: error.message
        });
    }
};

// @desc    Reject a report
// @route   PATCH /api/admin/reports/:id/reject
// @access  Admin
export const rejectReport = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }
        report.status = "rejected";
        report.adminNote = adminNote || "";
        await report.save();
        return res.status(200).json({
            success: true,
            message: "Report rejected",
            report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error rejecting report",
            error: error.message
        });
    }
};

// @desc    Get marketplace statistics
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const suspendedUsers = await User.countDocuments({ suspended: true });
        const totalPosts = await Post.countDocuments();
        const activePosts = await Post.countDocuments({ status: "active" });
        const soldPosts = await Post.countDocuments({ status: "sold" });
        const closedPosts = await Post.countDocuments({ status: "closed" });
        const pendingReports = await Report.countDocuments({ status: "pending" });

        return res.status(200).json({
            success: true,
            stats: {
                users: { total: totalUsers, suspended: suspendedUsers },
                posts: { total: totalPosts, active: activePosts, sold: soldPosts, closed: closedPosts },
                reports: { pending: pendingReports }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching stats",
            error: error.message
        });
    }
};