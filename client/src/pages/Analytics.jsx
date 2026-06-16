// Analytics Dashboard — visual charts and productivity metrics
// Shows: task completion over time, focus time trends, category completion rates, peak activity times, habit consistency, score breakdown

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

const COLORS = ["#6366f1", "#10b981", "#38bdf8", "#8b5cf6", "#f97316", "#ec4899", "#6366f1", "#ef4444"];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-surface-400">{label}</p>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                {payload[0].value} {payload[0].dataKey === "minutes" ? "min" : payload[0].dataKey === "activity" ? "actions" : ""}
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

    // 1. Calculations for Today
    const completedToday = tasks.filter(
        (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() === new Date().toDateString()
    );
    const todayFocusMinutes = focusSessions
        .filter((s) => new Date(s.startedAt || s.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + (s.duration || 0), 0);
    
    const taskScore = (completedToday.length / Math.max(tasks.length, 1)) * 40;
    const focusScore = Math.min((todayFocusMinutes / 120) * 40, 40);
    const habitScore = (habits.filter((h) =>
        h.completions?.some((d) => new Date(d).toDateString() === new Date().toDateString())
    ).length / Math.max(habits.length, 1)) * 20;
    const productivityScore = Math.round(taskScore + focusScore + habitScore);

    // 2. Task completion data (last 7 days)
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

    // 3. Focus time data (last 7 days)
    const focusChartData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const minutes = focusSessions
                .filter((s) => {
                    const sd = new Date(s.startedAt || s.createdAt);
                    return sd >= d && sd < nextDay;
                })
                .reduce((sum, s) => sum + (s.duration || 0), 0);

            return {
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                minutes,
            };
        });
    }, [focusSessions]);

    // 4. Category distribution & completion rate
    const categoryData = useMemo(() => {
        const counts = {};
        tasks.forEach((t) => {
            counts[t.category] = (counts[t.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    const categoryCompletionRates = useMemo(() => {
        const categories = ["Work", "Study", "Health", "Personal"];
        return categories.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            const completed = catTasks.filter(t => t.status === "completed").length;
            const rate = catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0;
            return {
                name: cat,
                completed,
                total: catTasks.length,
                rate
            };
        });
    }, [tasks]);

    // 5. Peak Hours / Activity by Time of Day
    const peakActivityData = useMemo(() => {
        const bins = {
            Morning: 0,   // 5am - 12pm
            Afternoon: 0, // 12pm - 5pm
            Evening: 0,   // 5pm - 9pm
            Night: 0,     // 9pm - 5am
        };

        const getBin = (dateStr) => {
            const hour = new Date(dateStr).getHours();
            if (hour >= 5 && hour < 12) return "Morning";
            if (hour >= 12 && hour < 17) return "Afternoon";
            if (hour >= 17 && hour < 21) return "Evening";
            return "Night";
        };

        tasks.forEach(t => {
            if (t.status === "completed" && t.completedAt) {
                bins[getBin(t.completedAt)]++;
            }
        });

        focusSessions.forEach(s => {
            if (s.startedAt || s.createdAt) {
                bins[getBin(s.startedAt || s.createdAt)]++;
            }
        });

        return Object.entries(bins).map(([name, count]) => ({
            name,
            activity: count,
        }));
    }, [tasks, focusSessions]);

    // 6. Focus Streak calculation
    const focusStreak = useMemo(() => {
        const completions = focusSessions
            .filter((s) => s.completed)
            .map((s) => s.startedAt || s.createdAt);
        return calculateStreak(completions);
    }, [focusSessions]);

    // 7. General stats
    const totalCompleted = tasks.filter((t) => t.status === "completed").length;
    const totalFocusHours = (
        focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    ).toFixed(1);
    const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completions)));
    
    const hasTaskData = taskChartData.some((d) => d.tasks > 0);
    const hasFocusData = focusChartData.some((d) => d.minutes > 0);
    const hasActivityData = peakActivityData.some((d) => d.activity > 0);

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
                <SummaryCard icon={<Clock size={20} />} label="Focus Streak" value={focusStreak} suffix="d" color="text-violet-500" bg="bg-violet-500/10" />
                <SummaryCard icon={<Flame size={20} />} label="Habits Streak" value={bestStreak} suffix="d" color="text-orange-500" bg="bg-orange-500/10" />
            </motion.div>

            {/* Charts grid */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* 1. Task Completion Chart */}
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
                                            <Cell key={i} fill={i === taskChartData.length - 1 ? "var(--theme-accent)" : "#818cf8"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* 2. Focus Time Chart */}
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

                {/* 3. Category Distribution & Completion Rates */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-sky-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Task Categories & Rates
                            </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative flex-shrink-0">
                                {categoryData.length === 0 && <ChartEmptyState message="No tasks yet" />}
                                <ResponsiveContainer width={130} height={130}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={38}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2.5 w-full">
                                {categoryCompletionRates.map((cat, i) => (
                                    <div key={cat.name}>
                                        <div className="flex justify-between text-xs mb-1 font-semibold">
                                            <span className="text-surface-700 dark:text-surface-300">{cat.name}</span>
                                            <span className="text-surface-500">{cat.rate}% ({cat.completed}/{cat.total})</span>
                                        </div>
                                        <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cat.rate}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* 4. Activity by Time of Day (Peak hours) */}
                <motion.div variants={item}>
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-amber-500" />
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                Activity by Time of Day
                            </h3>
                        </div>
                        <div className="relative">
                            {!hasActivityData && <ChartEmptyState message="Complete tasks or focus to see peak activity hours" />}
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={peakActivityData}>
                                    <XAxis
                                        dataKey="name"
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
                                    <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
                                        {peakActivityData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* 5. Habit Consistency */}
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

                {/* 6. Productivity Score Detail */}
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
            </div>
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
