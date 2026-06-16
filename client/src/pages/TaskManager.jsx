// Task Manager — full CRUD with categories, priorities, drag-drop reorder
// Features: add/edit/delete tasks, filter by category/status, drag to reorder

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { isSameDay } from "date-fns";
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit3,
    CheckCircle2,
    Circle,
    Clock,
    GripVertical,
    ChevronDown,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { generateId, formatDeadline, getPriorityBg, getCategoryMeta } from "../utils/helpers";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

const CATEGORIES = ["All", "Work", "Study", "Health", "Personal"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function TaskManager() {
    const { state, addTask, updateTask, deleteTask, reorderTasks } = useApp();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState("today");

    // Generate current week days (Monday - Sunday)
    const weekDays = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    // Filter and compute today's tasks specifically (for progress bar & Today list)
    const todayTasks = useMemo(() => {
        const today = new Date();
        return state.tasks.filter((t) => {
            const isDueToday = t.deadline && isSameDay(new Date(t.deadline), today);
            const isPendingNoDeadline = !t.deadline && t.status !== "completed";
            return isDueToday || isPendingNoDeadline;
        });
    }, [state.tasks]);

    // Filter and search tasks
    const filteredTasks = useMemo(() => {
        if (activeTab === "today") {
            const priorityOrder = { high: 1, medium: 2, low: 3, urgent: 4 };
            // Sort by priority (high > medium > low > urgent at bottom)
            return [...todayTasks].sort((a, b) => {
                return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
            });
        }

        return state.tasks
            .filter((t) => {
                if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
                if (statusFilter !== "all" && t.status !== statusFilter) return false;
                if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
                if (selectedDate && (!t.deadline || !isSameDay(new Date(t.deadline), selectedDate))) return false;
                return true;
            })
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [state.tasks, todayTasks, categoryFilter, statusFilter, search, selectedDate, activeTab]);

    const handleAddTask = () => {
        setEditingTask(null);
        setShowModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const handleDeleteTask = (id) => {
        deleteTask(id);
    };

    const handleToggleStatus = (task) => {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        updateTask(task._id, {
            status: newStatus,
        });
    };

    const handleSaveTask = (taskData) => {
        if (editingTask) {
            updateTask(editingTask._id, taskData);
        } else {
            addTask(taskData);
        }
        setShowModal(false);
        setEditingTask(null);
    };

    const handleReorder = (newOrder) => {
        if (activeTab !== "all") return; // Reordering only allowed in 'All Tasks' tab
        const reordered = newOrder.map((task, index) => ({
            ...task,
            order: index,
        }));
        reorderTasks(reordered);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl text-surface-900 dark:text-surface-50">
                        Tasks
                    </h1>
                    <p className="text-surface-500 mt-1">
                        {state.tasks.filter((t) => t.status !== "completed").length} pending
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddTask}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent text-surface-900 rounded-xl font-medium text-sm hover:bg-accent-light transition-colors"
                >
                    <Plus size={16} />
                    Add Task
                </motion.button>
            </div>

            {/* Today / All Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-900/60 w-fit">
                <button
                    onClick={() => { setActiveTab("today"); setSelectedDate(null); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "today"
                            ? "bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-surface-50"
                            : "text-surface-500 hover:text-surface-700"
                    }`}
                >
                    Today
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "all"
                            ? "bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-surface-50"
                            : "text-surface-500 hover:text-surface-700"
                    }`}
                >
                    All Tasks
                </button>
            </div>

            {/* Calendar Week Strip - only in All Tasks */}
            {activeTab === "all" && (
                <div className="bg-white/40 dark:bg-surface-900/40 backdrop-blur-xl border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider px-1">Weekly Schedule</span>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                            >
                                Show All
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 justify-between">
                        {weekDays.map((day) => {
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isSameDay(day, new Date());
                            const dayTasks = state.tasks.filter(
                                (t) => t.status !== "completed" && t.deadline && isSameDay(new Date(t.deadline), day)
                            );
                            
                            // Extract unique priorities for colored dots
                            const priorities = Array.from(new Set(dayTasks.map((t) => t.priority)));

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(isSelected ? null : day)}
                                    className={`
                                        flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer
                                        ${isSelected
                                            ? "bg-accent text-surface-900 shadow-md scale-[1.02] font-semibold"
                                            : isTodayDate
                                                ? "bg-accent/15 text-accent border border-accent/30 font-medium"
                                                : "hover:bg-surface-100/60 dark:hover:bg-surface-800/30 text-surface-600 dark:text-surface-400"
                                        }
                                    `}
                                >
                                    <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? "text-surface-900" : "text-surface-400 dark:text-surface-500"}`}>
                                        {day.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3)}
                                    </span>
                                    <span className="text-sm font-bold leading-none mt-1">
                                        {day.getDate()}
                                    </span>
                                    {/* Dot indicators for tasks scheduled */}
                                    <div className="flex gap-1 mt-1.5 h-1 items-center justify-center">
                                        {priorities.map((p) => (
                                            <span
                                                key={p}
                                                className={`w-1 h-1 rounded-full ${
                                                    p === "urgent" || p === "high"
                                                        ? isSelected ? "bg-surface-900" : "bg-rose-500"
                                                        : p === "medium"
                                                            ? isSelected ? "bg-surface-900" : "bg-orange-400"
                                                            : isSelected ? "bg-surface-900" : "bg-emerald-500"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search & Filters - only in All Tasks */}
            {activeTab === "all" && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                  w-full pl-10 pr-4 py-2.5 rounded-xl
                  bg-white dark:bg-surface-850
                  border border-surface-200 dark:border-surface-800
                  text-sm text-surface-900 dark:text-surface-50
                  placeholder:text-surface-400
                  focus:outline-none focus:border-accent/50
                  transition-colors
                "
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-white dark:bg-surface-850
                border border-surface-200 dark:border-surface-800
                text-sm text-surface-600 dark:text-surface-400
                hover:border-surface-300 dark:hover:border-surface-700
                transition-colors
              "
                    >
                        <Filter size={16} />
                        Filters
                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            )}

            {/* Filter chips - only in All Tasks */}
            {activeTab === "all" && (
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                        >
                            {/* Category filter */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${categoryFilter === cat
                                                ? "bg-accent text-surface-900"
                                                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                                            }
                       `}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Status filter */}
                            <div className="flex flex-wrap gap-2">
                                {["all", "pending", "in-progress", "completed"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                        ${statusFilter === s
                                                ? "bg-accent text-surface-900"
                                                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                                            }
                       `}
                                    >
                                        {s === "all" ? "All Status" : s.replace("-", " ")}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Today's Tasks Progress Bar */}
            {activeTab === "today" && (
                <div className="flex items-center gap-3 text-sm text-surface-500 py-1">
                    <span className="font-medium text-surface-900 dark:text-surface-50">
                        {todayTasks.filter(t => t.status === "completed").length}/{todayTasks.length} done
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${todayTasks.length ? (todayTasks.filter(t => t.status === "completed").length / todayTasks.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Task List */}
            {filteredTasks.length > 0 && (
                <Reorder.Group axis="y" values={filteredTasks} onReorder={handleReorder} className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onToggle={() => handleToggleStatus(task)}
                                onEdit={() => handleEditTask(task)}
                                onDelete={() => handleDeleteTask(task._id)}
                                isReorderable={activeTab === "all"}
                            />
                        ))}
                    </AnimatePresence>
                </Reorder.Group>
            )}

            {filteredTasks.length === 0 && (
                activeTab === "today" ? (
                    <div className="text-center py-12">
                        <CheckCircle2 size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-700" />
                        <p className="text-surface-500">No tasks for today</p>
                        <button
                            onClick={() => setActiveTab("all")}
                            className="text-accent text-sm mt-2 hover:underline"
                        >
                            View all tasks →
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <CheckCircle2 size={40} className="mx-auto text-surface-300 dark:text-surface-700 mb-3" />
                        <p className="text-surface-500">No tasks found</p>
                        <p className="text-sm text-surface-400 mt-1">Try adjusting your filters or add a new task</p>
                    </div>
                )
            )}

            {/* Task Modal */}
            <TaskModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingTask(null); }}
                onSave={handleSaveTask}
                task={editingTask}
                defaultDate={selectedDate}
            />
        </div>
    );
}

// --- Task Card Component ---
function TaskCard({ task, onToggle, onEdit, onDelete, isReorderable }) {
    const isCompleted = task.status === "completed";
    const catMeta = getCategoryMeta(task.category);
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={task}
            dragControls={dragControls}
            dragListener={false}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                group flex items-start gap-3 p-4 rounded-xl
                bg-white dark:bg-surface-850
                border border-surface-200 dark:border-surface-800
                hover:border-surface-300 dark:hover:border-surface-700
                transition-all duration-200
                ${isCompleted ? "opacity-60" : ""}
            `}
        >
            {/* Drag handle */}
            {isReorderable && (
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="pt-0.5 opacity-40 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                >
                    <GripVertical size={16} className="text-surface-400" />
                </div>
            )}

            {/* Checkbox */}
            <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
                {isCompleted ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                    <Circle size={20} className="text-surface-300 dark:text-surface-600 hover:text-accent transition-colors" />
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4
                    className={`text-sm font-medium ${isCompleted
                            ? "line-through text-surface-400"
                            : "text-surface-900 dark:text-surface-50"
                        }`}
                >
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Category badge */}
                    <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${catMeta.bg}`}
                        style={{ color: catMeta.color }}
                    >
                        {task.category}
                    </span>
                    {/* Priority badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${getPriorityBg(task.priority)}`}>
                        {task.priority}
                    </span>
                    {/* Deadline */}
                    {task.deadline && (
                        <span className="flex items-center gap-1 text-[11px] text-surface-400">
                            <Clock size={10} />
                            {formatDeadline(task.deadline)}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions — always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                    <Edit3 size={14} className="text-surface-400" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                    <Trash2 size={14} className="text-surface-400 hover:text-rose-500" />
                </button>
            </div>
        </Reorder.Item>
    );
}

// --- Task Modal (Add / Edit) ---
function TaskModal({ isOpen, onClose, onSave, task, defaultDate }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Personal",
        priority: "medium",
        deadline: "",
    });

    const toLocalDateString = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Reset/populate form when modal opens or task changes
    useEffect(() => {
        if (isOpen) {
            if (task) {
                setForm({
                    title: task.title || "",
                    description: task.description || "",
                    category: task.category || "Personal",
                    priority: task.priority || "medium",
                    deadline: task.deadline ? toLocalDateString(task.deadline) : "",
                });
            } else {
                setForm({
                    title: "",
                    description: "",
                    category: "Personal",
                    priority: "medium",
                    deadline: defaultDate ? toLocalDateString(defaultDate) : "",
                });
            }
        }
    }, [isOpen, task, defaultDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave({
            ...form,
            deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "New Task"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Title
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="What needs to be done?"
                        autoFocus
                        className="
              mt-1.5 w-full px-3.5 py-2.5 rounded-xl
              bg-surface-50 dark:bg-surface-900
              border border-surface-200 dark:border-surface-800
              text-sm text-surface-900 dark:text-surface-50
              placeholder:text-surface-400
              focus:outline-none focus:border-accent/50
              transition-colors
            "
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Description
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Add details (optional)"
                        rows={2}
                        className="
              mt-1.5 w-full px-3.5 py-2.5 rounded-xl resize-none
              bg-surface-50 dark:bg-surface-900
              border border-surface-200 dark:border-surface-800
              text-sm text-surface-900 dark:text-surface-50
              placeholder:text-surface-400
              focus:outline-none focus:border-accent/50
              transition-colors
            "
                    />
                </div>

                {/* Category + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="
                mt-1.5 w-full px-3.5 py-2.5 rounded-xl
                bg-surface-50 dark:bg-surface-900
                border border-surface-200 dark:border-surface-800
                text-sm text-surface-900 dark:text-surface-50
                focus:outline-none focus:border-accent/50
                transition-colors
              "
                        >
                            {["Work", "Study", "Health", "Personal"].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                            Priority
                        </label>
                        <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="
                mt-1.5 w-full px-3.5 py-2.5 rounded-xl capitalize
                bg-surface-50 dark:bg-surface-900
                border border-surface-200 dark:border-surface-800
                text-sm text-surface-900 dark:text-surface-50
                focus:outline-none focus:border-accent/50
                transition-colors
              "
                        >
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p} className="capitalize">{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Deadline */}
                <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Deadline
                    </label>
                    <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="
              mt-1.5 w-full px-3.5 py-2.5 rounded-xl
              bg-surface-50 dark:bg-surface-900
              border border-surface-200 dark:border-surface-800
              text-sm text-surface-900 dark:text-surface-50
              focus:outline-none focus:border-accent/50
              transition-colors
            "
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="
            w-full py-2.5 rounded-xl
            bg-accent text-surface-900
            font-medium text-sm
            hover:bg-accent-light
            transition-colors
          "
                >
                    {task ? "Save Changes" : "Add Task"}
                </button>
            </form>
        </Modal>
    );
}
