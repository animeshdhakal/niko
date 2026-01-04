"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getLabReports() {
  const supabase = await getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("lab_reports")
    .select(
      `
      *,
      lab_report_items(*),
      appointments (
        user_id,
        users: accounts!user_id (
          email
        )
      ),
      creator: accounts!created_by (
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lab reports:", error);
    return [];
  }

  return data;
}
