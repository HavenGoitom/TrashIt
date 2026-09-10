import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { getIO } from "../socket/socketHandler.js";

// @desc    Start or get existing conversation about a post
// @route   POST /api/conversations
// @access  Private
export const createOrGetConversation = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user._id;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "postId is required"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const postOwnerId = post.user;

        if (postOwnerId.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself about your own post"
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [userId, postOwnerId] },
            post: postId
        }).populate("participants", "username name email");

        if (conversation) {
            return res.status(200).json({
                success: true,
                message: "Conversation already exists",
                conversation
            });
        }

        conversation = await Conversation.create({
            participants: [userId, postOwnerId],
            post: postId
        });

        conversation = await Conversation.findById(conversation._id).populate(
            "participants",
            "username name email"
        );

        // Notify post owner
        const notification = await Notification.create({
            recipient: postOwnerId,
            type: "new_conversation",
            message: `${req.user.username} wants to discuss your post "${post.title}"`,
            relatedPost: postId,
            relatedConversation: conversation._id,
            sender: userId
        });

        try {
            const io = getIO();
            io.to(postOwnerId.toString()).emit("new_notification", notification);
        } catch (err) {
            // Socket.io may not be initialized
        }

        return res.status(201).json({
            success: true,
            message: "Conversation created",
            conversation
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error creating conversation",
            error: error.message
        });
    }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate("participants", "username name email")
            .populate("post", "title type status")
            .sort({ lastMessageAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching conversations",
            error: error.message
        });
    }
};

// @desc    Get messages in a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private (participants only)
export const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not a participant in this conversation."
            });
        }

        const messages = await Message.find({ conversation: req.params.id })
            .populate("sender", "username name")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error: error.message
        });
    }
};