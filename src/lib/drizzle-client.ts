import "server-only";

import { DrizzleConfig, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { JwtPayload, jwtDecode } from "jwt-decode";
import postgres from "postgres";
import { z } from "zod";

import * as schema from "../drizzle/schema";
import { getSupabaseServerClient } from "./supabase/server-client";

// Config validation
const SUPABASE_DATABASE_URL = z
  .url("Database URL is required")
  .parse(process.env.SUPABASE_DATABASE_URL!);

const config = {
  casing: "snake_case",
  schema,
} satisfies DrizzleConfig<typeof schema>;

// Admin client bypasses RLS
const adminClient = drizzle({
  client: postgres(SUPABASE_DATABASE_URL, { prepare: false }),
  ...config,
});

// RLS protected client
const rlsClient = drizzle({
  client: postgres(SUPABASE_DATABASE_URL, { prepare: false }),
  ...config,
});

export function getDrizzleSupabaseAdminClient() {
  return adminClient;
}

export async function getDrizzleSupabaseClient() {
  const client = await getSupabaseServerClient();
  const { data } = await client.auth.getSession();
  const accessToken = data.session?.access_token ?? "";
  const token = decode(accessToken);

  const runTransaction = ((transaction, config) => {
    return rlsClient.transaction(async (tx) => {
      try {
        // Set up Supabase auth context
        await tx.execute(sql`
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token)
          )}', TRUE);
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? ""
          )}', TRUE);
          set local role ${sql.raw(token.role ?? "anon")};
        `);

        return await transaction(tx);
      } finally {
        // Clean up
        await tx.execute(sql`
          select set_config('request.jwt.claims', NULL, TRUE);
          select set_config('request.jwt.claim.sub', NULL, TRUE);
          reset role;
        `);
      }
    }, config);
  }) as typeof rlsClient.transaction;

  return {
    runTransaction,
  };
}

function decode(accessToken: string) {
  try {
    return jwtDecode<JwtPayload & { role: string }>(accessToken);
  } catch {
    return { role: "anon" } as JwtPayload & { role: string };
  }
}
