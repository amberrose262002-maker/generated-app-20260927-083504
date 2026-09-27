import React, { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Repeat, 
  CheckSquare, 
  Sparkles,
  FolderPlus
} from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  taskToEdit,
  initialData,
  categories,
  onSaveTask,
  onOpenNewCategory
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState("medium");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("pending");
  const [recurringRule, setRecurringRule] = useState("none");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setDate(taskToEdit.date || new Date().toISOString().split("T")[0]);
      setStartTime(taskToEdit.start_time || "");
      setEndTime(taskToEdit.end_time || "");
      setDuration(taskToEdit.duration || 30);
      setPriority(taskToEdit.priority || "medium");
      setCategoryId(taskToEdit.category_id || (categories[0]?.id || ""));
      setStatus(taskToEdit.status || "pending");
      setRecurringRule(taskToEdit.recurring_rule || "none");
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle("");
      setDescription("");
      setDate(initialData?.date || new Date().toISOString().split("T")[0]);
      setStartTime(initialData?.start_time || "09:00");
      setEndTime("");
      setDuration(30);
      setPriority("medium");
      setCategoryId(categories[0]?.id || "");
      setStatus("pending");
      setRecurringRule("none");
      setSubtasks([]);
    }
  }, [taskToEdit, initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index) => {
    setSubtasks(
      subtasks.map((st, i) => (i === index ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSaveTask({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      duration: parseInt(duration, 10) || 30,
      priority,
      category_id: categoryId || null,
      status,
      recurring_rule: recurringRule,
      subtasks
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {taskToEdit ? "Edit Task" : "Create New Task"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Draft Q3 Roadmap Presentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, links, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Category
                </label>
                <button
                  type="button"
                  onClick={onOpenNewCategory}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  + New Category
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring Rules & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-violet-500" />
                Recurring Task Rule
              </label>
              <select
                value={recurringRule}
                onChange={(e) => setRecurringRule(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold focus:border-indigo-500 focus:outline-none"
              >
                <option value="pending">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Subtasks & Checklists ({subtasks.length})</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask(e)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(i)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`truncate ${st.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
            >
              {taskToEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
