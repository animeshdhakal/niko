import "server-only";

import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/server-client";
import { redirect } from "next/navigation";
import { users } from "@/drizzle/schema";
import { getDrizzleSupabaseAdminClient } from "./drizzle-client";
import { eq } from "drizzle-orm";

export async function getUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type UserRole = "citizen" | "provider" | "ministry";

export async function checkRole(requiredRole: UserRole) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const db = getDrizzleSupabaseAdminClient();
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: {
      role: true,
    },
  });

  if (!dbUser || dbUser.role !== requiredRole) {
    throw new Error("Unauthorized");
  }

  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionFunction<T extends z.ZodType<any, any>, R> = (
  data: z.infer<T>
) => Promise<R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enhanceAction<T extends z.ZodType<any, any>, R>(
  schema: T,
  action: ActionFunction<T, R>
) {
  return async (data: z.infer<T> | FormData) => {
    try {
      // Handle both plain object and FormData to be robust,
      // but user asked for "normal function" so expecting object.
      // Let's support data object primarily.

      const inputData =
        data instanceof FormData ? Object.fromEntries(data) : data;
      const parsed = schema.safeParse(inputData);

      if (!parsed.success) {
        return {
          error: parsed.error.issues[0].message,
        };
      }

      await action(parsed.data);
      return { success: true };
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof (error as { digest: string }).digest === "string" &&
        (error as { digest: string }).digest.includes("NEXT_REDIRECT")
      ) {
        throw error;
      }
      console.error("Action Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      return {
        error: errorMessage,
      };
    }
  };
}
