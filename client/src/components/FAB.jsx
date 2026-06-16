import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare, Target, Timer } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function FAB() {
    const [open, setOpen] = useState(false);
    const { dispatch } = useApp();

    const actions = [
        { label: "Add Task", icon: CheckSquare, page: "tasks" },
        { label: "Add Habit", icon: Target, page: "habits" },
        { label: "Focus", icon: Timer, page: "focus" },
    ];

    return (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
                    >
                        {actions.map((action) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => {
                                    dispatch({ type: "SET_PAGE", payload: action.page });
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "var(--theme-accent)" }}
                            >
                                <action.icon size={16} />
                                {action.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(!open)}
                className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:opacity-95 transition-opacity"
                style={{ backgroundColor: "var(--theme-accent)" }}
            >
                <motion.div
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {open ? <X size={24} /> : <Plus size={24} />}
                </motion.div>
            </motion.button>
        </div>
    );
}
