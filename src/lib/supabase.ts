import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Optional typed database schema
// If you have generated Supabase types (e.g. via `supabase gen types typescript`)
// place them in `src/types/supabase.ts` and they will be picked up automatically.
// ---------------------------------------------------------------------------
type Database = typeof import("../types/supabase") extends { Database: infer D }
  ? D
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any;

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------
let _client: SupabaseClient<Database> | null = null;

/**
 * Returns a lazily-initialised, singleton Supabase client.
 *
 * Throws a descriptive error at runtime if the required environment variables
 * are missing so misconfiguration is caught early.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not set. " +
        "Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local (or deployment environment)."
    );
  }

  _client = createClient<Database>(url, key, {
    auth: {
      // Persist the session in localStorage so the user stays logged in
      // across page refreshes (browser only; ignored in SSR/Node contexts).
      persistSession: true,
      // Automatically refresh the access token before it expires.
      autoRefreshToken: true,
      // Detect the OAuth / magic-link callback from the URL hash and
      // exchange it for a session automatically.
      detectSessionInUrl: true,
    },
  });

  return _client;
}

/**
 * Convenience proxy that exposes the Supabase client as a module-level
 * constant while still initialising lazily (so import-time env-var checks
 * are deferred until first use).
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 *   const { data, error } = await supabase.from("table").select("*");
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop: string | symbol) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as any)[prop];
  },
});

/**
 * Re-export the Database type so consumers can import it from this module
 * without needing to know where the generated types live.
 */
export type { Database };