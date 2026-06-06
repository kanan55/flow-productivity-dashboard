// Root application component
// Handles page routing via state (no react-router needed)
// Wraps everything in the layout

import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TaskManager from "./pages/TaskManager";
import DailyPlanner from "./pages/DailyPlanner";
import HabitTracker from "./pages/HabitTracker";
import FocusMode from "./pages/FocusMode";
import Analytics from "./pages/Analytics";
import { AnimatePresence, motion } from "framer-motion";

const pages = {
    dashboard: Dashboard,
    tasks: TaskManager,
    planner: DailyPlanner,
    habits: HabitTracker,
    focus: FocusMode,
    analytics: Analytics,
};

export default function App() {
    const { state } = useApp();
    const PageComponent = pages[state.currentPage] || Dashboard;

    return (
        <Layout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={state.currentPage}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    <PageComponent />
                </motion.div>
            </AnimatePresence>
        </Layout>
    );
}
