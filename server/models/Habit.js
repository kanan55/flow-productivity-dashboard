// Habit model — tracks daily habits with completion history
// Stores individual check-in dates for streak calculation

const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Habit name is required"],
            trim: true,
            maxlength: 100,
        },
        icon: {
            type: String,
            default: "target", // lucide icon name
        },
        color: {
            type: String,
            default: "#6366f1",
        },
        frequency: {
            type: String,
            enum: ["daily", "weekdays", "weekly"],
            default: "daily",
        },
        // Array of dates when the habit was completed
        completions: [
            {
                type: Date,
            },
        ],
        // Current streak count (calculated on read)
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Habit", habitSchema);
