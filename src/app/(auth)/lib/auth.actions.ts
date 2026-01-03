"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { users } from "@/drizzle/schema";
import { getDrizzleSupabaseAdminClient } from "@/lib/drizzle-client";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { LoginFormData, SignupFormData } from "@/app/(auth)/lib/auth.schemas";

export async function login(data: LoginFormData): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "Invalid credentials" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  data: SignupFormData
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Something went wrong" };
  }

  try {
    const db = getDrizzleSupabaseAdminClient();

    await db.insert(users).values({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
    });
  } catch (dbError) {
    console.error("DB Error:", dbError);
    return { error: "Failed to create profile" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
