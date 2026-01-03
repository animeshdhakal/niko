import { createBrowserClient } from "@supabase/ssr";
import { appConfig } from "../app.config";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  client = createBrowserClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
  return client;
}
