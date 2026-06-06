// Navigation sidebar — collapses on mobile
// Highlights current page with accent indicator

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    Target,
    Timer,
    BarChart3,
    Zap,
    Sun,
    Moon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "planner", label: "Daily Plan", icon: Calendar },
    { id: "habits", label: "Habits", icon: Target },
    { id: "focus", label: "Focus", icon: Timer },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ isMobile = false, onNavigate }) {
    const { state, dispatch, logout, login, register, toggleTheme } = useApp();
    const [authOpen, setAuthOpen] = useState(false);

    const handleNavClick = (pageId) => {
        dispatch({ type: "SET_PAGE", payload: pageId });
        // Close mobile menu when a nav item is tapped
        if (onNavigate) onNavigate();
    };

    const handleAuthSuccess = async ({ email, password, isLogin }) => {
        if (isLogin) {
            await login(email, password);
        } else {
            await register(email, password);
        }
    };

    return (
        <>
            <aside
                className={`
                    ${isMobile
                        ? "relative w-full h-full"
                        : "fixed left-0 top-0 bottom-0 z-40 w-56"
                    }
                    bg-white dark:bg-surface-900
                    border-r border-surface-200 dark:border-surface-800
                    flex flex-col
                `}
            >
                {/* Logo */}
                <div className="p-5 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                            <Zap size={16} className="text-surface-900" />
                        </div>
                        <span className="font-display text-xl tracking-tight text-surface-900 dark:text-surface-50">
                            Flow
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const isActive = state.currentPage === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`
                                        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? "text-surface-900 dark:text-surface-50"
                                            : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                                        }
                                    `}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId={isMobile ? "sidebar-active-mobile" : "sidebar-active"}
                                            className="absolute inset-0 bg-accent/10 dark:bg-accent/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId={isMobile ? "sidebar-bar-mobile" : "sidebar-bar"}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}

                                    <Icon size={18} className="relative z-10" />
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}
                    </LayoutGroup>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-surface-200 dark:border-surface-800 space-y-3">
                    <div className="flex items-center justify-between">
                        {/* Profile Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-accent">
                                    {state.user ? state.user.email[0].toUpperCase() : "G"}
                                </span>
                            </div>
                            <div className="flex flex-col min-w-0 leading-tight">
                                <span className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate max-w-[95px]">
                                    {state.user ? state.user.email.split("@")[0] : "Guest"}
                                </span>
                                <button
                                    onClick={state.user ? logout : () => setAuthOpen(true)}
                                    className="text-[10px] text-accent font-bold hover:underline text-left mt-0.5"
                                >
                                    {state.user ? "Log Out" : "Log In"}
                                </button>
                            </div>
                        </div>

                        {/* Light / Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-500 hover:text-surface-950 dark:hover:text-surface-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            title={state.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {state.darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>

                    {/* Visual Theme Selection */}
                    <div className="pt-2 border-t border-surface-100 dark:border-surface-850 space-y-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-bold block px-1">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {/* Auth Modal Overlay */}
            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />
        </>
    );
}
