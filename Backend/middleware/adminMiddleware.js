export const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin role required."
        });
    }

    next();
};

export const checkSuspended = (req, res, next) => {
    if (req.user && req.user.suspended) {
        return res.status(403).json({
            success: false,
            message: "Your account has been suspended. Contact support."
        });
    }
    next();
};