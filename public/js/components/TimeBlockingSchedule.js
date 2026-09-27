import React from "react";
import { Clock, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function TimeBlockingSchedule({
  tasks,
  selectedDate,
  onOpenTaskModal,
  onTaskClick,
  onToggleTaskComplete
}) {
  // Hours from 06:00 to 22:00
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent": return "border-l-4 border-l-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200";
      case "high": return "border-l-4 border-l-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200";
      case "low": return "border-l-4 border-l-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200";
      default: return "border-l-4 border-l-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Time-Blocking Schedule
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Click any hour to schedule
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[560px] overflow-y-auto">
        {hours.map((hour) => {
          const hourStr = hour.toString().padStart(2, "0") + ":00";
          const displayLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;

          // Find tasks that start in this hour slot
          const slotTasks = tasks.filter((t) => {
            if (!t.start_time) return false;
            const taskHour = parseInt(t.start_time.split(":")[0], 10);
            return taskHour === hour;
          });

          return (
            <div key={hour} className="flex min-h-[52px] group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
              {/* Hour Label */}
              <div className="w-20 shrink-0 p-2 text-right text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 flex items-start justify-end">
                {displayLabel}
              </div>

              {/* Slots Content */}
              <div
                className="flex-1 p-1.5 relative cursor-pointer"
                onClick={(e) => {
                  // Only trigger new task if clicking empty area
                  if (e.target === e.currentTarget) {
                    onOpenTaskModal({ date: selectedDate, start_time: hourStr });
                  }
                }}
              >
                {slotTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {slotTasks.map((t) => {
                      const isCompleted = t.status === "completed";
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(t);
                          }}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between shadow-2xs hover:shadow-md transition-all ${getPriorityBadgeClass(
                            t.priority
                          )} ${isCompleted ? "opacity-60 line-through" : ""}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTaskComplete(t);
                              }}
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isCompleted
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <span className="font-semibold truncate">{t.title}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] opacity-80 shrink-0 font-mono">
                            {t.category_name && (
                              <span
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-sans font-semibold text-white truncate max-w-[80px]"
                                style={{ backgroundColor: t.category_color || "#6366f1" }}
                              >
                                {t.category_name}
                              </span>
                            )}
                            <span>
                              {t.start_time} {t.end_time ? `- ${t.end_time}` : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] text-indigo-500 dark:text-indigo-400 font-medium transition-opacity">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add task at {displayLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
