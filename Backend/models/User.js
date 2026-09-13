import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Weak passwords that should be rejected
const WEAK_PASSWORDS = ["password", "12345678", "qwerty", "password123", "123456789", "qwerty123", "abc12345", "password1"];

function validatePasswordStrength(password) {
    if (!password || typeof password !== "string") {
        return "Password is required";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null; // valid
}

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"]
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"]
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        suspended: {
            type: Boolean,
            default: false
        },
        location: {
            type: String,
            trim: true
        },
        bio: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const validationError = validatePasswordStrength(this.password);
    if (validationError) {
        throw new Error(validationError);
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.validatePasswordStrength = validatePasswordStrength;

const User = mongoose.model("User", userSchema);

export default User;