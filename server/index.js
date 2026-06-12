// Express server entry point
// Connects to MongoDB and mounts all API routes

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const memoryStore = {
    tasks: [],
    habits: [],
    focus: [],
};

function resetMemoryStore() {
    memoryStore.tasks = [];
    memoryStore.habits = [];
    memoryStore.focus = [];
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const isMongoReady = () => mongoose.connection.readyState === 1;

function memoryFallback(req, res, next) {
    if (isMongoReady() || req.path === "/api/health") return next();

    const pathWithoutApi = req.path.startsWith("/api") ? req.path.substring(4) : req.path;
    const [resource, id, action] = pathWithoutApi.replace(/^\/+/, "").split("/");
    const collection = resource === "focus" ? memoryStore.focus : memoryStore[resource];
    if (!collection) return next();

    // Decode token if present to isolate data in-memory
    let userId = "guest";
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (token) {
        try {
            const secret = process.env.JWT_SECRET || "default_jwt_secret_flow_app";
            const decoded = jwt.verify(token, secret);
            userId = decoded.id;
        } catch (err) {
            // invalid token
            return res.status(401).json({ message: "Token is not valid" });
        }
    }

    if (req.method === "GET") {
        // Return only items belonging to current user or guest
        const userItems = collection.filter((item) => item.userId === userId);
        return res.json(userItems);
    }

    if (req.method === "POST") {
        if (resource === "habits" && action === "checkin") {
            const habit = collection.find((item) => item._id === id && item.userId === userId);
            if (!habit) return res.status(404).json({ message: "Habit not found" });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const done = habit.completions?.some(
                (date) => new Date(date).toDateString() === today.toDateString()
            );
            habit.completions = done
                ? habit.completions.filter((date) => new Date(date).toDateString() !== today.toDateString())
                : [...(habit.completions || []), today.toISOString()];
            return res.json(habit);
        }

        const item = {
            _id: createId(),
            userId: userId,
            ...req.body,
            createdAt: new Date().toISOString(),
        };
        const userItemsCount = collection.filter((item) => item.userId === userId).length;
        if (resource === "tasks") item.order = userItemsCount;
        if (resource === "habits") {
            item.completions = item.completions || [];
            item.isActive = item.isActive ?? true;
        }
        if (resource === "focus") item.startedAt = item.startedAt || new Date().toISOString();
        collection.unshift(item);
        return res.status(201).json(item);
    }

    if (req.method === "PUT") {
        if (resource === "tasks" && id === "reorder" && action === "batch") {
            const orders = req.body.tasks || [];
            orders.forEach(({ id: taskId, order }) => {
                const task = collection.find((item) => item._id === taskId && item.userId === userId);
                if (task) task.order = order;
            });
            return res.json({ message: "Tasks reordered successfully" });
        }

        const index = collection.findIndex((item) => item._id === id && item.userId === userId);
        if (index === -1) return res.status(404).json({ message: `${resource} item not found` });
        collection[index] = { ...collection[index], ...req.body, updatedAt: new Date().toISOString() };
        return res.json(collection[index]);
    }

    if (req.method === "DELETE") {
        const index = collection.findIndex((item) => item._id === id && item.userId === userId);
        if (index === -1) return res.status(404).json({ message: `${resource} item not found` });
        collection.splice(index, 1);
        return res.json({ message: `${resource} item deleted` });
    }

    return next();
}

// Connect to database outside tests. Tests use the in-memory API fallback.
if (process.env.NODE_ENV !== "test") {
    connectDB();
}

// Apply memory fallback for API calls if MongoDB is disconnected
app.use(memoryFallback);

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/habits", require("./routes/habits"));
app.use("/api/focus", require("./routes/focus"));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: isMongoReady() ? "mongodb" : "memory",
        timestamp: new Date().toISOString(),
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = { app, memoryStore, resetMemoryStore };
