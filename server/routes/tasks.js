// Task routes — full CRUD operations
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// All routes require auth
router.use(auth);

// GET all tasks — supports ?status= and ?category= filters
router.get("/", async (req, res) => {
    try {
        const filter = { userId: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;

        const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create a new task
router.post("/", async (req, res) => {
    try {
        const { title, description, category, priority, deadline } = req.body;

        // Auto-assign order value (append to end)
        const count = await Task.countDocuments({ userId: req.user.id });
        const task = new Task({
            userId: req.user.id,
            title,
            description,
            category,
            priority,
            deadline,
            order: count,
        });

        const saved = await task.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update a task
router.put("/:id", async (req, res) => {
    try {
        const updates = { ...req.body };

        // If marking as completed, record the timestamp
        if (updates.status === "completed" && !updates.completedAt) {
            updates.completedAt = new Date();
        }

        // If reopening a task, clear completedAt
        if (updates.status && updates.status !== "completed") {
            updates.completedAt = null;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            updates,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT reorder tasks (for drag-and-drop)
router.put("/reorder/batch", async (req, res) => {
    try {
        const { tasks } = req.body; // Array of { id, order }

        const bulkOps = tasks.map((t) => ({
            updateOne: {
                filter: { _id: t.id, userId: req.user.id },
                update: { order: t.order },
            },
        }));

        await Task.bulkWrite(bulkOps);
        res.json({ message: "Tasks reordered successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
