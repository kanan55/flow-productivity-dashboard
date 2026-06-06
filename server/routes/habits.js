// Habit routes — CRUD + check-in logic
const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");
const auth = require("../middleware/auth");

// All routes require auth
router.use(auth);

// GET all habits
router.get("/", async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create a habit
router.post("/", async (req, res) => {
    try {
        const { name, icon, color, frequency } = req.body;
        const habit = new Habit({
            userId: req.user.id,
            name,
            icon,
            color,
            frequency,
        });
        const saved = await habit.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update a habit
router.put("/:id", async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!habit) return res.status(404).json({ message: "Habit not found" });
        res.json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE (soft delete — set isActive to false)
router.delete("/:id", async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isActive: false },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: "Habit not found" });
        res.json({ message: "Habit archived" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST check-in for today
router.post("/:id/checkin", async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        // Normalize to start of day to avoid duplicate check-ins
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const alreadyCheckedIn = habit.completions.some((date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });

        if (alreadyCheckedIn) {
            // Undo check-in (toggle behavior)
            habit.completions = habit.completions.filter((date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() !== today.getTime();
            });
        } else {
            habit.completions.push(today);
        }

        const updated = await habit.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
