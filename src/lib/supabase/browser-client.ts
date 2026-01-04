import { createBrowserClient } from "@supabase/ssr";
import { appConfig } from "../app.config";
import { Database } from "../database.types";

export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    appConfig.supabaseUrl,
    appConfig.supabaseAnonKey
  );
}
