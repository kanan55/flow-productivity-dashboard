import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

const THEME_NAMES = {
    midnight: "Nova",
    sunset: "Nova",
    forest: "Nova",
    glass: "Nova",
    aurora: "Nova",
    cat: "Mochi",
};

const IDLE_LINES = {
    midnight: "Ready for deep work.",
    sunset: "Let's create something.",
    forest: "Breathe and focus.",
    glass: "Clarity awaits.",
    aurora: "Dream big today.",
    cat: "Meow. Purr...",
};

export default function Companion() {
    const { state } = useApp();
    const theme = state.visualTheme || "focus";
    const event = state.companionEvent;
    const [visible, setVisible] = useState(true);
    const [line, setLine] = useState(IDLE_LINES[theme]);

    useEffect(() => {
        setLine(IDLE_LINES[theme]);
    }, [theme]);

    useEffect(() => {
        if (!event?.message) return;
        setVisible(true);
        setLine(event.message);
        const timer = window.setTimeout(() => setLine(IDLE_LINES[theme]), 3600);
        return () => window.clearTimeout(timer);
    }, [event, theme]);

    const mood = event?.mood || "wave";
    const name = THEME_NAMES[theme];
    // Simplified animation: only subtle breathing, minimal mood reactions
    const animation = useMemo(() => {
        if (mood === "celebrate") return { scale: [1, 1.02, 1] }; // subtle pulse
        if (mood === "focus") return { scale: [1, 1.01, 1] }; // minimal scale
        if (mood === "rest") return { y: [0, 1, 0] }; // tiny bob
        if (mood === "spark") return { scale: [1, 1.03, 1] }; // gentle sparkle
        if (mood === "blink") return { opacity: [1, 0.95, 1] }; // subtle fade
        return { scale: [1, 1.015, 1] }; // default: gentle breathing
    }, [mood]);

    return (
        <motion.div
            className={`companion companion--${theme} companion--${mood} companion-page--${state.currentPage}`}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: visible ? 1 : 0.45, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
        >
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key={`${line}-${theme}`}
                        className="companion__bubble"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    >
                        <button
                            className="companion__hide"
                            onClick={() => setVisible(false)}
                            aria-label="Hide companion message"
                        >
                            x
                        </button>
                        <span className="companion__name">{name}</span>
                        <p>{line}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className="companion__body"
                onClick={() => setVisible((current) => !current)}
                aria-label="Toggle companion message"
            >
                <motion.span
                    className="companion__avatar"
                    animate={animation}
                    transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                >
                    <span className="companion__ear companion__ear--left" />
                    <span className="companion__ear companion__ear--right" />
                    <span className="companion__face">
                        <span className="companion__eye companion__eye--left" />
                        <span className="companion__eye companion__eye--right" />
                        <span className="companion__mouth" />
                    </span>
                    <span className="companion__tail" />
                    <span className="companion__spark companion__spark--one" />
                    <span className="companion__spark companion__spark--two" />
                    <span className="companion__breath" />
                </motion.span>
                <span className="companion__perch" />
            </button>
        </motion.div>
    );
}
