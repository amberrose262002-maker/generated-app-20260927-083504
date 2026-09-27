import React, { useState, useEffect } from "react";
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Database, 
  ShieldCheck, 
  Key, 
  Check, 
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { getSupabaseConfig, initSupabase } from "../supabaseClient.js";

export default function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  setDarkMode,
  userSettings,
  onSaveSettings,
  onOpenSupabaseGuide
}) {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url || userSettings?.supabase_url || "");
    setSupabaseKey(cfg.key || userSettings?.supabase_anon_key || "");
  }, [userSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    localStorage.setItem("tf_supabase_url", supabaseUrl.trim());
    localStorage.setItem("tf_supabase_key", supabaseKey.trim());
    initSupabase();

    if (onSaveSettings) {
      await onSaveSettings({
        supabase_url: supabaseUrl.trim(),
        supabase_anon_key: supabaseKey.trim(),
        theme: darkMode ? "dark" : "light"
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Preferences & Supabase Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Theme Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                  !darkMode
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900"
                    : "border-slate-200 dark:border-slate-800 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </div>
                {!darkMode && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                  darkMode
                    ? "border-indigo-500 bg-indigo-950/50 text-indigo-200"
                    : "border-slate-200 dark:border-slate-800 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </div>
                {darkMode && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Supabase Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Supabase Auth & Database Credentials
                </h4>
              </div>
              <button
                type="button"
                onClick={onOpenSupabaseGuide}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>View RLS Setup Guide</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide your Supabase URL & Anon Key to connect TaskFlow directly to your Supabase project. If omitted, TaskFlow runs with zero latency on Cloudflare DO SQLite storage.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
