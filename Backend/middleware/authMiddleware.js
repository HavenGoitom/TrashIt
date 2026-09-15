import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Identity comes from the immutable user id. Fall back to username for
        // tokens issued before the id was added to the payload.
        const user = decoded.id
            ? await User.findById(decoded.id).select("-password")
            : await User.findOne({ username: decoded.username }).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found"
            });
        }

        // A suspended account is rejected even with a valid token — the check
        // happens on every protected request, not just at login.
        if (user.suspended) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended.",
                error: "ACCOUNT_SUSPENDED"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid token"
        });
    }
};

// Authenticates the token WITHOUT blocking suspended accounts. Used only by the
// suspension review-request endpoint, which suspended users must still reach.
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = decoded.id
            ? await User.findById(decoded.id).select("-password")
            : await User.findOne({ username: decoded.username }).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid token"
        });
    }
};

export const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(" or ")}`
            });
        }

        next();
    };
};