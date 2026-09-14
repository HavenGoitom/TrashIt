import User from "../models/User.js";
import Post from "../models/Post.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcrypt";

// Keep these in sync with the values used in authController.js so the refresh
// cookie cleared here is the exact one that was set at login.
const REFRESH_COOKIE_NAME = "trashit_refresh";
const REFRESH_COOKIE_PATH = "/api/auth";

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, location } = req.body;

        if (name === undefined && bio === undefined && location === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update (name, bio, or location)"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Only touch the fields that were actually sent, so values the user did
        // not change are preserved.
        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName) {
                return res.status(400).json({
                    success: false,
                    message: "Full name cannot be empty"
                });
            }
            if (trimmedName.length > 80) {
                return res.status(400).json({
                    success: false,
                    message: "Full name must be 80 characters or less"
                });
            }
            user.name = trimmedName;
        }

        if (bio !== undefined) {
            const trimmedBio = String(bio).trim();
            if (trimmedBio.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: "Bio must be 500 characters or less"
                });
            }
            user.bio = trimmedBio;
        }

        if (location !== undefined) {
            const trimmedLocation = String(location).trim();
            if (trimmedLocation.length > 120) {
                return res.status(400).json({
                    success: false,
                    message: "Location must be 120 characters or less"
                });
            }
            user.location = trimmedLocation;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated",
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                bio: user.bio,
                location: user.location,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message
        });
    }
};

// @desc    Delete account
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        // Express 5 leaves req.body undefined when no JSON body was sent.
        const { password } = req.body || {};

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required to delete account"
            });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }

        // Delete user's posts
        await Post.deleteMany({ user: req.user._id });

        // Revoke every refresh token for this user so no session can be
        // resurrected after the account is gone.
        await RefreshToken.deleteMany({ user: req.user._id });

        // Delete user
        await User.findByIdAndDelete(req.user._id);

        // Clear the refresh cookie exactly like logout does.
        res.clearCookie(REFRESH_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
            sameSite: process.env.COOKIE_SAME_SITE || "lax",
            path: REFRESH_COOKIE_PATH
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting account",
            error: error.message
        });
    }
};