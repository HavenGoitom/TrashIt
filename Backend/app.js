import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import cors from "cors";

import uploadRouter from "./routes/uploadRoute.js";
import authRouter from "./routes/authRoute.js";
import postRouter from "./routes/postRoute.js";
import favoriteRouter from "./routes/favoriteRoute.js";
import messageRouter from "./routes/messageRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import reportRouter from "./routes/reportRoute.js";
import profileRouter from "./routes/profileRoute.js";
import adminRouter from "./routes/adminRoute.js";
import aiRouter from "./routes/aiRoute.js";
import matchRouter from "./routes/matchRoute.js";
import { cookieParser } from "./middleware/cookieMiddleware.js";
import { initSocket } from "./socket/socketHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS — credentials must be allowed so the HttpOnly refresh cookie is sent.
// Set CLIENT_URL (comma separated) in production; otherwise reflect the origin.
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Cookie parsing (used for the HttpOnly refresh token)
app.use(cookieParser);

// Simple rate limiting for auth routes
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 20; // max requests per window

const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return next();
    }

    const limit = rateLimit.get(ip);
    if (now > limit.resetAt) {
        limit.count = 1;
        limit.resetAt = now + RATE_LIMIT_WINDOW;
        return next();
    }

    if (limit.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later"
        });
    }

    limit.count++;
    next();
};

// Rate limit only the credential-submitting endpoints. /api/auth/me and
// /api/auth/refresh are called routinely (session restore on every page load
// and silent token refresh) and must not be throttled, otherwise normal users
// get locked out with 429.
app.use("/api/auth/login", rateLimiter);
app.use("/api/auth/register", rateLimiter);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
initSocket(httpServer);

// Routes
app.use("/image", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api", messageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/matches", matchRouter);

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});