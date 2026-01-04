"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

/**
 * Doctor requests access to a patient
 */
export async function requestAccess(patientId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Check if pending request exists
  const { data: existing } = await supabase
    .from("access_requests")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .eq("status", "PENDING")
    .single();

  if (existing) return { success: true, message: "Request already pending" };

  const { error } = await supabase.from("access_requests").insert({
    doctor_id: user.id,
    patient_id: patientId,
    status: "PENDING",
  });

  if (error) throw new Error(error.message);

  logAuditEvent(
    supabase,
    user.id,
    "ACCESS_REQUEST_CREATED",
    "patient",
    patientId
  );
  return { success: true };
}

/**
 * Patient approves an access request
 */
export async function approveAccess(requestId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch request
  const { data: request } = await supabase
    .from("access_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) throw new Error("Request not found");
  if (request.patient_id !== user.id) throw new Error("Unauthorized");

  // 1. Update Request Status
  const { error: updateError } = await supabase
    .from("access_requests")
    .update({ status: "APPROVED", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) throw new Error(updateError.message);

  // 2. Grant Access (3 Days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  const { error: grantError } = await supabase.from("access_grants").insert({
    doctor_id: request.doctor_id,
    patient_id: request.patient_id,
    grant_type: "CONSENT",
    reason: "Patient Consent",
    expires_at: expiresAt.toISOString(),
  });

  if (grantError) throw new Error(grantError.message);

  logAuditEvent(
    supabase,
    user.id,
    "ACCESS_REQUEST_APPROVED",
    "request",
    requestId,
    { doctorId: request.doctor_id },
    "INFO"
  );
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Patient rejects an access request
 */
export async function rejectAccess(requestId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: request } = await supabase
    .from("access_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) throw new Error("Request not found");
  if (request.patient_id !== user.id) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("access_requests")
    .update({ status: "REJECTED", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  logAuditEvent(
    supabase,
    user.id,
    "ACCESS_REQUEST_REJECTED",
    "request",
    requestId
  );
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Fetch requests for the current patient
 */
export async function getPatientAccessRequests() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("access_requests")
    .select(
      `
            *,
            doctor:accounts!access_requests_doctor_id_fkey (
                name,
                email
            )
        `
    )
    .eq("patient_id", user.id)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  return data || [];
}
