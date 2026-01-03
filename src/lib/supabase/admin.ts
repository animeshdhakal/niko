import "server-only";

import { createClient } from "@supabase/supabase-js";
import { appConfig } from "../app.config";
import type { Database } from "../database.types";

// Admin client bypasses RLS - use with caution
let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (!adminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client");
    }
    adminClient = createClient<Database>(
      appConfig.supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return adminClient;
}
