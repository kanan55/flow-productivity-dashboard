// Task model — stores all user tasks with priority, category, deadlines
// Supports: Work, Study, Health, Personal categories
// Priority levels: low, medium, high, urgent

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            enum: ["Work", "Study", "Health", "Personal"],
            default: "Personal",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },
        deadline: {
            type: Date,
            default: null,
        },
        order: {
            type: Number,
            default: 0,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

// Index for faster queries by status and category
taskSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Task", taskSchema);
