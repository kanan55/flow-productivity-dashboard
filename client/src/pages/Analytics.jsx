// Analytics Dashboard — visual charts and productivity metrics
// Shows: task completion over time, focus time trends, habit consistency

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Clock, CheckCircle2, Flame, Award } from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateStreak } from "../utils/helpers";
import Card from "../components/ui/Card";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#f97316", "#38bdf8"];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

// Moved outside component to prevent Recharts remounting on every render
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-surface-400">{label}</p>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                {payload[0].value} {payload[0].dataKey === "minutes" ? "min" : ""}
            </p>
        </div>
    );
}

function ChartEmptyState({ message }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-surface-850/70 rounded-xl z-10">
            <p className="text-sm text-surface-400 text-center px-4">{message}</p>
        </div>
    );
}

export default function Analytics() {
    const { state } = useApp();
    const { tasks, habits, focusSessions } = state;

    // Calculate productivity score: tasks (40%) + focus time (40%) + habits (20%)
    const completedToday = tasks.filter(
        (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() === new Date().toDateString()
    );
    const todayFocusMinutes = focusSessions
        .filter((s) => new Date(s.startedAt).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + (s.duration || 0), 0);
    const taskScore = (completedToday.length / Math.max(tasks.length, 1)) * 40;
    const focusScore = Math.min((todayFocusMinutes / 120) * 40, 40);
    const habitScore = (habits.filter((h) =>
        h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
    ).length / Math.max(habits.length, 1)) * 20;
    const productivityScore = Math.round(taskScore + focusScore + habitScore);

    // --- Task completion data (last 7 days) ---
    const taskChartData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const completed = tasks.filter(
                (t) =>
                    t.status === "completed" &&
                    t.completedAt &&
                    new Date(t.completedAt) >= d &&
                    new Date(t.completedAt) < nextDay
            ).length;

            return {
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                tasks: completed,
            };
        });
    }, [tasks]);

    // --- Focus time data (last 7 days) ---
    const focusChartData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const minutes = focusSessions
                .filter((s) => {
                    const sd = new Date(s.startedAt);
                    return sd >= d && sd < nextDay;
                })
                .reduce((sum, s) => sum + (s.duration || 0), 0);

            return {
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                minutes,
            };
        });
    }, [focusSessions]);

    // --- Category distribution ---
    const categoryData = useMemo(() => {
        const counts = {};
        tasks.forEach((t) => {
            counts[t.category] = (counts[t.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    // --- Summary stats ---
    const totalCompleted = tasks.filter((t) => t.status === "completed").length;
    const totalFocusHours = (
        focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    ).toFixed(1);
    const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completions)));
    const totalSessions = focusSessions.length;
    const hasTaskData = taskChartData.some((d) => d.tasks > 0);
    const hasFocusData = focusChartData.some((d) => d.minutes > 0);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
            {/* Header */}
            <motion.div variants={item}>
                <h1 className="font-display text-3xl text-surface-900 dark:text-surface-50">
                    Analytics
                </h1>
                <p className="text-surface-500 mt-1">Insights into your productivity patterns</p>
            </motion.div>

            {/* Summary cards */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard icon={<Award size={20} />} label="Score" value={productivityScore} suffix="/100" color="text-accent" bg="bg-accent/10" />
                <SummaryCard icon={<CheckCircle2 size={20} />} label="Tasks Done" value={totalCompleted} color="text-emerald-500" bg="bg-emerald-500/10" />
                <SummaryCard icon={<Clock size={20} />} label="Focus Hours" value={totalFocusHours} suffix="h" color="text-violet-500" bg="bg-violet-500/10" />
                <SummaryCard icon={<Flame size={20} />} label="Best Streak" value={bestStreak} suffix="d" color="text-orange-500" bg="bg-orange-500/10" />
            </motion.div>

            {/* Charts grid */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Task Completion Chart */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Tasks Completed
                            </h3>
                            <span className="text-xs text-surface-400 ml-auto">Last 7 days</span>
                        </div>
                        <div className="relative">
                            {!hasTaskData && <ChartEmptyState message="Complete tasks to see your progress here" />}
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={taskChartData}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "var(--theme-ink)" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "var(--theme-ink)" }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                                        {taskChartData.map((_, i) => (
                                            <Cell key={i} fill={i === taskChartData.length - 1 ? "#e8c547" : "#6366f1"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Focus Time Chart */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-violet-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Focus Time
                            </h3>
                            <span className="text-xs text-surface-400 ml-auto">Last 7 days</span>
                        </div>
                        <div className="relative">
                            {!hasFocusData && <ChartEmptyState message="Start a focus session to track your time" />}
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={focusChartData}>
                                    <defs>
                                        <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "var(--theme-ink)" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "var(--theme-ink)" }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#focusGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Category Distribution */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-sky-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Task Categories
                            </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <ResponsiveContainer width={140} height={140}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {categoryData.map((cat, i) => (
                                    <div key={cat.name} className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="text-xs text-surface-600 dark:text-surface-400">
                                            {cat.name}
                                        </span>
                                        <span className="text-xs font-semibold text-surface-900 dark:text-surface-50 ml-auto">
                                            {cat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Habit Consistency */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <Flame size={16} className="text-orange-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Habit Streaks
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {habits.map((habit) => {
                                const streak = calculateStreak(habit.completions);
                                const maxStreak = 30; // visual max
                                const pct = Math.min((streak / maxStreak) * 100, 100);

                                return (
                                    <div key={habit._id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-surface-700 dark:text-surface-300">
                                                {habit.name}
                                            </span>
                                            <span className="text-xs font-mono text-surface-400">
                                                {streak}d
                                            </span>
                                        </div>
                                        <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: habit.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {habits.length === 0 && (
                                <p className="text-sm text-surface-400 text-center py-4">
                                    No habits tracked yet
                                </p>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Productivity Score Detail */}
            <motion.div variants={item}>
                <Card hover={false}>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-4">
                        Score Breakdown
                    </h3>
                    <div className="space-y-4">
                        <ScoreRow label="Task Completion" value={tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 40) : 0} max={40} color="bg-emerald-500" />
                        <ScoreRow label="Focus Time" value={Math.min(30, Math.round((parseFloat(totalFocusHours) / 2) * 30))} max={30} color="bg-violet-500" />
                        <ScoreRow
                            label="Habit Consistency"
                            value={habits.length > 0 ? Math.round(
                                (habits.filter((h) =>
                                    h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
                                ).length / habits.length) * 30
                            ) : 0}
                            max={30}
                            color="bg-orange-500"
                        />
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}

// --- Sub-components ---

function SummaryCard({ icon, label, value, suffix = "", color, bg }) {
    return (
        <Card className="!p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <span className={color}>{icon}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {value}
                <span className="text-sm font-normal text-surface-400">{suffix}</span>
            </p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
        </Card>
    );
}

function ScoreRow({ label, value, max, color }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-surface-600 dark:text-surface-400">{label}</span>
                <span className="font-mono text-surface-900 dark:text-surface-50">
                    {value}/{max}
                </span>
            </div>
            <div className="h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
