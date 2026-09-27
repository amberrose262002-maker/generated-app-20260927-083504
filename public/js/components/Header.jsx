import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Database, 
  Settings, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown,
  ShieldCheck,
  Menu
} from "lucide-react";

export default function Header({
  user,
  currentView,
  selectedDate,
  setSelectedDate,
  onOpenNewTask,
  onOpenAuth,
  onOpenSettings,
  onOpenSupabaseGuide,
  darkMode,
  setDarkMode,
  onLogout,
  isSupabaseActive,
  searchQuery,
  setSearchQuery,
  onToggleSidebarMobile
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const handleTodayClick = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date / View Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formattedDate}</span>
            {!isToday && (
              <button
                onClick={handleTodayClick}
                className="ml-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Go to Today
              </button>
            )}
          </div>

          <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium">
            {getGreeting()}, <span className="font-semibold text-slate-800 dark:text-slate-100">{user ? user.name : "Guest"}</span> 👋
          </div>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks, categories, or keywords... (Press '/')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseGuide}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            isSupabaseActive
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title="Supabase Auth & RLS Status"
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? "text-emerald-500" : "text-slate-400"}`} />
          <span>{isSupabaseActive ? "Supabase Live" : "Supabase Auth / Local DO"}</span>
          <ShieldCheck className="w-3 h-3 text-indigo-500 ml-0.5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-xs shadow-sm shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* User Profile / Auth Button */}
        <div className="relative ml-1">
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* User Menu Dropdown */}
          {user && showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-fade-in"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={onOpenSettings}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Preferences & Keys</span>
                </button>
                <button
                  onClick={onOpenSupabaseGuide}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Supabase RLS Guide</span>
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
