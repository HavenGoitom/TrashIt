import mongoose from "mongoose";

// A request from a suspended user asking the admins to review their suspension.
// Submitting a request does NOT automatically unsuspend the account — an admin
// must explicitly approve it.
const suspensionReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        message: {
            type: String,
            required: [true, "Please explain why your suspension should be reviewed"],
            trim: true,
            maxlength: [2000, "Message must be 2000 characters or less"]
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        adminNote: {
            type: String,
            default: "",
            trim: true
        }
    },
    { timestamps: true }
);

// One pending review per user
suspensionReviewSchema.index(
    { user: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

const SuspensionReview = mongoose.model("SuspensionReview", suspensionReviewSchema);

export default SuspensionReview;