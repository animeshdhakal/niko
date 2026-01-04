import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL" | "ALERT";

export async function logAuditEvent(
  client: SupabaseClient<Database>,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null = null,
  metadata: { [key: string]: any } | null = null,
  severity: AuditSeverity = "INFO"
) {
  try {
    const { error } = await client.from("audit_logs").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      severity,
    });

    if (error) {
      console.error("FAILED TO LOG AUDIT EVENT:", error);
      // In a real critical system, we might want to fail the parent transaction if audit fails.
    }
  } catch (e) {
    console.error("EXCEPTION LOGGING AUDIT EVENT:", e);
  }
}
