import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
    {
        buyPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        sellPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        buyerNotified: {
            type: Boolean,
            default: false
        },
        sellerNotified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate matches between the same two posts
matchSchema.index({ buyPost: 1, sellPost: 1 }, { unique: true });

const Match = mongoose.model("Match", matchSchema);

export default Match;