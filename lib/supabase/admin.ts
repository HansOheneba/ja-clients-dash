import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  assertSupabaseEnv,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "./env";

export function createAdminClient() {
  assertSupabaseEnv();
  const key = supabaseServiceRoleKey ?? supabaseAnonKey;
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "wealth" },
  });
}
