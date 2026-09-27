import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Plus, 
  Flame, 
  Filter, 
  MoreVertical, 
  Repeat, 
  CheckSquare, 
  ListTodo,
  TrendingUp,
  Sparkles,
  Edit2,
  Trash2
} from "lucide-react";
import TimeBlockingSchedule from "./TimeBlockingSchedule.jsx";

export default function DashboardView({
  tasks,
  selectedDate,
  setSelectedDate,
  categories,
  selectedCategory,
  onOpenTaskModal,
  onTaskClick,
  onToggleTaskComplete,
  onDeleteTask,
  streakCount,
  searchQuery
}) {
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState("all");

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  // Filter tasks for the selected date
  const dateTasks = tasks.filter((t) => t.date === selectedDate);

  const filteredTasks = dateTasks.filter((t) => {
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

  const totalCount = dateTasks.length;
  const completedCount = dateTasks.filter((t) => t.status === "completed").length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const urgentHighCount = dateTasks.filter(
    (t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high")
  ).length;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent": return "badge-urgent";
      case "high": return "badge-high";
      case "low": return "badge-low";
      default: return "badge-medium";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1: Today's Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{completionRate}%</span>
            <span className="text-xs font-medium text-slate-400">
              {completedCount}/{totalCount} tasks
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Pending Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tasks Remaining
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{pendingCount}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {urgentHighCount > 0 ? `${urgentHighCount} high priority` : "On track!"}
          </p>
        </div>

        {/* Metric 3: Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Productivity Streak
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{streakCount} Days</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Consistent daily execution</p>
        </div>

        {/* Metric 4: Date Quick Actions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Planning For
            </span>
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric"
            })}
          </div>
          <button
            onClick={() => onOpenTaskModal({ date: selectedDate })}
            className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task Here</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Tasks List + Time-Blocking Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Tasks Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            {/* Toolbar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Tasks ({filteredTasks.length})
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Tabs */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                  {["all", "pending", "completed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                        statusFilter === st
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Priority Select */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2 py-1 text-[11px] font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No tasks found</p>
                  <p className="text-xs text-slate-400">
                    {dateTasks.length === 0
                      ? "Your schedule is clear for this date. Click below to add a task!"
                      : "No tasks match your active filter."}
                  </p>
                </div>
                <button
                  onClick={() => onOpenTaskModal({ date: selectedDate })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((t) => {
                  const isCompleted = t.status === "completed";
                  const subtaskCount = t.subtasks?.length || 0;
                  const completedSubtasks = t.subtasks?.filter((st) => st.completed).length || 0;

                  return (
                    <div
                      key={t.id}
                      onClick={() => onTaskClick(t)}
                      className={`group relative p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 ${
                        isCompleted ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/30" : "shadow-2xs hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox + Title + Meta */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTaskComplete(t);
                            }}
                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all task-checkbox ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold transition-all ${
                                  isCompleted
                                    ? "line-through text-slate-400 dark:text-slate-500"
                                    : "text-slate-900 dark:text-slate-100"
                                }`}
                              >
                                {t.title}
                              </span>

                              {/* Priority Tag */}
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(
                                  t.priority
                                )}`}
                              >
                                {t.priority}
                              </span>

                              {/* Category Tag */}
                              {t.category_name && (
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white truncate max-w-[100px]"
                                  style={{ backgroundColor: t.category_color || "#6366f1" }}
                                >
                                  {t.category_name}
                                </span>
                              )}

                              {/* Recurring Tag */}
                              {t.recurring_rule && t.recurring_rule !== "none" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-1.5 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                                  <Repeat className="w-3 h-3" />
                                  <span className="capitalize">{t.recurring_rule}</span>
                                </span>
                              )}
                            </div>

                            {/* Description if present */}
                            {t.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {t.description}
                              </p>
                            )}

                            {/* Time & Subtasks Row */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                              {t.start_time && (
                                <div className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  <span>
                                    {t.start_time} {t.end_time ? `- ${t.end_time}` : ""}
                                  </span>
                                </div>
                              )}

                              {subtaskCount > 0 && (
                                <div className="flex items-center gap-1 font-medium">
                                  <CheckSquare className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {completedSubtasks}/{subtaskCount} subtasks
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(t);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(t.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete task"
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
        </div>

        {/* Right Column (5 cols): Time Blocking Schedule Grid */}
        <div className="lg:col-span-5">
          <TimeBlockingSchedule
            tasks={dateTasks}
            selectedDate={selectedDate}
            onOpenTaskModal={onOpenTaskModal}
            onTaskClick={onTaskClick}
            onToggleTaskComplete={onToggleTaskComplete}
          />
        </div>
      </div>
    </div>
  );
}
