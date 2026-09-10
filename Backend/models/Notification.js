import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["new_message", "new_conversation", "post_response", "post_status_change"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        relatedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        relatedConversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation"
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;