import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

// ─── Token configuration ───────────────────────────────────────────────────────
// Access token: 1 day. Refresh token: 1 month (30 days).
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "1d";
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
const REFRESH_COOKIE_NAME = "trashit_refresh";
// Restrict the cookie to the auth routes — it is only needed there.
const REFRESH_COOKIE_PATH = "/api/auth";

// Identity is taken from the immutable user id. Username/role are included for
// convenience only — never used for lookups (a username can be changed).
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
};

function refreshCookieOptions(expiresAt) {
    return {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAME_SITE || "lax",
        path: REFRESH_COOKIE_PATH,
        expires: expiresAt
    };
}

function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAME_SITE || "lax",
        path: REFRESH_COOKIE_PATH
    });
}

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function publicUser(user) {
    return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt
    };
}

// Issues a fresh access token and rotates the refresh token cookie.
async function issueSession(user, req, res) {
    const accessToken = generateToken(user);

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        user: user._id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
        userAgent: String(req.headers["user-agent"] || "").slice(0, 200)
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(expiresAt));

    return accessToken;
}


function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push("Password must contain at least one special character (!@#$%^&*)");
    return errors;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        if (!username || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, name, email, and password"
            });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet security requirements",
                passwordErrors
            });
        }

        const userExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or username"
            });
        }

        const user = await User.create({
            username,
            name,
            email,
            password
        });

        const token = await issueSession(user, req, res);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: publicUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email/username and password"
            });
        }

        // Allow login with either email or username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.suspended) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended.",
                error: "ACCOUNT_SUSPENDED"
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = await issueSession(user, req, res);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: publicUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message
        });
    }
};

// @desc    Exchange a valid refresh token cookie for a new access token
// @route   POST /api/auth/refresh
// @access  Public (requires the HttpOnly refresh cookie)
export const refresh = async (req, res) => {
    try {
        const rawToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : null;

        if (!rawToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided"
            });
        }

        const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });

        if (!stored) {
            clearRefreshCookie(res);
            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid or expired"
            });
        }

        if (stored.revokedAt) {
            // Token reuse detected — revoke everything for this user.
            await RefreshToken.updateMany(
                { user: stored.user, revokedAt: null },
                { revokedAt: new Date() }
            );
            clearRefreshCookie(res);
            return res.status(401).json({
                success: false,
                message: "Refresh token has been revoked"
            });
        }

        if (stored.expiresAt.getTime() <= Date.now()) {
            clearRefreshCookie(res);
            return res.status(401).json({
                success: false,
                message: "Refresh token has expired"
            });
        }

        const user = await User.findById(stored.user);

        if (!user) {
            clearRefreshCookie(res);
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.suspended) {
            clearRefreshCookie(res);
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended. Contact support."
            });
        }

        // Rotate: revoke the used token and issue a brand new pair.
        stored.revokedAt = new Date();
        await stored.save();

        const token = await issueSession(user, req, res);

        return res.status(200).json({
            success: true,
            message: "Session refreshed",
            token,
            user: publicUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error refreshing session",
            error: error.message
        });
    }
};

// @desc    Revoke the current refresh token and clear the cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
    try {
        const rawToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : null;

        if (rawToken) {
            await RefreshToken.updateOne(
                { tokenHash: hashToken(rawToken), revokedAt: null },
                { revokedAt: new Date() }
            );
        }

        clearRefreshCookie(res);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging out",
            error: error.message
        });
    }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};