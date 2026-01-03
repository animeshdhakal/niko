import { createBrowserClient } from "@supabase/ssr";
import { appConfig } from "../app.config";

export function getSupabaseBrowserClient() {
  return createBrowserClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
}
