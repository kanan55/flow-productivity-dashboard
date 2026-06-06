// Utility functions used across the application

import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";

/**
 * Format a date for display
 * Returns "Today", "Tomorrow", or formatted date string
 */
export function formatDeadline(date) {
    if (!date) return "No deadline";
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isPast(d)) return `Overdue · ${format(d, "MMM d")}`;
    const daysAway = differenceInDays(d, new Date());
    if (daysAway <= 7) return `${format(d, "EEEE")} · ${format(d, "MMM d")}`;
    return format(d, "MMM d, yyyy");
}

/**
 * Get current time of day for AI recommendations
 */
export function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
}

/**
 * Calculate streak from an array of completion dates
 */
export function calculateStreak(completions) {
    if (!completions || completions.length === 0) return 0;

    // Sort dates descending
    const sorted = [...completions]
        .map((d) => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        })
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    // If today is not completed, check from yesterday
    if (sorted[0] !== checkDate) {
        checkDate -= 86400000; // minus 1 day
    }

    for (const date of sorted) {
        if (date === checkDate) {
            streak++;
            checkDate -= 86400000;
        } else if (date < checkDate) {
            break;
        }
    }

    return streak;
}

/**
 * Generate a unique ID (for local-only items)
 */
export function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
}

/**
 * Priority color mapping
 */
export function getPriorityColor(priority) {
    const map = {
        low: "text-sage",
        medium: "text-sky",
        high: "text-ember",
        urgent: "text-rose",
    };
    return map[priority] || "text-sky";
}

/**
 * Priority background for badges
 */
export function getPriorityBg(priority) {
    const map = {
        low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        medium: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    };
    return map[priority] || map.medium;
}

/**
 * Category icon/color mapping
 */
export function getCategoryMeta(category) {
    const map = {
        Work: { color: "#6366f1", bg: "bg-indigo-500/10" },
        Study: { color: "#f59e0b", bg: "bg-amber-500/10" },
        Health: { color: "#10b981", bg: "bg-emerald-500/10" },
        Personal: { color: "#8b5cf6", bg: "bg-violet-500/10" },
    };
    return map[category] || map.Personal;
}
