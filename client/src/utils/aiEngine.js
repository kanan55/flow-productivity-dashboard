// AI Recommendation Engine
// Rule-based system that analyzes user behavior and suggests actions
// Improves over time by learning from task completion patterns

import { getTimeOfDay } from "./helpers";

/**
 * Generate personalized recommendations based on current context
 * @param {Object} data - { tasks, habits, focusSessions, completedToday }
 * @returns {Array} recommendations
 */
export function generateRecommendations(data) {
    const { tasks = [], habits = [], focusSessions = [], completedToday = [] } = data;
    const timeOfDay = getTimeOfDay();
    const recommendations = [];

    // --- Time-of-day suggestions ---
    const timeRecs = {
        morning: [
            { text: "Start with your highest-priority task while energy is peak", type: "productivity", icon: "sunrise" },
            { text: "Review your goals for the day and plan your schedule", type: "planning", icon: "calendar" },
            { text: "Morning is ideal for deep, focused work — try a 50-minute session", type: "focus", icon: "brain" },
        ],
        afternoon: [
            { text: "Take a short break to recharge — your focus dips after lunch", type: "health", icon: "coffee" },
            { text: "Tackle collaborative or lighter tasks in the afternoon", type: "productivity", icon: "layers" },
            { text: "Stay hydrated — drink a glass of water now", type: "health", icon: "droplets" },
        ],
        evening: [
            { text: "Wrap up loose ends and plan tomorrow's priorities", type: "planning", icon: "sunset" },
            { text: "Reflect on what you accomplished today — you did great", type: "wellness", icon: "heart" },
            { text: "Wind down with lighter reading or personal time", type: "health", icon: "moon" },
        ],
        night: [
            { text: "Consider winding down — good sleep is the foundation of productivity", type: "health", icon: "moon" },
            { text: "Avoid screens for 30 minutes before bed", type: "health", icon: "eye-off" },
            { text: "Set your top 3 priorities for tomorrow before sleeping", type: "planning", icon: "list" },
        ],
    };

    recommendations.push(...(timeRecs[timeOfDay] || timeRecs.morning));

    // --- Overdue task warnings ---
    const overdueTasks = tasks.filter((t) => {
        if (t.status === "completed" || !t.deadline) return false;
        return new Date(t.deadline) < new Date();
    });

    if (overdueTasks.length > 0) {
        recommendations.push({
            text: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}. Consider rescheduling or tackling them now.`,
            type: "urgent",
            icon: "alert-triangle",
        });
    }

    // --- High priority pending tasks ---
    const urgentPending = tasks.filter(
        (t) => t.priority === "urgent" && t.status !== "completed"
    );
    if (urgentPending.length > 0) {
        recommendations.push({
            text: `"${urgentPending[0].title}" is marked urgent — focus on this first`,
            type: "priority",
            icon: "zap",
        });
    }

    // --- Focus session patterns ---
    const todaySessions = focusSessions.filter((s) => {
        const d = new Date(s.startedAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    });

    const totalFocusMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    if (totalFocusMinutes === 0 && timeOfDay !== "night") {
        recommendations.push({
            text: "You haven't done any focus sessions today. Try a 25-minute Pomodoro to get started.",
            type: "focus",
            icon: "timer",
        });
    } else if (totalFocusMinutes >= 120) {
        recommendations.push({
            text: `Impressive! ${totalFocusMinutes} minutes of focused work today. Take a well-deserved break.`,
            type: "celebration",
            icon: "trophy",
        });
    }

    // --- Habit streak encouragement ---
    habits.forEach((habit) => {
        if (habit.completions && habit.completions.length >= 7) {
            recommendations.push({
                text: `Amazing streak on "${habit.name}"! Keep the momentum going.`,
                type: "motivation",
                icon: "flame",
            });
        }
    });

    // --- Completion momentum ---
    if (completedToday.length >= 5) {
        recommendations.push({
            text: `${completedToday.length} tasks done today! You're on a roll.`,
            type: "celebration",
            icon: "check-circle",
        });
    } else if (completedToday.length === 0 && timeOfDay === "afternoon") {
        recommendations.push({
            text: "No tasks completed yet today. Pick one small task to build momentum.",
            type: "motivation",
            icon: "play",
        });
    }

    // Shuffle slightly and return top 5
    return stableShuffleArray(recommendations).slice(0, 5);
}

/**
 * Generate an "Ideal Day Plan" based on pending tasks
 * @param {Array} tasks - pending tasks
 * @returns {Array} time slots with suggested tasks
 */
export function generateIdealDayPlan(tasks) {
    const pendingTasks = tasks
        .filter((t) => t.status !== "completed")
        .sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });

    const timeSlots = [
        { time: "06:00 - 07:00", label: "Morning Routine", type: "routine" },
        { time: "07:00 - 09:00", label: "Deep Work Block 1", type: "focus" },
        { time: "09:00 - 09:15", label: "Break", type: "break" },
        { time: "09:15 - 11:30", label: "Deep Work Block 2", type: "focus" },
        { time: "11:30 - 12:30", label: "Lunch Break", type: "break" },
        { time: "12:30 - 14:30", label: "Collaborative Work", type: "focus" },
        { time: "14:30 - 14:45", label: "Break", type: "break" },
        { time: "14:45 - 16:30", label: "Task Completion", type: "focus" },
        { time: "16:30 - 17:00", label: "Review & Plan Tomorrow", type: "routine" },
        { time: "17:00 onwards", label: "Personal Time", type: "personal" },
    ];

    let taskIndex = 0;
    return timeSlots.map((slot) => {
        if (slot.type === "focus" && taskIndex < pendingTasks.length) {
            const task = pendingTasks[taskIndex];
            taskIndex++;
            return { ...slot, suggestedTask: task.title, taskId: task._id };
        }
        return slot;
    });
}

/**
 * Calculate a productivity score (0-100) based on today's activity
 */
export function calculateProductivityScore(data) {
    const { tasks = [], focusSessions = [], habits = [] } = data;
    let score = 0;

    // Task completion (40 points max)
    const today = new Date().toDateString();
    const completedToday = tasks.filter(
        (t) => t.status === "completed" && t.completedAt && new Date(t.completedAt).toDateString() === today
    );
    const totalPending = tasks.filter((t) => t.status !== "completed").length + completedToday.length;
    if (totalPending > 0) {
        score += Math.round((completedToday.length / totalPending) * 40);
    }

    // Focus time (30 points max)
    const todaySessions = focusSessions.filter(
        (s) => new Date(s.startedAt).toDateString() === today
    );
    const focusMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    score += Math.min(30, Math.round((focusMinutes / 120) * 30)); // 2 hours = max

    // Habit consistency (30 points max)
    const habitsCompletedToday = habits.filter((h) => {
        return h.completions?.some((d) => new Date(d).toDateString() === today);
    });
    if (habits.length > 0) {
        score += Math.round((habitsCompletedToday.length / habits.length) * 30);
    }

    return Math.min(100, score);
}

// --- Helper ---
// Date-seeded shuffle: stable within the same day, varies across days
function stableShuffleArray(array) {
    const arr = [...array];
    const today = new Date();
    let seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    function seededRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
