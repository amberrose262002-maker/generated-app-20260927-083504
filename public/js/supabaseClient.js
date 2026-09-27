import { createClient } from "@supabase/supabase-js";

let supabase = null;

export function getSupabaseConfig() {
  const url = localStorage.getItem("tf_supabase_url") || "";
  const key = localStorage.getItem("tf_supabase_key") || "";
  return { url, key };
}

export function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      supabase = null;
    }
  } else {
    supabase = null;
  }
  return null;
}

export function getSupabaseClient() {
  if (!supabase) {
    initSupabase();
  }
  return supabase;
}

export function isSupabaseConnected() {
  const client = getSupabaseClient();
  return client !== null;
}

export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (client) {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  } else {
    // Demo fallback for Google sign-in
    return { mock: true, message: "Supabase Google sign in triggered (Demo Mode)" };
  }
}
