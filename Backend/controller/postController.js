import Post from "../models/Post.js";
import { findMatchesForPost } from "../services/matchingService.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        // Defense in depth — authMiddleware already blocks suspended accounts,
        // but post creation must never be possible while suspended.
        if (req.user.suspended) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended.",
                error: "ACCOUNT_SUSPENDED"
            });
        }

        const { title, description, images, type, price, quantity } = req.body;

        if (!title || !type || !price || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, type, price, and quantity"
            });
        }

        const post = await Post.create({
            title,
            description,
            images: images || [],
            type,
            price,
            quantity,
            user: req.user._id
        });

        const populatedPost = await Post.findById(post._id).populate(
            "user",
            "username name email"
        );

        // Find matches asynchronously (don't block response)
        findMatchesForPost(populatedPost).catch(() => {});

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: populatedPost
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error creating post",
            error: error.message
        });
    }
};

// @desc    Get all posts with search, filters, pagination, sorting
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
    try {
        const {
            type,
            status,
            search,
            minPrice,
            maxPrice,
            minQuantity,
            maxQuantity,
            sort,
            page,
            limit
        } = req.query;

        const filter = {};

        // Filter by type
        if (type) {
            if (!["sell", "buy"].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid type. Must be 'sell' or 'buy'"
                });
            }
            filter.type = type;
        }

        // Filter by status
        if (status) {
            if (!["active", "sold", "closed"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be 'active', 'sold', or 'closed'"
                });
            }
            filter.status = status;
        }

        // Search by title or description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.$and = filter.$and || [];
            if (minPrice) {
                filter.$and.push({
                    $or: [
                        { "price.fixed": { $gte: Number(minPrice) } },
                        { "price.max": { $gte: Number(minPrice) } }
                    ]
                });
            }
            if (maxPrice) {
                filter.$and.push({
                    $or: [
                        { "price.fixed": { $lte: Number(maxPrice) } },
                        { "price.min": { $lte: Number(maxPrice) } }
                    ]
                });
            }
        }

        // Filter by quantity range
        if (minQuantity || maxQuantity) {
            filter.$and = filter.$and || [];
            if (minQuantity) {
                filter.$and.push({
                    $or: [
                        { "quantity.fixed": { $gte: Number(minQuantity) } },
                        { "quantity.max": { $gte: Number(minQuantity) } }
                    ]
                });
            }
            if (maxQuantity) {
                filter.$and.push({
                    $or: [
                        { "quantity.fixed": { $lte: Number(maxQuantity) } },
                        { "quantity.min": { $lte: Number(maxQuantity) } }
                    ]
                });
            }
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === "newest") {
            sortOption = { createdAt: -1 };
        } else if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const total = await Post.countDocuments(filter);
        const posts = await Post.find(filter)
            .populate("user", "username name email")
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json({
            success: true,
            count: posts.length,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            posts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching posts",
            error: error.message
        });
    }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            "user",
            "username name email"
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.status(200).json({
            success: true,
            post
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
            message: "Error fetching post",
            error: error.message
        });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (owner only)
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only update your own posts"
            });
        }

        const { title, description, images, type, price, quantity } = req.body;

        post.title = title || post.title;
        post.description = description || post.description;
        post.images = images || post.images;
        post.type = type || post.type;
        post.price = price || post.price;
        post.quantity = quantity || post.quantity;

        const updatedPost = await post.save();

        const populatedPost = await Post.findById(updatedPost._id).populate(
            "user",
            "username name email"
        );

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post: populatedPost
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID"
            });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error updating post",
            error: error.message
        });
    }
};

// @desc    Update post status (owner only)
// @route   PATCH /api/posts/:id/status
// @access  Private (owner only)
export const updatePostStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["active", "sold", "closed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'active', 'sold', or 'closed'"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only update your own posts"
            });
        }

        post.status = status;
        await post.save();

        const populatedPost = await Post.findById(post._id).populate(
            "user",
            "username name email"
        );

        return res.status(200).json({
            success: true,
            message: `Post status updated to '${status}'`,
            post: populatedPost
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
            message: "Error updating post status",
            error: error.message
        });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (owner only)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only delete your own posts"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
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
            message: "Error deleting post",
            error: error.message
        });
    }
};

// @desc    Get current user's own posts
// @route   GET /api/posts/my
// @access  Private
export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("user", "username name email");

        return res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching your posts",
            error: error.message
        });
    }
};