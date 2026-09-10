import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Reporter is required"]
        },
        targetType: {
            type: String,
            enum: ["post", "user"],
            required: true
        },
        reportedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reason: {
            type: String,
            required: [true, "Report reason is required"],
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "resolved", "rejected"],
            default: "pending"
        },
        adminNote: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate pending reports
reportSchema.index(
    { reporter: 1, reportedPost: 1, reportedUser: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;