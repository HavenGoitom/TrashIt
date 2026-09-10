import Favorite from "../models/Favorite.js";
import Post from "../models/Post.js";

// @desc    Add a post to favorites
// @route   POST /api/favorites/:postId
// @access  Private
export const addFavorite = async (req, res) => {
    try {
        const { postId } = req.params;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            user: req.user._id,
            post: postId
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: "Post is already in your favorites"
            });
        }

        const favorite = await Favorite.create({
            user: req.user._id,
            post: postId
        });

        return res.status(201).json({
            success: true,
            message: "Post added to favorites",
            favorite
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Post is already in your favorites"
            });
        }
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error adding favorite",
            error: error.message
        });
    }
};

// @desc    Remove a post from favorites
// @route   DELETE /api/favorites/:postId
// @access  Private
export const removeFavorite = async (req, res) => {
    try {
        const { postId } = req.params;

        const favorite = await Favorite.findOneAndDelete({
            user: req.user._id,
            post: postId
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post removed from favorites"
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
            message: "Error removing favorite",
            error: error.message
        });
    }
};

// @desc    Get current user's favorite posts
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate({
                path: "post",
                populate: {
                    path: "user",
                    select: "username name email"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: favorites.length,
            favorites
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching favorites",
            error: error.message
        });
    }
};

// @desc    Check if a post is favorited by current user
// @route   GET /api/favorites/check/:postId
// @access  Private
export const checkFavorite = async (req, res) => {
    try {
        const { postId } = req.params;

        const favorite = await Favorite.findOne({
            user: req.user._id,
            post: postId
        });

        return res.status(200).json({
            success: true,
            isFavorited: !!favorite
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
            message: "Error checking favorite",
            error: error.message
        });
    }
};