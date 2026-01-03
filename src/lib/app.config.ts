import { z } from "zod";

const production = process.env.NODE_ENV === "production";

export const AppConfigSchema = z.object({
  supabaseUrl: z.string("NEXT_PUBLIC_SUPABASE_URL is required"),
  supabaseAnonKey: z.string("NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  production: z.boolean().default(false),
});

export const appConfig = AppConfigSchema.parse({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  production,
});
