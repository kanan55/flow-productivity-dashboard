// Dashboard page — overview of all productivity metrics
// Shows: compact greeting, today at a glance row, tasks checklist, habits checkin row, mini focus timer, weekly activity chart

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Circle,
    Clock,
    Flame,
    Timer,
    Play,
    Pause,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Target,
    ArrowRight,
    Check,
    Dumbbell,
    BookOpen,
    Droplets,
    Code,
    Heart,
    Music,
    Palette
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getTimeOfDay } from "../utils/helpers";
import Card from "../components/ui/Card";

const HABIT_ICONS = {
    dumbbell: Dumbbell,
    "book-open": BookOpen,
    droplets: Droplets,
    code: Code,
    target: Target,
    heart: Heart,
    music: Music,
    palette: Palette,
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
    const {
        state,
        dispatch,
        updateTask,
        checkinHabit,
        timer,
        focusDuration,
        isBreak
    } = useApp();

    const { tasks, habits, focusSessions } = state;
    const [isTimerExpanded, setIsTimerExpanded] = useState(false);

    // 1. Calculations
    const completedToday = useMemo(() => tasks.filter(
        (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() === new Date().toDateString()
    ), [tasks]);
    
    const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== "completed"), [tasks]);
    
    const todayFocusMinutes = useMemo(() => focusSessions
        .filter((s) => new Date(s.startedAt || s.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + (s.duration || 0), 0), [focusSessions]);

    const completedHabitsToday = useMemo(() => habits.filter((h) =>
        h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
    ), [habits]);

    const todayTasks = useMemo(() => {
        const todayStr = new Date().toDateString();
        return tasks.filter((t) => {
            const isDueToday = t.deadline && new Date(t.deadline).toDateString() === todayStr;
            const isPendingNoDeadline = !t.deadline && t.status !== "completed";
            return isDueToday || isPendingNoDeadline;
        });
    }, [tasks]);

    const displayTasks = useMemo(() => todayTasks.slice(0, 5), [todayTasks]);

    const greetingText = () => {
        const time = getTimeOfDay();
        const greetings = {
            morning: "Good morning",
            afternoon: "Good afternoon",
            evening: "Good evening",
            night: "Good night",
        };
        return greetings[time] || "Hello";
    };

    const userName = useMemo(() => {
        if (state.user?.email) {
            return state.user.email.split("@")[0];
        }
        return "";
    }, [state.user]);

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    }, []);

    // 2. Focus Sessions count today
    const focusSessionsCount = useMemo(() => {
        const todayStr = new Date().toDateString();
        return focusSessions.filter(
            (s) => new Date(s.startedAt || s.createdAt).toDateString() === todayStr && s.completed
        ).length;
    }, [focusSessions]);

    // 3. Weekly tasks completion sparkline/chart calculation
    const weeklyCompletions = useMemo(() => {
        const last7Days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            last7Days.push(d);
        }
        
        return last7Days.map(day => {
            const dateStr = day.toDateString();
            const count = tasks.filter(t => 
                t.status === "completed" && 
                t.completedAt && 
                new Date(t.completedAt).toDateString() === dateStr
            ).length;
            return {
                dayLabel: day.toLocaleDateString("en-US", { weekday: "narrow" }),
                count,
            };
        });
    }, [tasks]);

    const maxCompletionCount = useMemo(() => {
        const counts = weeklyCompletions.map(w => w.count);
        return Math.max(...counts, 1);
    }, [weeklyCompletions]);

    // 4. Handlers
    const handleToggleTaskStatus = (task) => {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        updateTask(task._id, {
            status: newStatus,
        });
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
            {/* 1. Header (Compact Greeting + Date) */}
            <motion.div variants={item} className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-50">
                        {greetingText()}{userName ? `, ${userName}` : ""}
                    </h1>
                    <p className="text-xs text-surface-400 font-medium mt-0.5">
                        {formattedDate}
                    </p>
                </div>
            </motion.div>

            {/* 2. Today at a Glance Horizontal Strip */}
            <motion.div variants={item}>
                <Card className="!p-4 bg-white/40 dark:bg-surface-900/40 backdrop-blur-xl border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-soft">
                    <div className="grid grid-cols-2 md:flex md:flex-row md:justify-between md:items-center gap-4">
                        {/* Stat 1: Completed Tasks */}
                        <div className="flex items-center gap-2.5 md:border-r md:border-surface-200/50 dark:md:border-surface-800/50 md:pr-6 md:mr-6 flex-1 justify-start">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{completedToday.length}</p>
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Completed</p>
                            </div>
                        </div>
                        {/* Stat 2: Pending Tasks */}
                        <div className="flex items-center gap-2.5 md:border-r md:border-surface-200/50 dark:md:border-surface-800/50 md:pr-6 md:mr-6 flex-1 justify-start">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                                <Clock size={16} className="text-sky-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{pendingTasks.length}</p>
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Pending</p>
                            </div>
                        </div>
                        {/* Stat 3: Focus Time */}
                        <div className="flex items-center gap-2.5 md:border-r md:border-surface-200/50 dark:md:border-surface-800/50 md:pr-6 md:mr-6 flex-1 justify-start">
                            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <Timer size={16} className="text-violet-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{todayFocusMinutes}m</p>
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Focused</p>
                            </div>
                        </div>
                        {/* Stat 4: Habits Completed */}
                        <div className="flex items-center gap-2.5 flex-1 justify-start">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                <Flame size={16} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
                                    {completedHabitsToday.length}/{habits.length}
                                </p>
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Habits</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* 3. Main Widget Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Column 1: Tasks & Habits */}
                <div className="space-y-5">
                    {/* Today's Tasks Widget */}
                    <motion.div variants={item}>
                        <Card hover={false} className="flex flex-col h-full min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                        Today's Tasks
                                    </h3>
                                    {todayTasks.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent">
                                            {todayTasks.filter(t => t.status !== "completed").length} left
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => dispatch({ type: "SET_PAGE", payload: "tasks" })}
                                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5"
                                >
                                    See all <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2.5">
                                {displayTasks.map((task) => {
                                    const isCompleted = task.status === "completed";
                                    return (
                                        <div
                                            key={task._id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/40 dark:bg-surface-900/20 border border-surface-200/40 dark:border-surface-800/40 hover:border-surface-300 dark:hover:border-surface-700 transition-colors"
                                        >
                                            <button
                                                onClick={() => handleToggleTaskStatus(task)}
                                                className="flex-shrink-0"
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                                ) : (
                                                    <Circle size={18} className="text-surface-300 dark:text-surface-700 hover:text-accent transition-colors" />
                                                )}
                                            </button>
                                            <span
                                                className={`text-sm flex-1 truncate font-medium ${
                                                    isCompleted
                                                        ? "line-through text-surface-400"
                                                        : "text-surface-700 dark:text-surface-300"
                                                }`}
                                            >
                                                {task.title}
                                            </span>
                                            {/* Priority indicator */}
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    task.priority === "urgent" || task.priority === "high"
                                                        ? "bg-rose-500"
                                                        : task.priority === "medium"
                                                            ? "bg-orange-400"
                                                            : "bg-emerald-500"
                                                }`}
                                                title={`Priority: ${task.priority}`}
                                            />
                                        </div>
                                    );
                                })}

                                {todayTasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                        <CheckCircle2 size={36} className="text-surface-300 dark:text-surface-800 mb-2" />
                                        <p className="text-sm text-surface-500 font-medium">No tasks for today</p>
                                        <button
                                            onClick={() => dispatch({ type: "SET_PAGE", payload: "tasks" })}
                                            className="text-xs text-accent font-semibold mt-1 hover:underline"
                                        >
                                            Plan your day →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Habits Widget */}
                    <motion.div variants={item}>
                        <Card hover={false}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                    Habits
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent">
                                    {completedHabitsToday.length}/{habits.length} done
                                </span>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-200 dark:scrollbar-thumb-surface-800">
                                {habits.map((habit) => {
                                    const IconComponent = HABIT_ICONS[habit.icon] || Target;
                                    const isDone = habit.completions?.some(
                                        (d) => new Date(d).toDateString() === new Date().toDateString()
                                    );

                                    return (
                                        <button
                                            key={habit._id}
                                            onClick={() => checkinHabit(habit._id)}
                                            className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
                                        >
                                            <div
                                                className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center border relative transition-all duration-200
                                                    ${isDone
                                                        ? "border-transparent text-white"
                                                        : "border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 bg-white/20 dark:bg-surface-900/10 hover:border-surface-300 dark:hover:border-surface-700"
                                                    }
                                                `}
                                                style={{ backgroundColor: isDone ? habit.color || "#6366f1" : undefined }}
                                            >
                                                <IconComponent size={20} className="transition-transform group-hover:scale-110" />
                                                
                                                {/* Checkmark indicator */}
                                                {isDone && (
                                                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-950 flex items-center justify-center">
                                                        <Check size={10} className="text-white stroke-[3px]" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-semibold text-surface-500 max-w-[64px] truncate text-center">
                                                {habit.name}
                                            </span>
                                        </button>
                                    );
                                })}

                                {habits.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-6 text-center w-full">
                                        <Target size={28} className="text-surface-300 dark:text-surface-800 mb-1" />
                                        <p className="text-xs text-surface-500 font-medium">Build a habit. Start small.</p>
                                        <button
                                            onClick={() => dispatch({ type: "SET_PAGE", payload: "habits" })}
                                            className="text-xs text-accent font-semibold mt-1 hover:underline"
                                        >
                                            Add habit →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Column 2: Focus & Analytics */}
                <div className="space-y-5">
                    {/* Collapsible Focus Timer Widget */}
                    <motion.div variants={item}>
                        <Card hover={false} className="transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                        Focus Timer
                                    </h3>
                                    {focusSessionsCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent">
                                            {focusSessionsCount} completed
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsTimerExpanded(!isTimerExpanded)}
                                    className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
                                >
                                    {isTimerExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {/* Collapsed State */}
                            {!isTimerExpanded && (
                                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-surface-50/40 dark:bg-surface-900/20 border border-surface-200/40 dark:border-surface-800/40">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${timer.isRunning ? "bg-accent/20 animate-pulse text-accent" : "bg-surface-100 dark:bg-surface-800 text-surface-500"}`}>
                                            <Timer size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                                                {timer.isRunning ? (isBreak ? "Break Session" : "Focus Session Running") : "Focus Session"}
                                            </p>
                                            <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
                                                {String(timer.minutes).padStart(2, "0")}:{String(timer.seconds).padStart(2, "0")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => timer.isRunning ? timer.pause() : timer.start()}
                                        className="w-8 h-8 rounded-full bg-accent text-surface-900 flex items-center justify-center hover:bg-accent-light transition-colors"
                                    >
                                        {timer.isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                                    </button>
                                </div>
                            )}

                            {/* Expanded State */}
                            <AnimatePresence>
                                {isTimerExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <div className="flex flex-col items-center justify-center py-4 bg-surface-50/40 dark:bg-surface-900/10 rounded-2xl border border-surface-200/40 dark:border-surface-800/40">
                                            {/* Mode badge */}
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${isBreak ? "bg-emerald-500/15 text-emerald-500" : "bg-violet-500/15 text-violet-500"}`}>
                                                {isBreak ? "Break" : "Focus"}
                                            </span>

                                            {/* Timer Counter */}
                                            <span className="font-display text-4xl font-bold text-surface-900 dark:text-surface-50 mt-3 tabular-nums">
                                                {String(timer.minutes).padStart(2, "0")}:{String(timer.seconds).padStart(2, "0")}
                                            </span>

                                            {/* Progress Bar */}
                                            <div className="w-4/5 h-1 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden mt-4 relative">
                                                <div
                                                    className="h-full bg-accent rounded-full transition-all duration-300"
                                                    style={{ width: `${(timer.progress || 0) * 100}%` }}
                                                />
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-4 mt-5">
                                                <button
                                                    onClick={() => timer.reset(isBreak ? 5 : focusDuration)}
                                                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                                                    title="Reset Timer"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => timer.isRunning ? timer.pause() : timer.start()}
                                                    className="w-11 h-11 rounded-full bg-accent text-surface-900 flex items-center justify-center hover:bg-accent-light shadow-md transition-colors"
                                                >
                                                    {timer.isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                                </button>
                                                <button
                                                    onClick={() => dispatch({ type: "SET_PAGE", payload: "focus" })}
                                                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                                                    title="Fullscreen Timer"
                                                >
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>

                    {/* Weekly Analytics Widget */}
                    <motion.div variants={item}>
                        <Card hover={false}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-surface-900 dark:text-surface-50 font-semibold">
                                    Weekly Activity
                                </h3>
                                <button
                                    onClick={() => dispatch({ type: "SET_PAGE", payload: "analytics" })}
                                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5"
                                >
                                    Details <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="flex items-end justify-between px-2 h-16 pt-2 select-none border-b border-surface-200/50 dark:border-surface-800/50 pb-2">
                                {weeklyCompletions.map((w, idx) => {
                                    const pctHeight = (w.count / maxCompletionCount) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                            {/* Hover tooltip */}
                                            <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-surface-900 dark:bg-surface-800 text-white dark:text-surface-100 text-[10px] px-1.5 py-0.5 rounded shadow-md font-bold whitespace-nowrap z-10">
                                                {w.count} done
                                            </div>

                                            {/* Column Bar */}
                                            <div className="w-2 md:w-3.5 bg-surface-100 dark:bg-surface-800/80 rounded-t-sm h-12 flex items-end overflow-hidden">
                                                <motion.div
                                                    className="w-full bg-accent rounded-t-sm"
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${pctHeight}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                />
                                            </div>

                                            {/* Label */}
                                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mt-1.5 leading-none">
                                                {w.dayLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
