/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ['"DM Sans"', "system-ui", "sans-serif"],
                mono: ['"JetBrains Mono"', "monospace"],
                display: ['"Instrument Serif"', "Georgia", "serif"],
            },
            colors: {
                surface: {
                    50: "#fafaf9",
                    100: "#f5f5f4",
                    200: "#e7e5e4",
                    300: "#d6d3d1",
                    800: "#1c1917",
                    850: "#171412",
                    900: "#0c0a09",
                    950: "#080604",
                },
                accent: {
                    DEFAULT: "#e8c547",
                    light: "#f0d878",
                    dark: "#c9a82c",
                },
                ember: "#f97316",
                sage: "#4ade80",
                sky: "#38bdf8",
                rose: "#fb7185",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            boxShadow: {
                soft: "0 2px 20px rgba(0, 0, 0, 0.04)",
                glow: "0 0 40px rgba(232, 197, 71, 0.15)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease forwards",
                "slide-up": "slideUp 0.4s ease forwards",
                "pulse-soft": "pulseSoft 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                slideUp: {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                pulseSoft: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
            },
        },
    },
    plugins: [],
};
