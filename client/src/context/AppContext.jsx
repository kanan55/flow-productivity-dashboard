// Global application state using React Context
// Manages: theme, current page, tasks, habits, focus sessions, companion reactions, and authentication
// Syncs with API when logged in, falls back to localStorage for guest users

import { createContext, useContext, useReducer, useEffect, useState, useMemo } from "react";
import { generateId } from "../utils/helpers";
import { authAPI, taskAPI, habitAPI, focusAPI } from "../utils/api";
import { useTimer } from "../hooks/useTimer";

const AppContext = createContext();

// Initial sample data for first-time users
const SAMPLE_TASKS = [
    {
        _id: `guest-${generateId()}`,
        title: "Review quarterly goals",
        description: "Align team objectives with company OKRs",
        category: "Work",
        priority: "high",
        status: "pending",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        order: 0,
        createdAt: new Date().toISOString(),
    },
    {
        _id: `guest-${generateId()}`,
        title: "Read 30 pages of Atomic Habits",
        description: "",
        category: "Personal",
        priority: "medium",
        status: "pending",
        deadline: null,
        order: 1,
        createdAt: new Date().toISOString(),
    },
    {
        _id: `guest-${generateId()}`,
        title: "30-minute morning workout",
        description: "Full body stretching + cardio",
        category: "Health",
        priority: "medium",
        status: "completed",
        deadline: new Date().toISOString(),
        order: 2,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        _id: `guest-${generateId()}`,
        title: "Complete React project module 4",
        description: "Forms, validation, and API integration",
        category: "Study",
        priority: "high",
        status: "in-progress",
        deadline: new Date(Date.now() + 172800000).toISOString(),
        order: 3,
        createdAt: new Date().toISOString(),
    },
];

const SAMPLE_HABITS = [
    {
        _id: `guest-${generateId()}`,
        name: "Morning Workout",
        icon: "dumbbell",
        color: "#10b981",
        frequency: "daily",
        completions: [
            new Date(Date.now() - 86400000 * 6).toISOString(),
            new Date(Date.now() - 86400000 * 5).toISOString(),
            new Date(Date.now() - 86400000 * 4).toISOString(),
            new Date(Date.now() - 86400000 * 3).toISOString(),
            new Date(Date.now() - 86400000 * 2).toISOString(),
            new Date(Date.now() - 86400000).toISOString(),
            new Date().toISOString(),
        ],
        isActive: true,
    },
    {
        _id: `guest-${generateId()}`,
        name: "Read 30 min",
        icon: "book-open",
        color: "#f59e0b",
        frequency: "daily",
        completions: [
            new Date(Date.now() - 86400000 * 4).toISOString(),
            new Date(Date.now() - 86400000 * 3).toISOString(),
            new Date(Date.now() - 86400000).toISOString(),
        ],
        isActive: true,
    },
];

function withCompanion(state, mood, message) {
    return {
        ...state,
        companionEvent: {
            mood,
            message,
            at: Date.now(),
        },
    };
}

