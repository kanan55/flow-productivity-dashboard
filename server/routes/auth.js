const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_flow_app";

// In-memory fallback database for users
const memoryUsers = [];
const isMongoReady = () => mongoose.connection.readyState === 1;

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isMongoReady()) {
            // Check for existing user
            let user = await User.findOne({ email: normalizedEmail });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Create new user
            user = new User({
                email: normalizedEmail,
                password,
            });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = { id: user.id };
            jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        visualTheme: user.visualTheme,
                        darkMode: user.darkMode,
                    },
                });
            });
        } else {
            // Memory Fallback Mode
            const userExists = memoryUsers.some(u => u.email === normalizedEmail);
            if (userExists) {
                return res.status(400).json({ message: "User already exists" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                email: normalizedEmail,
                password: hashedPassword,
                visualTheme: "midnight",
                darkMode: true,
            };

            memoryUsers.push(newUser);

            const payload = { id: newUser.id };
            jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        visualTheme: newUser.visualTheme,
                        darkMode: newUser.darkMode,
                    },
                });
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isMongoReady()) {
            // Check for user
            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const payload = { id: user.id };
            jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        visualTheme: user.visualTheme,
                        darkMode: user.darkMode,
                    },
                });
            });
        } else {
            // Memory Fallback Mode
            const user = memoryUsers.find(u => u.email === normalizedEmail);
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const payload = { id: user.id };
            jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        visualTheme: user.visualTheme,
                        darkMode: user.darkMode,
                    },
                });
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error during login" });
    }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
    try {
        if (isMongoReady()) {
            const user = await User.findById(req.user.id).select("-password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({
                id: user.id,
                email: user.email,
                visualTheme: user.visualTheme,
                darkMode: user.darkMode,
            });
        } else {
            // Memory Fallback Mode
            const user = memoryUsers.find(u => u.id === req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({
                id: user.id,
                email: user.email,
                visualTheme: user.visualTheme,
                darkMode: user.darkMode,
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PUT api/auth/preferences
// @desc    Update user theme preferences
// @access  Private
router.put("/preferences", auth, async (req, res) => {
    const { visualTheme, darkMode } = req.body;

    try {
        if (isMongoReady()) {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (visualTheme !== undefined) user.visualTheme = visualTheme;
            if (darkMode !== undefined) user.darkMode = darkMode;

            await user.save();

            res.json({
                id: user.id,
                email: user.email,
                visualTheme: user.visualTheme,
                darkMode: user.darkMode,
            });
        } else {
            // Memory Fallback Mode
            const user = memoryUsers.find(u => u.id === req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (visualTheme !== undefined) user.visualTheme = visualTheme;
            if (darkMode !== undefined) user.darkMode = darkMode;

            res.json({
                id: user.id,
                email: user.email,
                visualTheme: user.visualTheme,
                darkMode: user.darkMode,
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error updating preferences" });
    }
});

module.exports = router;
