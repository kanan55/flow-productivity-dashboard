// Reusable card component with hover effects
// Supports dark mode via Tailwind dark: variants

import { motion } from "framer-motion";

export default function Card({ children, className = "", onClick, hover = true }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`
        app-card bg-white dark:bg-surface-850
        border border-surface-200 dark:border-surface-800
        rounded-2xl p-5
        ${hover ? "hover:shadow-soft hover:border-surface-300 dark:hover:border-surface-800 transition-all duration-200" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}