// --- playTimerChime function to play custom MP3 sounds ---
function playTimerChime(type = "complete", theme = "midnight") {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    // Set a good loudness
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    // Map theme to its renamed audio file
    const themeSoundMap = {
        midnight: "midnight.mp3",
        sunset: "sunset.mp3",
        forest: "forest.mp3",
        glass: "glass.mp3",
        aurora: "aurora.mp3",
        cat: "cat.mp3"
    };

    const soundFile = themeSoundMap[theme] || "midnight.mp3";
    const url = `${process.env.PUBLIC_URL || ""}/sounds/${soundFile}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(masterGain);
            source.start(now);
        })
        .catch(err => {
            console.error("Failed to play custom sound file:", url, err);
            // Fallback: simple synthesized chime if file isn't loaded
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(type === "complete" ? 880 : 660, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.9);
        });

    window.setTimeout(() => ctx.close?.(), 8000);
    return true;
}

function appReducer(state, action) {
    switch (action.type) {
        // --- Auth ---
        case "SET_AUTH":
            return withCompanion(
                {
                    ...state,
                    user: action.payload.user,
                    token: action.payload.token,
                    darkMode: action.payload.user.darkMode ?? state.darkMode,
                    visualTheme: action.payload.user.visualTheme ?? state.visualTheme,
                },
                "spark",
                `Welcome back! Ready for deep work.`
            );
        case "UPDATE_PREFERENCES":
            return {
                ...state,
                darkMode: action.payload.darkMode,
                visualTheme: action.payload.visualTheme,
            };
        case "LOGOUT":
            return withCompanion(
                {
                    ...state,
                    user: null,
                    token: null,
                    tasks: SAMPLE_TASKS,
                    habits: SAMPLE_HABITS,
                    focusSessions: [],
                },
                "wave",
                "Goodbye! You are now in Guest Mode."
            );

        // --- Theme ---
        case "TOGGLE_THEME":
            return withCompanion(
                { ...state, darkMode: !state.darkMode },
                "spark",
                state.darkMode ? "Sunlight mode. Fresh page energy." : "Night mode. Cozy focus engaged."
            );
        case "SET_VISUAL_THEME": {
            const messages = {
                midnight: "Midnight mode. Premium focus.",
                sunset: "Sunset vibes. Warm creativity.",
                forest: "Forest calm. Grounded energy.",
                glass: "Glass morphism. Modern clarity.",
                aurora: "Aurora dreams. Cosmic inspiration.",
                cat: "Cat theme. Cozy focus and cute meows!",
            };
            return withCompanion(
                {
                    ...state,
                    visualTheme: action.payload,
                },
                "spark",
                messages[action.payload] || "Theme updated."
            );
        }

        // --- Navigation ---
        case "SET_PAGE":
            return withCompanion(
                { ...state, currentPage: action.payload },
                "wave",
                "I am following along."
            );
        case "PING_COMPANION":
            return withCompanion(
                state,
                action.payload?.mood || "wave",
                action.payload?.message || "I am here."
            );

        // --- Tasks ---
        case "SET_TASKS":
            return { ...state, tasks: action.payload };
        case "ADD_TASK":
            return withCompanion(
                { ...state, tasks: [action.payload, ...state.tasks] },
                "spark",
                "New quest added."
            );
        case "UPDATE_TASK":
            return withCompanion({
                ...state,
                tasks: state.tasks.map((t) =>
                    t._id === action.payload._id ? action.payload : t
                ),
            },
                action.payload.status === "completed" ? "celebrate" : "nod",
                action.payload.status === "completed" ? "Task complete. Nice hit." : "Task updated."
            );
        case "DELETE_TASK":
            return withCompanion({
                ...state,
                tasks: state.tasks.filter((t) => t._id !== action.payload),
            }, "blink", "Cleaned up the list.");
        case "REORDER_TASKS":
            return withCompanion({ ...state, tasks: action.payload }, "nod", "Order restored.");

        // --- Habits ---
        case "SET_HABITS":
            return { ...state, habits: action.payload };
        case "ADD_HABIT":
            return withCompanion(
                { ...state, habits: [action.payload, ...state.habits] },
                "spark",
                "A new ritual begins."
            );
        case "UPDATE_HABIT":
            return withCompanion({
                ...state,
                habits: state.habits.map((h) =>
                    h._id === action.payload._id ? action.payload : h
                ),
            }, "celebrate", "Habit status updated.");
        case "DELETE_HABIT":
            return withCompanion({
                ...state,
                habits: state.habits.filter((h) => h._id !== action.payload),
            }, "blink", "Habit removed.");

        // --- Focus Sessions ---
        case "ADD_FOCUS_SESSION":
            return withCompanion({
                ...state,
                focusSessions: [action.payload, ...state.focusSessions],
            }, "celebrate", "Focus session complete. Deep work paid off.");
        case "SET_FOCUS_SESSIONS":
            return { ...state, focusSessions: action.payload };

        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [authLoading, setAuthLoading] = useState(true);
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [isBreak, setIsBreak] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Instantiate global focus timer using the custom hook
    const focusTimer = useTimer(focusDuration);

    // Initial state setup (preloads from local storage if Guest)
    const getInitialState = () => {
        const token = localStorage.getItem("flow-auth-token");
        const localState = localStorage.getItem("flow-app-state");
        const parsedLocal = localState ? JSON.parse(localState) : {};

        return {
            user: null,
            token,
            darkMode: parsedLocal.darkMode ?? true,
            visualTheme: parsedLocal.visualTheme ?? "midnight",
            companionEvent: {
                mood: "wave",
                message: "Ready when you are.",
                at: Date.now(),
            },
            tasks: parsedLocal.tasks ?? SAMPLE_TASKS,
            habits: parsedLocal.habits ?? SAMPLE_HABITS,
            focusSessions: parsedLocal.focusSessions ?? [],
            currentPage: "dashboard",
        };
    };

    const [state, dispatch] = useReducer(appReducer, null, getInitialState);

    // Load user profile and data on startup if token exists
    useEffect(() => {
        const initializeAuth = async () => {
            if (state.token) {
                try {
                    const userData = await authAPI.getMe();
                    const tasks = await taskAPI.getAll();
                    const habits = await habitAPI.getAll();
                    const focusSessions = await focusAPI.getAll();

                    dispatch({ type: "SET_AUTH", payload: { user: userData, token: state.token } });
                    dispatch({ type: "SET_TASKS", payload: tasks });
                    dispatch({ type: "SET_HABITS", payload: habits });
                    dispatch({ type: "SET_FOCUS_SESSIONS", payload: focusSessions });
                } catch (err) {
                    console.error("Token verification failed. Reverting to Guest Mode.", err);
                    localStorage.removeItem("flow-auth-token");
                    dispatch({ type: "LOGOUT" });
                }
            }
            setAuthLoading(false);
        };

        initializeAuth();
        // eslint-disable-next-line
    }, []);

    // Sync theme settings and local storage (for Guest mode)
    useEffect(() => {
        if (!state.token) {
            localStorage.setItem(
                "flow-app-state",
                JSON.stringify({
                    darkMode: state.darkMode,
                    visualTheme: state.visualTheme,
                    tasks: state.tasks,
                    habits: state.habits,
                    focusSessions: state.focusSessions,
                })
            );
        }

        // Apply visual attributes to document
        document.documentElement.classList.toggle("dark", state.darkMode);
        document.documentElement.dataset.theme = state.visualTheme || "midnight";

        const theme = state.visualTheme || "midnight";
        const wallpaperMap = {
            midnight: "/wallpapers/midnight.png",
            sunset: "/wallpapers/sunset.png",
            forest: "/wallpapers/forest.png",
            glass: "/wallpapers/glass.png",
            aurora: "/wallpapers/aurora.png",
            cat: "/wallpapers/cat.png",
        };
        document.body.style.setProperty(
            "--theme-wallpaper",
            `url('${process.env.PUBLIC_URL || ""}${wallpaperMap[theme] || wallpaperMap.midnight}')`
        );
    }, [state.darkMode, state.visualTheme, state.tasks, state.habits, state.focusSessions, state.token]);

    // Async User Actions exposed to layout
    const login = async (email, password) => {
        const res = await authAPI.login(email, password);
        localStorage.setItem("flow-auth-token", res.token);
        dispatch({ type: "SET_AUTH", payload: res });

        // Fetch their database data
        const tasks = await taskAPI.getAll();
        const habits = await habitAPI.getAll();
        const focusSessions = await focusAPI.getAll();

        dispatch({ type: "SET_TASKS", payload: tasks });
        dispatch({ type: "SET_HABITS", payload: habits });
        dispatch({ type: "SET_FOCUS_SESSIONS", payload: focusSessions });
    };

    const register = async (email, password) => {
        const res = await authAPI.register(email, password);
        localStorage.setItem("flow-auth-token", res.token);
        dispatch({ type: "SET_AUTH", payload: res });

        // User is brand new, clear guest data and load default empty state
        dispatch({ type: "SET_TASKS", payload: [] });
        dispatch({ type: "SET_HABITS", payload: [] });
        dispatch({ type: "SET_FOCUS_SESSIONS", payload: [] });
    };

    const logout = () => {
        localStorage.removeItem("flow-auth-token");
        dispatch({ type: "LOGOUT" });
    };

    // Helper functions that coordinate local actions + API sync (if logged in)
    const toggleTheme = async () => {
        dispatch({ type: "TOGGLE_THEME" });
        if (state.token) {
            try {
                await authAPI.updatePreferences({ darkMode: !state.darkMode });
            } catch (err) {
                console.error("Failed to save theme choice", err);
            }
        }
    };

    const setVisualTheme = async (themeId) => {
        dispatch({ type: "SET_VISUAL_THEME", payload: themeId });
        if (state.token) {
            try {
                await authAPI.updatePreferences({ visualTheme: themeId });
            } catch (err) {
                console.error("Failed to save visual theme choice", err);
            }
        }
    };

    const addTask = async (taskData) => {
        if (state.token) {
            const saved = await taskAPI.create(taskData);
            dispatch({ type: "ADD_TASK", payload: saved });
        } else {
            const newTask = {
                _id: `guest-${generateId()}`,
                ...taskData,
                status: "pending",
                order: state.tasks.length,
                createdAt: new Date().toISOString(),
            };
            dispatch({ type: "ADD_TASK", payload: newTask });
        }
    };

    const updateTask = async (taskId, updates) => {
        if (state.token) {
            const updated = await taskAPI.update(taskId, updates);
            dispatch({ type: "UPDATE_TASK", payload: updated });
        } else {
            const original = state.tasks.find((t) => t._id === taskId);
            const updated = { ...original, ...updates };
            if (updates.status === "completed" && !original.completedAt) {
                updated.completedAt = new Date().toISOString();
            }
            if (updates.status && updates.status !== "completed") {
                updated.completedAt = null;
            }
            dispatch({ type: "UPDATE_TASK", payload: updated });
        }
    };

    const deleteTask = async (taskId) => {
        if (state.token) {
            await taskAPI.delete(taskId);
        }
        dispatch({ type: "DELETE_TASK", payload: taskId });
    };

    const reorderTasks = async (reorderedTasks) => {
        dispatch({ type: "REORDER_TASKS", payload: reorderedTasks });
        if (state.token) {
            const batch = reorderedTasks.map((t) => ({ id: t._id, order: t.order }));
            await taskAPI.reorder(batch);
        }
    };

    const addHabit = async (habitData) => {
        if (state.token) {
            const saved = await habitAPI.create(habitData);
            dispatch({ type: "ADD_HABIT", payload: saved });
        } else {
            const newHabit = {
                _id: `guest-${generateId()}`,
                ...habitData,
                completions: [],
                isActive: true,
                createdAt: new Date().toISOString(),
            };
            dispatch({ type: "ADD_HABIT", payload: newHabit });
        }
    };

    const checkinHabit = async (habitId) => {
        if (state.token) {
            const updated = await habitAPI.checkin(habitId);
            dispatch({ type: "UPDATE_HABIT", payload: updated });
        } else {
            const habit = state.habits.find((h) => h._id === habitId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const alreadyDone = habit.completions.some(
                (date) => new Date(date).toDateString() === today.toDateString()
            );

            const updatedCompletions = alreadyDone
                ? habit.completions.filter((date) => new Date(date).toDateString() !== today.toDateString())
                : [...habit.completions, today.toISOString()];

            dispatch({
                type: "UPDATE_HABIT",
                payload: { ...habit, completions: updatedCompletions },
            });
        }
    };

    const deleteHabit = async (habitId) => {
        if (state.token) {
            await habitAPI.delete(habitId);
        }
        dispatch({ type: "DELETE_HABIT", payload: habitId });
    };

    const addFocusSession = async (sessionData) => {
        if (state.token) {
            const saved = await focusAPI.start(sessionData);
            const ended = await focusAPI.end(saved._id, sessionData.completed);
            dispatch({ type: "ADD_FOCUS_SESSION", payload: ended });
        } else {
            const newSession = {
                _id: `guest-${generateId()}`,
                ...sessionData,
                startedAt: new Date().toISOString(),
            };
            dispatch({ type: "ADD_FOCUS_SESSION", payload: newSession });
        }
    };

    const changeFocusDuration = (minutes) => {
        setFocusDuration(minutes);
        if (!focusTimer.isRunning && !isBreak) {
            focusTimer.reset(minutes);
        }
    };

    const changeBreakDuration = (minutes) => {
        setBreakDuration(minutes);
        if (!focusTimer.isRunning && isBreak) {
            focusTimer.reset(minutes);
        }
    };

    // Global Timer Completion Effect
    useEffect(() => {
        if (!focusTimer.isComplete) return;

        if (!isBreak) {
            // Focus session completed
            addFocusSession({
                duration: focusDuration,
                completed: true,
            });

            if (soundEnabled) {
                try { playTimerChime("complete", state?.visualTheme); } catch (e) { console.error(e); }
            }

            setIsBreak(true);
            focusTimer.reset(breakDuration);
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "rest", message: "Focus session done. Take a break!" },
            });
        } else {
            // Break completed
            if (soundEnabled) {
                try { playTimerChime("break", state?.visualTheme); } catch (e) { console.error(e); }
            }

            setIsBreak(false);
            focusTimer.reset(focusDuration);
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "wave", message: "Break done. Ready for the next round." },
            });
        }
    }, [focusTimer.isComplete, isBreak, focusDuration, breakDuration, soundEnabled, state?.visualTheme]);

    // Conditional Tab Title Countdown Effect
    useEffect(() => {
        const defaultTitle = "Flow — Smart Productivity Dashboard";
        if (!state) {
            document.title = defaultTitle;
            return;
        }

        const initialDuration = (isBreak ? breakDuration : focusDuration) * 60;
        const timerHasStarted = focusTimer.isRunning || (focusTimer.totalSeconds < initialDuration && focusTimer.totalSeconds > 0);

        if (state.currentPage === "focus" && timerHasStarted) {
            const formattedTime = `${String(focusTimer.minutes).padStart(2, "0")}:${String(focusTimer.seconds).padStart(2, "0")}`;
            const type = isBreak ? "Break" : "Focus";
            document.title = `${formattedTime} | ${type} | Flow`;
        } else {
            document.title = defaultTitle;
        }
    }, [
        focusTimer.minutes,
        focusTimer.seconds,
        focusTimer.isRunning,
        focusTimer.totalSeconds,
        isBreak,
        focusDuration,
        breakDuration,
        state?.currentPage
    ]);

    return (
        <AppContext.Provider
            value={{
                state,
                dispatch,
                authLoading,
                login,
                register,
                logout,
                toggleTheme,
                setVisualTheme,
                addTask,
                updateTask,
                deleteTask,
                reorderTasks,
                addHabit,
                checkinHabit,
                deleteHabit,
                addFocusSession,
                timer: focusTimer,
                focusDuration,
                setFocusDuration: changeFocusDuration,
                breakDuration,
                setBreakDuration: changeBreakDuration,
                isBreak,
                setIsBreak,
                soundEnabled,
                setSoundEnabled,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
