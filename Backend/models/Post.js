import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        images: [
            {
                type: String
            }
        ],
        type: {
            type: String,
            required: [true, "Post type is required"],
            enum: ["sell", "buy"]
        },
        price: {
            fixed: {
                type: Number,
                min: [0, "Price cannot be negative"]
            },
            min: {
                type: Number,
                min: [0, "Minimum price cannot be negative"]
            },
            max: {
                type: Number,
                min: [0, "Maximum price cannot be negative"]
            }
        },
        quantity: {
            fixed: {
                type: Number,
                min: [0, "Quantity cannot be negative"]
            },
            min: {
                type: Number,
                min: [0, "Minimum quantity cannot be negative"]
            },
            max: {
                type: Number,
                min: [0, "Maximum quantity cannot be negative"]
            }
        },
        location: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["active", "sold", "closed"],
            default: "active"
        },
        statusHistory: [
            {
                status: String,
                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        }
    },
    {
        timestamps: true
    }
);

postSchema.pre("validate", function () {
    const { price, quantity } = this;

    const hasPrice = price.fixed || price.min || price.max;
    if (!hasPrice) {
        this.invalidate("price", "At least one price field (fixed, min, or max) is required");
    }
    if (price.min && price.max && price.min > price.max) {
        this.invalidate("price", "Minimum price cannot be greater than maximum price");
    }

    const hasQuantity = quantity.fixed || quantity.min || quantity.max;
    if (!hasQuantity) {
        this.invalidate("quantity", "At least one quantity field (fixed, min, or max) is required");
    }
    if (quantity.min && quantity.max && quantity.min > quantity.max) {
        this.invalidate("quantity", "Minimum quantity cannot be greater than maximum quantity");
    }
});

// Track status changes
postSchema.pre("save", function () {
    if (this.isModified("status") && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });
    }
});

const Post = mongoose.model("Post", postSchema);

export default Post;