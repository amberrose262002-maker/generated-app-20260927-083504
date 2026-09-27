import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import Header from "./components/Header.js";
import Sidebar from "./components/Sidebar.js";
import DashboardView from "./components/DashboardView.js";
import CalendarView from "./components/CalendarView.js";
import TaskListView from "./components/TaskListView.js";
import TaskModal from "./components/TaskModal.js";
import AuthModal from "./components/AuthModal.js";
import SettingsModal from "./components/SettingsModal.js";
import SupabaseGuideModal from "./components/SupabaseGuideModal.js";
import { isSupabaseConnected, getSupabaseConfig } from "./supabaseClient.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("tf_auth_token") || "");
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' | 'calendar' | 'tasks'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [streakCount, setStreakCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("tf_dark_mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [newTaskInitialData, setNewTaskInitialData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [supabaseGuideOpen, setSupabaseGuideOpen] = useState(false);
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");

  // Sync Dark Mode Class
  useEffect(() => {
    localStorage.setItem("tf_dark_mode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auth Headers
  const getHeaders = useCallback(() => {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  }, [authToken]);

  // Fetch Auth & Tasks
  const loadUserAndData = useCallback(async () => {
    if (!authToken) {
      // Auto demo login if no token set
      try {
        const res = await fetch("./api/auth/demo", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAuthToken(data.token);
          localStorage.setItem("tf_auth_token", data.token);
        }
      } catch (err) {
        console.error("Auto demo auth error:", err);
      }
      return;
    }

    try {
      const res = await fetch("./api/auth/me", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid, clear and recreate demo session
        localStorage.removeItem("tf_auth_token");
        setAuthToken("");
      }
    } catch (err) {
      console.error("Auth me check failed:", err);
    }
  }, [authToken, getHeaders]);

  const loadCategories = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch("./api/categories", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, [authToken, getHeaders]);

  const loadTasks = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch("./api/tasks", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [authToken, getHeaders]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  useEffect(() => {
    if (authToken) {
      loadCategories();
      loadTasks();
    }
  }, [authToken, loadCategories, loadTasks]);

  // Keyboard shortcut listener ('N' key for new task, '/' for search focus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setTaskToEdit(null);
        setNewTaskInitialData({ date: selectedDate });
        setTaskModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate]);

  // Task Actions
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // PUT edit
        const res = await fetch(`./api/tasks/${taskData.id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(taskData)
        });
        if (res.ok) loadTasks();
      } else {
        // POST create
        const res = await fetch("./api/tasks", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(taskData)
        });
        if (res.ok) loadTasks();
      }
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  const handleToggleTaskComplete = async (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`./api/tasks/${task.id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ ...task, status: nextStatus })
      });

      if (res.ok) {
        if (nextStatus === "completed") {
          // Trigger celebratory confetti animation
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 }
          });
        }
        loadTasks();
      }
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`./api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleBatchAction = async (batchPayload) => {
    try {
      const res = await fetch("./api/tasks/batch", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(batchPayload)
      });
      if (res.ok) {
        if (batchPayload.action === "complete") {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        }
        loadTasks();
      }
    } catch (err) {
      console.error("Batch action failed:", err);
    }
  };

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("./api/categories", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor })
      });
      if (res.ok) {
        loadCategories();
        setNewCatName("");
        setNewCatModalOpen(false);
      }
    } catch (err) {
      console.error("Create category failed:", err);
    }
  };

  // Auth handlers
  const handleLogin = async (email, password) => {
    const res = await fetch("./api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setUser(data.user);
    setAuthToken(data.token);
    localStorage.setItem("tf_auth_token", data.token);
  };

  const handleSignup = async (email, password, name) => {
    const res = await fetch("./api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Signup failed");
    }
    const data = await res.json();
    setUser(data.user);
    setAuthToken(data.token);
    localStorage.setItem("tf_auth_token", data.token);
  };

  const handleDemoLogin = async () => {
    const res = await fetch("./api/auth/demo", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem("tf_auth_token", data.token);
    }
  };

  const handleLogout = async () => {
    await fetch("./api/auth/logout", { method: "POST", headers: getHeaders() });
    setUser(null);
    setAuthToken("");
    localStorage.removeItem("tf_auth_token");
    // Trigger demo login so state isn't empty
    handleDemoLogin();
  };

  // Compute today completion counters
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const todayCompletedCount = todayTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenNewCategory={() => setNewCatModalOpen(true)}
        todayCompletedCount={todayCompletedCount}
        todayTotalCount={todayTasks.length}
        streakCount={streakCount}
        onOpenSupabaseGuide={() => setSupabaseGuideOpen(true)}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          user={user}
          currentView={currentView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpenNewTask={() => {
            setTaskToEdit(null);
            setNewTaskInitialData({ date: selectedDate });
            setTaskModalOpen(true);
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenSupabaseGuide={() => setSupabaseGuideOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          isSupabaseActive={isSupabaseConnected()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* View Router Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === "dashboard" && (
            <DashboardView
              tasks={tasks}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              categories={categories}
              selectedCategory={selectedCategory}
              onOpenTaskModal={(initData) => {
                setTaskToEdit(null);
                setNewTaskInitialData(initData);
                setTaskModalOpen(true);
              }}
              onTaskClick={(t) => {
                setTaskToEdit(t);
                setTaskModalOpen(true);
              }}
              onToggleTaskComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              streakCount={streakCount}
              searchQuery={searchQuery}
            />
          )}

          {currentView === "calendar" && (
            <CalendarView
              tasks={tasks}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onOpenTaskModal={(initData) => {
                setTaskToEdit(null);
                setNewTaskInitialData(initData);
                setTaskModalOpen(true);
              }}
              onTaskClick={(t) => {
                setTaskToEdit(t);
                setTaskModalOpen(true);
              }}
              categories={categories}
            />
          )}

          {currentView === "tasks" && (
            <TaskListView
              tasks={tasks}
              categories={categories}
              selectedCategory={selectedCategory}
              onOpenTaskModal={(initData) => {
                setTaskToEdit(null);
                setNewTaskInitialData(initData);
                setTaskModalOpen(true);
              }}
              onTaskClick={(t) => {
                setTaskToEdit(t);
                setTaskModalOpen(true);
              }}
              onToggleTaskComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onBatchAction={handleBatchAction}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </main>
      </div>

      {/* Task Edit/Create Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        initialData={newTaskInitialData}
        categories={categories}
        onSaveTask={handleSaveTask}
        onOpenNewCategory={() => setNewCatModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onDemoLogin={handleDemoLogin}
        isSupabaseActive={isSupabaseConnected()}
      />

      {/* Preferences / Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userSettings={null}
        onSaveSettings={async () => {}}
        onOpenSupabaseGuide={() => setSupabaseGuideOpen(true)}
      />

      {/* Supabase Guide Modal */}
      <SupabaseGuideModal
        isOpen={supabaseGuideOpen}
        onClose={() => setSupabaseGuideOpen(false)}
      />

      {/* Create Category Modal */}
      {newCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Create New Category
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Side Projects"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {newCatColor}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCatModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
