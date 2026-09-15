import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // JWT authentication middleware for WebSocket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Identity comes from the immutable user id; fall back to username
            // for tokens issued before the id was added to the payload.
            const user = decoded.id
                ? await User.findById(decoded.id).select("-password")
                : await User.findOne({ username: decoded.username }).select("-password");

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();

        // Join user's personal room for notifications
        socket.join(userId);

        // Handle sending a message
        socket.on("send_message", async (data) => {
            try {
                const { conversationId, content } = data;

                if (!conversationId || !content) {
                    socket.emit("error", { message: "conversationId and content are required" });
                    return;
                }

                // Verify user is a participant in the conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId
                });

                if (!conversation) {
                    socket.emit("error", { message: "Conversation not found or access denied" });
                    return;
                }

                // Create the message
                const message = await Message.create({
                    conversation: conversationId,
                    sender: userId,
                    content
                });

                // Update conversation's last message
                conversation.lastMessage = content;
                conversation.lastMessageAt = new Date();
                await conversation.save();

                // Populate sender info
                const populatedMessage = await Message.findById(message._id).populate(
                    "sender",
                    "username name"
                );

                // Emit to all participants in the conversation
                const conversationRoom = `conversation_${conversationId}`;
                socket.to(conversationRoom).emit("new_message", populatedMessage);
                socket.emit("new_message", populatedMessage);

                // Create notifications for other participants
                const otherParticipants = conversation.participants.filter(
                    (p) => p.toString() !== userId
                );

                for (const participantId of otherParticipants) {
                    const notification = await Notification.create({
                        recipient: participantId,
                        type: "new_message",
                        message: `${socket.user.username} sent you a message`,
                        relatedPost: conversation.post,
                        relatedConversation: conversation._id,
                        sender: userId
                    });

                    // Emit real-time notification
                    io.to(participantId.toString()).emit("new_notification", notification);
                }
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle joining a conversation room
        socket.on("join_conversation", async (data) => {
            try {
                const { conversationId } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId
                });

                if (!conversation) {
                    socket.emit("error", { message: "Conversation not found or access denied" });
                    return;
                }

                const roomName = `conversation_${conversationId}`;
                socket.join(roomName);
                socket.emit("joined_conversation", { conversationId });
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        });

        // Handle leaving a conversation room
        socket.on("leave_conversation", (data) => {
            const { conversationId } = data;
            const roomName = `conversation_${conversationId}`;
            socket.leave(roomName);
            socket.emit("left_conversation", { conversationId });
        });

        socket.on("disconnect", () => {
            // User disconnected
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};