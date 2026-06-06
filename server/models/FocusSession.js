// Focus session model — stores Pomodoro / deep work sessions
// Tracks duration, completion status, and associated task

const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        duration: {
            type: Number, // in minutes
            required: true,
            default: 25,
        },
        breakDuration: {
            type: Number, // in minutes
            default: 5,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        endedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("FocusSession", focusSessionSchema);
