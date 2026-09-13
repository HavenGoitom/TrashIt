import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (username, role) => {
    return jwt.sign({ username, role }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

// Strong password validation
const WEAK_PASSWORDS = ["password", "12345678", "qwerty", "password123", "123456789", "qwerty123", "abc12345", "password1", "iloveyou", "admin123"];

function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push("Password must contain at least one special character (!@#$%^&*)");
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) errors.push("Password is too common or weak");
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

        const token = generateToken(user.username, user.role);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
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
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.suspended) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended. Contact support."
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user.username, user.role);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging in",
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