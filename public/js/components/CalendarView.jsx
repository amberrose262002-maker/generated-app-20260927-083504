import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Filter,
  Grid,
  Columns,
  Square
} from "lucide-react";

export default function CalendarView({
  tasks,
  selectedDate,
  setSelectedDate,
  onOpenTaskModal,
  onTaskClick,
  categories
}) {
  const [calendarMode, setCalendarMode] = useState("month"); // 'month' | 'week' | 'day'
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  // Generate Month Grid Days
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  // Padding previous month
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const dateStr = new Date(year, month - 1, d).toISOString().split("T")[0];
    daysArray.push({ day: d, month: month - 1, year: year, dateStr, isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, "0");
    const dayStr = d.toString().padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    daysArray.push({ day: d, month, year, dateStr, isCurrentMonth: true });
  }
  // Padding next month to fill grid (42 cells = 6 weeks)
  const remaining = 42 - daysArray.length;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = new Date(year, month + 1, d).toISOString().split("T")[0];
    daysArray.push({ day: d, month: month + 1, year, dateStr, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Calendar Navigation Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTodayClick}
              className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCalendarMode("month")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                calendarMode === "month"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setCalendarMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                calendarMode === "week"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal({ date: selectedDate })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      {calendarMode === "month" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[500px]">
            {daysArray.map((cell, idx) => {
              const dayTasks = tasks.filter((t) => t.date === cell.dateStr);
              const isSelected = selectedDate === cell.dateStr;
              const isTodayCell = todayStr === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[90px] md:min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    !cell.isCurrentMonth ? "opacity-35 bg-slate-50/40 dark:bg-slate-950/20" : ""
                  } ${isSelected ? "ring-2 ring-indigo-500 inset-0 z-10 bg-indigo-50/20 dark:bg-indigo-950/20" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isTodayCell
                          ? "bg-indigo-600 text-white shadow-sm"
                          : isSelected
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                      </span>
                    )}
                  </div>

                  {/* Task Chips in Cell */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((t) => {
                      const isComp = t.status === "completed";
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(t);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                            isComp
                              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through"
                              : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50"
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.category_color || "#6366f1" }}
                          />
                          <span className="truncate">{t.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-bold px-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calendarMode === "week" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            7-Day Schedule Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(selectedDate + "T00:00:00");
              d.setDate(d.getDate() - d.getDay() + i);
              const dateStr = d.toISOString().split("T")[0];
              const dayTasks = tasks.filter((t) => t.date === dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      {d.getDate()}
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-3 min-h-[120px]">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(t);
                        }}
                        className="p-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 truncate"
                      >
                        <span className="font-bold">{t.start_time || "All day"}</span> - {t.title}
                      </div>
                    ))}
                    {dayTasks.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-4">No tasks</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
