import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Database, 
  Lock, 
  ExternalLink,
  Code2,
  Key
} from "lucide-react";

export default function SupabaseGuideModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- 1. Create Tasks table with Row Level Security (RLS)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration INTEGER DEFAULT 30,
  priority TEXT NOT NULL DEFAULT 'medium',
  category_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  recurring_rule TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies (Users can only see and manage their own tasks!)
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Categories Table & RLS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Supabase Auth & RLS Policy Guide</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Setting Up Supabase Row Level Security
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Row Level Security ensures every user's tasks remain strictly private and only readable or writable by their authenticated Supabase account.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Run RLS SQL in your Supabase SQL Editor
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              Copy and execute the following SQL script in your Supabase Dashboard under <b>SQL Editor</b>.
            </p>

            <div className="relative ml-8 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied SQL!" : "Copy SQL"}</span>
              </button>
              <pre>{sqlScript}</pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Enable Google Auth Provider (Optional)
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              In Supabase, go to <b>Authentication → Providers → Google</b>, paste your Google OAuth Client ID and Secret, and add your preview URL to Redirect URLs.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Plug Keys into TaskFlow Preferences
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              Open <b>Settings</b> in TaskFlow, paste your Supabase Project URL & Anon Key, and enjoy live Supabase integration!
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
