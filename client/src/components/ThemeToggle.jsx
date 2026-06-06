// Visual theme picker with 5 artistic color themes

import { Moon, Sun, Trees, Sparkles, Wind, Cat } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

const THEMES = [
    { id: "midnight", label: "Midnight", icon: Moon },
    { id: "sunset", label: "Sunset", icon: Sun },
    { id: "forest", label: "Forest", icon: Trees },
    { id: "glass", label: "Glass", icon: Sparkles },
    { id: "aurora", label: "Aurora", icon: Wind },
    { id: "cat", label: "Cat Theme", icon: Cat },
];

export default function ThemeToggle() {
    const { state, setVisualTheme } = useApp();

    return (
        <div className="theme-picker" aria-label="Choose app theme">
            {THEMES.map((theme) => {
                const Icon = theme.icon;
                const isActive = (state.visualTheme || "midnight") === theme.id;
                const shortLabel = theme.id === "cat" ? "Cat" : theme.label;

                return (
                    <button
                        key={theme.id}
                        onClick={() => setVisualTheme(theme.id)}
                        className={`theme-picker__button ${isActive ? "is-active" : ""}`}
                        title={theme.label}
                        aria-label={`Use ${theme.label} theme`}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="theme-picker-active"
                                className="theme-picker__active"
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5 justify-start w-full px-2">
                            <Icon size={12} className="flex-shrink-0" />
                            <span className="text-[10px] font-semibold tracking-wide truncate">{shortLabel}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
