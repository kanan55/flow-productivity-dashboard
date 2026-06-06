// Daily Planner — task organization and planning
// Shows tasks for the day organized by priority
// Users can plan their work schedule

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Zap, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";

export default function DailyPlanner() {
    const { state } = useApp();
    const { tasks } = state;

    // Get tasks for today or with upcoming deadlines
    const todayTasks = useMemo(() => {
        const today = new Date().toDateString();
        return tasks
            .filter((t) => t.status !== "completed")
            .sort((a, b) => {
                // Sort by priority then deadline
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                if (a.deadline && b.deadline) {
                    return new Date(a.deadline) - new Date(b.deadline);
                }
                return a.deadline ? -1 : 1;
            });
    }, [tasks]);

    // Calculate summary
    const summary = useMemo(() => {
        const completed = tasks.filter((t) => t.status === "completed").length;
        const pending = tasks.filter((t) => t.status !== "completed").length;
        const high = tasks.filter((t) => t.priority === "high" && t.status !== "completed").length;
        return { completed, pending, high };
    }, [tasks]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="font-display text-3xl text-surface-900 dark:text-surface-50">
                    Daily Plan
                </h1>
                <p className="text-surface-500 mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {/* Tasks for today */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-accent" />
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                        Today's Tasks
                    </h3>
                </div>

                {todayTasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3 opacity-60" />
                        <p className="text-surface-500">No tasks for today. Enjoy the peace!</p>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {todayTasks.map((task, i) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`
                                    p-4 rounded-xl border
                                    ${task.priority === "high"
                                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                        : task.priority === "medium"
                                            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                                            : "bg-surface-50 dark:bg-surface-900/30 border-surface-200 dark:border-surface-800"
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-surface-900 dark:text-surface-50">
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-sm text-surface-500 mt-1">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className={`
                                                text-[10px] px-2 py-1 rounded-md font-medium
                                                ${task.priority === "high"
                                                    ? "bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200"
                                                    : task.priority === "medium"
                                                        ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200"
                                                        : "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200"
                                                }
                                            `}>
                                                {task.priority}
                                            </span>
                                            {task.category && (
                                                <span className="text-[10px] px-2 py-1 rounded-md bg-accent/10 text-accent font-medium">
                                                    {task.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {task.deadline && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-surface-400">
                                                {new Date(task.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            <Card hover={false} className="!bg-surface-50 dark:!bg-surface-900/50">
                <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-surface-400" />
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Progress Summary
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-lg font-bold text-emerald-500">{summary.completed}</p>
                        <p className="text-xs text-surface-400">Completed</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-orange-500">{summary.pending}</p>
                        <p className="text-xs text-surface-400">Pending</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-red-500">{summary.high}</p>
                        <p className="text-xs text-surface-400">High Priority</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
