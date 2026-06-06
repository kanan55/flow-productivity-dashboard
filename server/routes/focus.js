// Focus session routes
const express = require("express");
const router = express.Router();
const FocusSession = require("../models/FocusSession");
const auth = require("../middleware/auth");

// All routes require auth
router.use(auth);

// GET recent focus sessions (last 30 days)
router.get("/", async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessions = await FocusSession.find({
            userId: req.user.id,
            startedAt: { $gte: thirtyDaysAgo },
        })
            .populate("taskId", "title category")
            .sort({ startedAt: -1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST start a new focus session
router.post("/", async (req, res) => {
    try {
        const { duration, breakDuration, taskId } = req.body;
        const session = new FocusSession({
            userId: req.user.id,
            duration: duration || 25,
            breakDuration: breakDuration || 5,
            taskId: taskId || null,
            startedAt: new Date(),
        });

        const saved = await session.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT end a focus session
router.put("/:id", async (req, res) => {
    try {
        const session = await FocusSession.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                completed: req.body.completed,
                endedAt: new Date(),
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
