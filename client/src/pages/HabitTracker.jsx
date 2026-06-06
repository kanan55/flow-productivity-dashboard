// Habit Tracker — track daily habits with visual streaks
// Features: add habits, check-in, view streak calendar, progress bars

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Flame,
    Trophy,
    Check,
    Trash2,
    Dumbbell,
    BookOpen,
    Droplets,
    Code,
    Target,
    Heart,
    Music,
    Palette,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { generateId, calculateStreak } from "../utils/helpers";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

const ICON_MAP = {
    dumbbell: Dumbbell,
    "book-open": BookOpen,
    droplets: Droplets,
    code: Code,
    target: Target,
    heart: Heart,
    music: Music,
    palette: Palette,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);
const COLOR_OPTIONS = ["#10b981", "#f59e0b", "#38bdf8", "#8b5cf6", "#f97316", "#ec4899", "#6366f1", "#ef4444"];

export default function HabitTracker() {
    const { state, addHabit, checkinHabit, deleteHabit } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", icon: "target", color: "#6366f1", frequency: "daily" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleCheckIn = (habitId) => {
        checkinHabit(habitId);
    };

    const handleAddHabit = (e) => {
        e.preventDefault();
        if (!newHabit.name.trim()) return;
        addHabit(newHabit);
        setNewHabit({ name: "", icon: "target", color: "#6366f1", frequency: "daily" });
        setShowModal(false);
    };

    const handleDelete = (id) => {
        deleteHabit(id);
    };

    // Get last 7 days for the mini calendar
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl text-surface-900 dark:text-surface-50">
                        Habits
                    </h1>
                    <p className="text-surface-500 mt-1">Build consistency, one day at a time</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent text-surface-900 rounded-xl font-medium text-sm hover:bg-accent-light transition-colors"
                >
                    <Plus size={16} />
                    New Habit
                </motion.button>
            </div>

            {/* Today's check-in */}
            <Card hover={false}>
                <div className="flex items-center gap-2 mb-4">
                    <Check size={18} className="text-emerald-500" />
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                        Today's Check-in
                    </h3>
                    <span className="text-xs text-surface-400 ml-auto">
                        {state.habits.filter((h) =>
                            h.completions?.some((d) => new Date(d).toDateString() === today.toDateString())
                        ).length}{" "}
                        / {state.habits.length} done
                    </span>
                </div>

                <div className="space-y-2">
                    {state.habits.map((habit) => {
                        const isDone = habit.completions?.some(
                            (d) => new Date(d).toDateString() === today.toDateString()
                        );
                        const Icon = ICON_MAP[habit.icon] || Target;
                        const streak = calculateStreak(habit.completions);

                        return (
                            <motion.div
                                key={habit._id}
                                layout
                                className={`
                  group flex items-center gap-3 p-3 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${isDone
                                        ? "bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20"
                                        : "bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700"
                                    }
                `}
                                onClick={() => handleCheckIn(habit._id)}
                            >
                                {/* Icon */}
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${habit.color}15` }}
                                >
                                    <Icon size={16} style={{ color: habit.color }} />
                                </div>

                                {/* Name + streak */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isDone ? "text-emerald-700 dark:text-emerald-400" : "text-surface-900 dark:text-surface-50"}`}>
                                        {habit.name}
                                    </p>
                                    {streak > 0 && (
                                        <p className="text-[11px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <Flame size={10} className="text-orange-500" />
                                            {streak} day streak
                                        </p>
                                    )}
                                </div>

                                {/* Check indicator */}
                                <motion.div
                                    animate={{ scale: isDone ? 1 : 0.8 }}
                                    className={`
                    w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isDone ? "bg-emerald-500" : "bg-surface-200 dark:bg-surface-800"}
                  `}
                                >
                                    {isDone && <Check size={14} className="text-white" />}
                                </motion.div>

                                {/* Delete — always visible on mobile */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(habit._id); }}
                                    className="p-1.5 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                >
                                    <Trash2 size={12} className="text-surface-400" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {state.habits.length === 0 && (
                    <div className="text-center py-8">
                        <Target size={32} className="mx-auto text-surface-300 dark:text-surface-700 mb-2" />
                        <p className="text-sm text-surface-500">No habits yet. Start building your routine!</p>
                    </div>
                )}
            </Card>

            {/* 7-Day Overview */}
            <Card hover={false}>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-4">
                    7-Day Overview
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left text-xs text-surface-400 pb-2 pr-4 font-normal">Habit</th>
                                {last7Days.map((d, i) => (
                                    <th key={i} className="text-center text-xs text-surface-400 pb-2 font-normal w-9">
                                        {d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {state.habits.map((habit) => (
                                <tr key={habit._id}>
                                    <td className="py-1.5 pr-4">
                                        <span className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate block max-w-[120px]">
                                            {habit.name}
                                        </span>
                                    </td>
                                    {last7Days.map((d, i) => {
                                        const done = habit.completions?.some(
                                            (c) => new Date(c).toDateString() === d.toDateString()
                                        );
                                        const isToday = d.toDateString() === today.toDateString();
                                        return (
                                            <td key={i} className="text-center py-1.5 px-0.5">
                                                <div
                                                    className={`
                            w-7 h-7 rounded-lg mx-auto flex items-center justify-center
                            ${done
                                                            ? "bg-emerald-500/20"
                                                            : isToday
                                                                ? "bg-accent/10 border border-accent/30"
                                                                : "bg-surface-100 dark:bg-surface-800"
                                                        }
                          `}
                                                >
                                                    {done && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Habit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Habit">
                <form onSubmit={handleAddHabit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={newHabit.name}
                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                            placeholder="e.g., Morning meditation"
                            autoFocus
                            className="
                mt-1.5 w-full px-3.5 py-2.5 rounded-xl
                bg-surface-50 dark:bg-surface-900
                border border-surface-200 dark:border-surface-800
                text-sm text-surface-900 dark:text-surface-50
                placeholder:text-surface-400
                focus:outline-none focus:border-accent/50
              "
                        />
                    </div>

                    {/* Icon picker */}
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            {ICON_OPTIONS.map((icon) => {
                                const Icon = ICON_MAP[icon];
                                return (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setNewHabit({ ...newHabit, icon })}
                                        className={`
                      w-9 h-9 rounded-xl flex items-center justify-center transition-all
                      ${newHabit.icon === icon
                                                ? "bg-accent/20 ring-2 ring-accent"
                                                : "bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                                            }
                    `}
                                    >
                                        <Icon size={16} className="text-surface-600 dark:text-surface-400" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Color
                        </label>
                        <div className="flex gap-2 mt-1.5">
                            {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewHabit({ ...newHabit, color })}
                                    className={`
                    w-7 h-7 rounded-full transition-all
                    ${newHabit.color === color ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-850" : ""}
                  `}
                                    style={{ backgroundColor: color, ringColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Frequency
                        </label>
                        <div className="flex gap-2 mt-1.5">
                            {["daily", "weekdays", "weekly"].map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setNewHabit({ ...newHabit, frequency: f })}
                                    className={`
                    flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all
                    ${newHabit.frequency === f
                                            ? "bg-accent text-surface-900"
                                            : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
                                        }
                  `}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-accent text-surface-900 font-medium text-sm hover:bg-accent-light transition-colors"
                    >
                        Create Habit
                    </button>
                </form>
            </Modal>
        </div>
    );
}
