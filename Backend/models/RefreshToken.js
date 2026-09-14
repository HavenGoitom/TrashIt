import mongoose from "mongoose";

// Refresh tokens are opaque random strings. Only a SHA-256 hash of the token is
// persisted, so a database leak cannot be used to impersonate a user.
const refreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        revokedAt: {
            type: Date,
            default: null
        },
        userAgent: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

// MongoDB automatically removes documents once they expire.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RefreshToken", refreshTokenSchema);