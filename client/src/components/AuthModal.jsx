import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Loader2, Sparkles, LogIn, UserPlus } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Please fill out all fields.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await onAuthSuccess({ email, password, isLogin });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isLogin ? "log in" : "sign up"}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="
              relative w-full max-w-md overflow-hidden rounded-2xl
              bg-white/80 dark:bg-surface-900/95
              border border-surface-200 dark:border-surface-800
              shadow-2xl backdrop-blur-2xl p-6 sm:p-8
              flex flex-col z-10
            "
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Title & Description */}
                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-3 text-accent">
                                <Sparkles size={22} />
                            </div>
                            <h2 className="font-display text-2xl text-surface-900 dark:text-surface-50">
                                {isLogin ? "Welcome Back" : "Begin Your Ritual"}
                            </h2>
                            <p className="text-sm text-surface-500 mt-1.5">
                                {isLogin
                                    ? "Log in to sync your tasks, habits, and focus sessions."
                                    : "Create an account to start saving your daily flow stats."}
                            </p>
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-400 font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="
                      w-full pl-10 pr-4 py-2.5 rounded-xl
                      bg-surface-50 dark:bg-surface-850/80
                      border border-surface-200 dark:border-surface-800
                      text-sm text-surface-900 dark:text-surface-50
                      placeholder:text-surface-400
                      focus:outline-none focus:border-accent/50
                      transition-colors
                    "
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="
                      w-full pl-10 pr-4 py-2.5 rounded-xl
                      bg-surface-50 dark:bg-surface-850/80
                      border border-surface-200 dark:border-surface-800
                      text-sm text-surface-900 dark:text-surface-50
                      placeholder:text-surface-400
                      focus:outline-none focus:border-accent/50
                      transition-colors
                    "
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="
                  w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-accent text-surface-900 font-medium text-sm
                  hover:bg-accent-light transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed mt-2
                "
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isLogin ? (
                                    <>
                                        <LogIn size={16} />
                                        Log In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Create Account
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Switch flow link */}
                        <div className="text-center mt-6 pt-4 border-t border-surface-200 dark:border-surface-800 text-xs">
                            <span className="text-surface-500">
                                {isLogin ? "New to Flow?" : "Already have an account?"}
                            </span>{" "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-accent hover:underline font-semibold"
                            >
                                {isLogin ? "Create an account" : "Log in to existing"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
