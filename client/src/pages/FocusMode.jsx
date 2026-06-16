// Focus Mode — Pomodoro timer with distraction-free UI
// Features: customizable timer, break sessions, session history, motivational quotes

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Timer, Coffee, Flame, Volume2, VolumeX, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import { generateId } from "../utils/helpers";
import Card from "../components/ui/Card";

const PRESETS = [
    { label: "25 min", minutes: 25 },
    { label: "45 min", minutes: 45 },
    { label: "60 min", minutes: 60 },
    { label: "90 min", minutes: 90 },
];

const QUOTES = [
    "Deep work is the superpower of the 21st century.",
    "Focus is a matter of deciding what things you're not going to do.",
    "The secret of getting ahead is getting started.",
    "Your focus determines your reality.",
    "Concentrate all your thoughts upon the work at hand.",
    "It's not about having time. It's about making time.",
];

export default function FocusMode() {
    const {
        state,
        dispatch,
        timer,
        focusDuration,
        setFocusDuration,
        breakDuration,
        setBreakDuration,
        isBreak,
        setIsBreak,
        soundEnabled,
        setSoundEnabled
    } = useApp();

    const [customFocus, setCustomFocus] = useState(focusDuration);
    const [customBreak, setCustomBreak] = useState(breakDuration);
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Dynamic sessions completed for today (persists across tab switch & page reload, resets daily)
    const sessionsCompleted = useMemo(() => {
        const todayStr = new Date().toDateString();
        return state.focusSessions.filter(
            (s) => new Date(s.startedAt || s.createdAt).toDateString() === todayStr && s.completed
        ).length;
    }, [state.focusSessions]);

    const handleStartPause = () => {
        if (timer.isRunning) {
            timer.pause();
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "rest", message: "Paused. I will keep the spot warm." },
            });
        } else {
            timer.start();
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "focus", message: isBreak ? "Break timer started. Breathe easy." : "Focus timer started. I am guarding the quiet." },
            });
        }
    };

    const handleReset = () => {
        timer.reset(isBreak ? breakDuration : focusDuration);
        dispatch({
            type: "PING_COMPANION",
            payload: { mood: "blink", message: "Timer reset." },
        });
    };

    const handleSkip = () => {
        if (isBreak) {
            setIsBreak(false);
            timer.reset(focusDuration);
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "focus", message: "Break skipped. Back to focus." },
            });
        } else {
            setIsBreak(true);
            timer.reset(breakDuration);
            dispatch({
                type: "PING_COMPANION",
                payload: { mood: "rest", message: "Break started. Stretch a little." },
            });
        }
    };

    const handlePreset = (minutes) => {
        setFocusDuration(minutes);
        setCustomFocus(minutes);
        timer.reset(minutes);
        setIsBreak(false);
        dispatch({
            type: "PING_COMPANION",
            payload: { mood: "nod", message: `${minutes} minute focus session selected.` },
        });
    };

    const handleApplyCustom = (e) => {
        e.preventDefault();
        const focusValue = Math.min(Math.max(Number(customFocus) || 1, 1), 180);
        const breakValue = Math.min(Math.max(Number(customBreak) || 1, 1), 60);
        setFocusDuration(focusValue);
        setBreakDuration(breakValue);
        setCustomFocus(focusValue);
        setCustomBreak(breakValue);
        setIsBreak(false);
        timer.reset(focusValue);
        dispatch({
            type: "PING_COMPANION",
            payload: { mood: "spark", message: `Custom timer set: ${focusValue} focus, ${breakValue} break.` },
        });
    };



    // Progress ring calculations
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference * (1 - timer.progress);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl text-surface-900 dark:text-surface-50">
                        Focus Mode
                    </h1>
                    <p className="text-surface-500 mt-1 text-sm sm:text-base">Eliminate distractions. Do deep work.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        {soundEnabled ? (
                            <Volume2 size={16} className="text-surface-500" />
                        ) : (
                            <VolumeX size={16} className="text-surface-400" />
                        )}
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            {sessionsCompleted} sessions
                        </span>
                    </div>
                </div>
            </div>

            {/* Timer */}
            <Card hover={false} className="!p-4 sm:!p-8 text-center">
                {/* Mode indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isBreak ? "break" : "focus"}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                ${isBreak
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                }
              `}
                        >
                            {isBreak ? <Coffee size={14} /> : <Timer size={14} />}
                            {isBreak ? "Break Time" : "Focus Session"}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Circular timer */}
                <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8 w-[220px] h-[220px] sm:w-[300px] sm:h-[300px]">
                    <svg viewBox="0 0 300 300" className="-rotate-90 w-full h-full">
                        {/* Background ring */}
                        <circle
                            cx="150" cy="150" r={radius}
                            fill="none"
                            strokeWidth="6"
                            className="stroke-surface-200 dark:stroke-surface-800"
                        />
                        {/* Progress ring */}
                        <motion.circle
                            cx="150" cy="150" r={radius}
                            fill="none"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset: strokeOffset }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className={isBreak ? "stroke-emerald-500" : "stroke-accent"}
                        />
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-4xl sm:text-6xl font-light tracking-tight text-surface-900 dark:text-surface-50">
                            {String(timer.minutes).padStart(2, "0")}
                            <span className={timer.isRunning ? "animate-pulse-soft" : ""}>:</span>
                            {String(timer.seconds).padStart(2, "0")}
                        </span>
                        <span className="text-xs sm:text-sm text-surface-400 mt-1 sm:mt-2">
                            {isBreak ? "Take a breather" : "Stay focused"}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        <RotateCcw size={18} className="text-surface-500" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartPause}
                        className={`
              p-5 rounded-2xl transition-colors
              ${timer.isRunning
                                ? "bg-surface-800 dark:bg-surface-200"
                                : isBreak
                                    ? "bg-emerald-500"
                                    : "bg-accent"
                            }
            `}
                    >
                        {timer.isRunning ? (
                            <Pause size={24} className="text-white dark:text-surface-900" />
                        ) : (
                            <Play size={24} className="text-white dark:text-surface-900 ml-0.5" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkip}
                        className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        <SkipForward size={18} className="text-surface-500" />
                    </motion.button>
                </div>

                {/* Preset buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.minutes}
                            onClick={() => handlePreset(preset.minutes)}
                            className={`
                px-4 py-2 rounded-xl text-xs font-medium transition-all
                ${focusDuration === preset.minutes && !isBreak
                                    ? "bg-accent text-surface-900"
                                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                                }
              `}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom timer */}
                <motion.form
                    onSubmit={handleApplyCustom}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="focus-custom-timer mt-6"
                >
                    <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                        <SlidersHorizontal size={16} className="text-accent" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Custom Timer</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-3 mt-3">
                        <label className="text-left">
                            <span className="block text-[11px] text-surface-400 mb-1">Focus minutes</span>
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={customFocus}
                                onChange={(e) => setCustomFocus(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:border-accent/50"
                            />
                        </label>
                        <label className="text-left">
                            <span className="block text-[11px] text-surface-400 mb-1">Break minutes</span>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={customBreak}
                                onChange={(e) => setCustomBreak(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:border-accent/50"
                            />
                        </label>
                        <button
                            type="submit"
                            className="col-span-2 sm:col-span-1 self-end px-4 py-2.5 rounded-xl bg-accent text-surface-900 font-medium text-sm hover:bg-accent-light transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </motion.form>
            </Card>

            {/* Motivational quote */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-4"
            >
                <p className="text-sm italic text-surface-400 max-w-md mx-auto">
                    "{quote}"
                </p>
            </motion.div>

            {/* Recent Sessions */}
            <Card hover={false}>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-3">
                    Recent Sessions
                </h3>
                {state.focusSessions.length > 0 ? (
                    <div className="space-y-2">
                        {state.focusSessions.slice(0, 5).map((session) => (
                            <div
                                key={session._id}
                                className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${session.completed ? "bg-emerald-500" : "bg-surface-300"}`} />
                                    <span className="text-sm text-surface-700 dark:text-surface-300">
                                        {session.duration} min
                                        {session.taskId?.title && ` · ${session.taskId.title}`}
                                    </span>
                                </div>
                                <span className="text-xs text-surface-400">
                                    {new Date(session.startedAt || session.createdAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-surface-400 text-center py-4">
                        No sessions completed yet. Start your first timer above!
                    </p>
                )}
            </Card>
        </div>
    );
}
