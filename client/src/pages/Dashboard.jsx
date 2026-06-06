// Dashboard page — overview of all productivity metrics
// Shows: productivity score, task summary, habits, recommendations

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    Flame,
    TrendingUp,
    Target,
    Timer,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getTimeOfDay } from "../utils/helpers";
import Card from "../components/ui/Card";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
    const { state, dispatch } = useApp();
    const { tasks, habits, focusSessions } = state;

    // Calculations (memoized to avoid recalculation on every render)
    const completedToday = useMemo(() => tasks.filter(
        (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() === new Date().toDateString()
    ), [tasks]);
    
    const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== "completed"), [tasks]);
    
    const todayFocusMinutes = useMemo(() => focusSessions
        .filter((s) => new Date(s.startedAt).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + (s.duration || 0), 0), [focusSessions]);

    const productivityScore = useMemo(() => {
        // Calculate productivity score: tasks (40%) + focus time (40%) + habits (20%)
        const taskScore = (completedToday.length / Math.max(tasks.length, 1)) * 40;
        const focusScore = Math.min((todayFocusMinutes / 120) * 40, 40);
        const habitScore = (habits.filter((h) =>
            h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
        ).length / Math.max(habits.length, 1)) * 20;
        return Math.round(taskScore + focusScore + habitScore);
    }, [tasks, habits, completedToday, todayFocusMinutes]);

    const greeting = () => {
        const time = getTimeOfDay();
        const greetings = {
            morning: "Good morning",
            afternoon: "Good afternoon",
            evening: "Good evening",
            night: "Good night",
        };
        return greetings[time] || "Hello";
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <motion.div variants={item}>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-surface-900 dark:text-surface-50">
                    {greeting()}
                </h1>
                <p className="text-surface-500 mt-1">
                    Here's your productivity overview for today
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <StatCard
                    icon={<CheckCircle2 size={20} />}
                    label="Completed Today"
                    value={completedToday.length}
                    accent="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    icon={<Clock size={20} />}
                    label="Pending Tasks"
                    value={pendingTasks.length}
                    accent="text-sky-500"
                    bg="bg-sky-500/10"
                />
                <StatCard
                    icon={<Timer size={20} />}
                    label="Focus Time"
                    value={todayFocusMinutes > 0 ? `${todayFocusMinutes} min` : "0 min"}
                    accent="text-violet-500"
                    bg="bg-violet-500/10"
                />
                <StatCard
                    icon={<Flame size={20} />}
                    label="Habits Today"
                    value={`${habits.filter((h) =>
                        h.completions?.some(
                            (d) => new Date(d).toDateString() === new Date().toDateString()
                        )
                    ).length}/${habits.length}`}
                    accent="text-orange-500"
                    bg="bg-orange-500/10"
                />
            </motion.div>

            {/* Productivity Score */}
            <motion.div variants={item}>
                <Card hover={false}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Productivity Score
                            </h3>
                            <p className="text-sm text-surface-500">Based on today's activity</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="text-sm text-emerald-500 font-medium">Live</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#e8c547" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                    <filter id="scoreGlow">
                                        <feGaussianBlur stdDeviation="2" result="glow" />
                                        <feMerge>
                                            <feMergeNode in="glow" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    className="text-surface-200 dark:text-surface-800"
                                />
                                <motion.circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                    animate={{
                                        strokeDashoffset: 2 * Math.PI * 42 * (1 - productivityScore / 100),
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                                    filter="url(#scoreGlow)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                                    {productivityScore}%
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            <ScoreBar label="Tasks Completed" value={completedToday.length} max={Math.max(tasks.length, 1)} color="bg-emerald-500" />
                            <ScoreBar label="Focus Minutes" value={todayFocusMinutes} max={120} color="bg-violet-500" />
                            <ScoreBar
                                label="Habits Done"
                                value={habits.filter((h) =>
                                    h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
                                ).length}
                                max={Math.max(habits.length, 1)}
                                color="bg-orange-500"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <QuickAction
                    icon={<Target size={20} />}
                    label="Track Habits"
                    onClick={() => dispatch({ type: "SET_PAGE", payload: "habits" })}
                />
                <QuickAction
                    icon={<Timer size={20} />}
                    label="Start Focus"
                    onClick={() => dispatch({ type: "SET_PAGE", payload: "focus" })}
                />
                <QuickAction
                    icon={<CheckCircle2 size={20} />}
                    label="View Tasks"
                    onClick={() => dispatch({ type: "SET_PAGE", payload: "tasks" })}
                />
            </motion.div>
        </motion.div>
    );
}

// --- Sub-components ---

function StatCard({ icon, label, value, accent, bg }) {
    return (
        <Card className="!p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <span className={accent}>{icon}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
        </Card>
    );
}

function ScoreBar({ label, value, max, color }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-surface-500">{label}</span>
                <span className="text-surface-400">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
            </div>
        </div>
    );
}

function QuickAction({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="
        flex items-center gap-3 p-4 rounded-xl
        bg-white dark:bg-surface-850
        border border-surface-200 dark:border-surface-800
        hover:border-accent/30 hover:shadow-soft
        transition-all duration-200
        group
      "
        >
            <span className="text-surface-500 group-hover:text-accent transition-colors">
                {icon}
            </span>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {label}
            </span>
        </button>
    );
}
