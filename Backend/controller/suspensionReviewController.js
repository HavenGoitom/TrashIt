import SuspensionReview from "../models/SuspensionReview.js";

// @desc    Submit a suspension review request (suspended users only)
// @route   POST /api/suspension-reviews
// @access  Private (suspended accounts — uses `authenticate`, not `authMiddleware`)
export const createReviewRequest = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !String(message).trim()) {
            return res.status(400).json({
                success: false,
                message: "Please explain why your suspension should be reviewed"
            });
        }

        if (!req.user.suspended) {
            return res.status(400).json({
                success: false,
                message: "Your account is not suspended"
            });
        }

        const existing = await SuspensionReview.findOne({
            user: req.user._id,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You already have a review request pending"
            });
        }

        const review = await SuspensionReview.create({
            user: req.user._id,
            message: String(message).trim()
        });

        return res.status(201).json({
            success: true,
            message: "Review request submitted. An admin will look at it soon.",
            review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You already have a review request pending"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error submitting review request",
            error: error.message
        });
    }
};

// @desc    Get the current user's suspension review request (if any)
// @route   GET /api/suspension-reviews/mine
// @access  Private (suspended accounts — uses `authenticate`)
export const getMyReviewRequest = async (req, res) => {
    try {
        const review = await SuspensionReview.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            review: review || null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching review request",
            error: error.message
        });
    }
};