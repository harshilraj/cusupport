import { createClient } from "@supabase/supabase-js";

export const hasSupabaseConfig = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
);

if (!hasSupabaseConfig) {
  console.error("SUPABASE_URL and SUPABASE_ANON_KEY are required for database calls");
}

export const supabase = hasSupabaseConfig
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;
