// Main layout wrapper — sidebar + content area
// Handles mobile menu toggle with a bottom tab bar for mobile navigation

import { useState } from "react";
import { Menu, X, LayoutDashboard, CheckSquare, Target, Timer, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import FAB from "./FAB";
import { useApp } from "../context/AppContext";

const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "habits", label: "Habits", icon: Target },
    { id: "focus", label: "Focus", icon: Timer },
    { id: "analytics", label: "Stats", icon: BarChart3 },
];

export default function Layout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { state, dispatch } = useApp();

    return (
        <div className="app-shell min-h-[100dvh] bg-surface-50 dark:bg-surface-950">
            {/* Desktop sidebar — always visible on lg+ */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay — slides in from left */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden"
                        >
                            <Sidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="lg:ml-56 min-h-[100dvh]">
                {/* Mobile header bar */}
                <div className="lg:hidden sticky top-0 z-30 app-mobile-header backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <span className="font-display text-lg text-surface-900 dark:text-surface-50">
                        Ṛta
                    </span>
                </div>

                <div className="px-4 pt-4 pb-36 sm:px-5 sm:pt-5 sm:pb-36 lg:px-8 lg:pt-8 lg:pb-8 max-w-6xl mx-auto">{children}</div>
            </main>

            {/* Mobile bottom tab bar — always visible on mobile for quick navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 mobile-tab-bar border-t border-surface-200 dark:border-surface-800 backdrop-blur-xl">
                <nav className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
                    {mobileNavItems.map((item) => {
                        const isActive = state.currentPage === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => dispatch({ type: "SET_PAGE", payload: item.id })}
                                className={`
                                    flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl
                                    transition-all duration-200 min-w-[48px]
                                    ${isActive
                                        ? "text-accent-active"
                                        : "text-surface-500 active:scale-95"
                                    }
                                `}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-tab-indicator"
                                        className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-accent-indicator"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <FAB />
        </div>
    );
}
