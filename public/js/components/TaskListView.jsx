import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  Filter, 
  List, 
  Kanban, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckSquare, 
  Tag, 
  Repeat,
  MoreHorizontal,
  ChevronDown,
  Layers
} from "lucide-react";

export default function TaskListView({
  tasks,
  categories,
  selectedCategory,
  onOpenTaskModal,
  onTaskClick,
  onToggleTaskComplete,
  onDeleteTask,
  onBatchAction,
  searchQuery,
  setSearchQuery
}) {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'kanban'
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory && t.category_id !== selectedCategory) return false;
    if (statusFilter === "pending" && t.status === "completed") return false;
    if (statusFilter === "completed" && t.status !== "completed") return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const toggleSelectTask = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBatchComplete = () => {
    if (selectedTaskIds.length === 0) return;
    onBatchAction({ action: "complete", task_ids: selectedTaskIds });
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Delete ${selectedTaskIds.length} selected tasks?`)) {
      onBatchAction({ action: "delete", task_ids: selectedTaskIds });
      setSelectedTaskIds([]);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent": return "badge-urgent";
      case "high": return "badge-high";
      case "low": return "badge-low";
      default: return "badge-medium";
    }
  };

  const columns = [
    { id: "pending", title: "To Do", tasks: filteredTasks.filter((t) => t.status === "pending") },
    { id: "in_progress", title: "In Progress", tasks: filteredTasks.filter((t) => t.status === "in_progress") },
    { id: "completed", title: "Completed", tasks: filteredTasks.filter((t) => t.status === "completed") }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Control Header Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              To-Do Task List
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">To Do</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => onOpenTaskModal({ date: new Date().toISOString().split("T")[0] })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Batch Selection Action Bar */}
        {selectedTaskIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs animate-fade-in">
            <span className="font-bold text-indigo-900 dark:text-indigo-200">
              {selectedTaskIds.length} tasks selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchComplete}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedTaskIds([])}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedTaskIds.length > 0 && selectedTaskIds.length === filteredTasks.length}
                onChange={toggleSelectAll}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Task Name & Category</span>
            </div>
            <div className="hidden sm:flex items-center gap-8">
              <span>Date & Time</span>
              <span>Priority</span>
              <span>Actions</span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tasks match your filter criteria.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === "completed";
                const isSelected = selectedTaskIds.includes(t.id);

                return (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    } ${isCompleted ? "opacity-60 bg-slate-50/40" : ""}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectTask(t.id);
                        }}
                        className="mt-1 sm:mt-0 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskComplete(t);
                        }}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isCompleted ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {t.title}
                          </span>
                          {t.category_name && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white"
                              style={{ backgroundColor: t.category_color || "#6366f1" }}
                            >
                              {t.category_name}
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-md">{t.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {t.date} {t.start_time ? `• ${t.start_time}` : ""}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(t);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(t.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div
              key={col.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {col.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  {col.tasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {col.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {t.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{t.date}</span>
                      {t.category_name && (
                        <span
                          className="px-1.5 py-0.5 rounded text-white font-sans font-semibold"
                          style={{ backgroundColor: t.category_color || "#6366f1" }}
                        >
                          {t.category_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {col.tasks.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No tasks in {col.title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
