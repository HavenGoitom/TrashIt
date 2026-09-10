import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Post is required"]
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate favorites: one user can only favorite a post once
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;