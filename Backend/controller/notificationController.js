import Notification from "../models/Notification.js";

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id
        })
            .populate("sender", "username name")
            .populate("relatedPost", "title type")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching notifications",
            error: error.message
        });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error updating notification",
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating notifications",
            error: error.message
        });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        return res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching unread count",
            error: error.message
        });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error deleting notification",
            error: error.message
        });
    }
};
