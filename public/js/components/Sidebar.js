import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Tag, 
  Plus, 
  Flame, 
  PieChart, 
  FolderPlus, 
  ShieldCheck, 
  Sparkles,
  Layers
} from "lucide-react";

export default function Sidebar({
  currentView,
  setCurrentView,
  categories,
  selectedCategory,
  setSelectedCategory,
  onOpenNewCategory,
  todayCompletedCount,
  todayTotalCount,
  streakCount,
  onOpenSupabaseGuide,
  mobileOpen,
  setMobileOpen
}) {
  const views = [
    { id: "dashboard", label: "Today's Planner", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar View", icon: Calendar },
    { id: "tasks", label: "To-Do List", icon: CheckSquare }
  ];

  const completionPct = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 text-slate-800 dark:text-slate-100 transition-colors">
      {/* App Header Logo */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Daily Planner & Calendar</p>
          </div>
        </div>
      </div>

      {/* Navigation Views */}
      <div className="p-3 space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Views
        </p>
        {views.map((v) => {
          const Icon = v.icon;
          const active = currentView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setCurrentView(v.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Section */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Categories
          </span>
          <button
            onClick={onOpenNewCategory}
            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Add Custom Category"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setMobileOpen(false);
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === null
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>All Categories</span>
        </button>

        {categories.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                />
                <span className="truncate">{cat.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Widget Card */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-500/10 dark:from-indigo-500/20 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Daily Focus</span>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streakCount} Day Streak</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{todayCompletedCount} of {todayTotalCount} done</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer / RLS Banner */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenSupabaseGuide}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span className="truncate">Supabase RLS & Auth</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
