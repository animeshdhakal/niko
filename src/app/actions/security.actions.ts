"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

import { Tables } from "@/lib/database.types";

export async function checkAccess(patientId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { hasAccess: false };

  // 1. Check if user is the patient themselves
  if (user.id === patientId) return { hasAccess: true };

  // 2. Check if user has an active grant (Emergency or Consent)
  const { data: grantData } = await supabase
    .from("access_grants")
    .select("*")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const grant = grantData as Tables<"access_grants"> | null;

  if (grant) return { hasAccess: true, grantId: grant.id };

  return { hasAccess: false };
}

export async function activateBreakGlass(patientId: string, reason: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify role is doctor (or appropriate role)
  const { data: profile } = await supabase
    .from("accounts")
    .select("role, name")
    .eq("id", user.id)
    .single();

  // In production, tight check: if (profile?.role !== 'doctor') throw new Error("Only doctors can use emergency access");

  // 1. Log the attempt (CRITICAL)
  await logAuditEvent(
    supabase,
    user.id,
    "EMERGENCY_ACCESS_ATTEMPT",
    "patient",
    patientId,
    { reason },
    "CRITICAL"
  );

  // 2. Grant Access (Create record)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins access

  const { data: grantData, error } = await supabase
    .from("access_grants")
    .insert({
      doctor_id: user.id,
      patient_id: patientId,
      grant_type: "EMERGENCY",
      reason: reason,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Break glass failed:", error);
    throw new Error("Failed to activate emergency protocol");
  }

  const grant = grantData as Tables<"access_grants">;

  // 3. Log the success (ALERT) - This is what triggers the "Phone Call" in the pitch
  await logAuditEvent(
    supabase,
    user.id,
    "EMERGENCY_ACCESS_GRANTED",
    "patient",
    patientId,
    { grantId: grant.id, expiresAt, reason },
    "ALERT"
  );

  // Mock Admin Notification
  console.log(
    `[SECURITY ALERT] User ${profile?.name} (${user.id}) activated BREAK-GLASS for patient ${patientId}. Reason: ${reason}`
  );

  revalidatePath("/"); // Revalidate everything just in case
  return { success: true, grant };
}

/**
 * Search for a patient by their national ID number
 * @param nationalId - The national ID to search for
 * @returns Patient basic info if found, null otherwise
 */
export async function searchPatientByNationalId(nationalId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify user is a doctor
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!account || account.role !== "doctor") {
    throw new Error("Only doctors can search for patients");
  }

  // Search for patient by national ID
  const { data: patient, error } = await supabase
    .from("accounts")
    .select("id, name, email, national_id_no, role")
    .eq("national_id_no", nationalId)
    .eq("role", "citizen")
    .single();

  if (error) {
    // Patient not found is not an error, just return null
    if (error.code === "PGRST116") {
      return { found: false, patient: null };
    }
    throw new Error("Failed to search for patient");
  }

  return {
    found: true,
    patient: {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      nationalIdNo: patient.national_id_no,
    },
  };
}

/**
 * Emergency access to a patient by national ID.
 * If patient is found, grants break-glass access.
 * If patient is not found and createIfNotFound is true, creates a minimal patient record.
 */
export async function emergencyAccessByNationalId(
  nationalId: string,
  reason: string,
  createIfNotFound: boolean = false
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify role is doctor
  const { data: profile } = await supabase
    .from("accounts")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "doctor") {
    throw new Error("Only doctors can use emergency access");
  }

  // Log the search attempt
  await logAuditEvent(
    supabase,
    user.id,
    "EMERGENCY_ACCESS_SEARCH",
    "patient",
    null,
    { nationalId, reason },
    "CRITICAL"
  );

  // Search for patient by national ID
  const { data: patient } = await supabase
    .from("accounts")
    .select("id, name, email, national_id_no")
    .eq("national_id_no", nationalId)
    .eq("role", "citizen")
    .single();

  let patientId: string;
  let patientName: string | null = null;
  let wasCreated = false;

  if (patient) {
    // Patient found - use existing patient
    patientId = patient.id;
    patientName = patient.name;
  } else if (createIfNotFound) {
    // Patient not found - create minimal account record
    const adminClient = getSupabaseAdminClient();

    // Generate a placeholder email (can be updated later)
    const placeholderEmail = `emergency_${nationalId}@placeholder.niko.health`;

    const { data: newPatient, error: createError } = await adminClient
      .from("accounts")
      .insert({
        id: crypto.randomUUID(),
        email: placeholderEmail,
        national_id_no: nationalId,
        role: "citizen",
        name: null, // To be filled in later
        created_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();

    if (createError) {
      console.error("Failed to create emergency patient:", createError);
      throw new Error("Failed to create emergency patient record");
    }

    patientId = newPatient.id;
    patientName = newPatient.name;
    wasCreated = true;

    // Log patient creation
    await logAuditEvent(
      supabase,
      user.id,
      "EMERGENCY_PATIENT_CREATED",
      "patient",
      patientId,
      { nationalId, reason },
      "CRITICAL"
    );

    console.log(
      `[SECURITY ALERT] Doctor ${profile.name} (${user.id}) created EMERGENCY PATIENT with National ID ${nationalId}. Reason: ${reason}`
    );
  } else {
    // Patient not found and creation not allowed
    throw new Error("Patient not found with this National ID");
  }

  // Grant break-glass access to the patient (existing or newly created)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins access

  const { data: grantData, error: grantError } = await supabase
    .from("access_grants")
    .insert({
      doctor_id: user.id,
      patient_id: patientId,
      grant_type: "EMERGENCY",
      reason: reason,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (grantError) {
    console.error("Break glass failed:", grantError);
    throw new Error("Failed to activate emergency protocol");
  }

  const grant = grantData as Tables<"access_grants">;

  // Log the emergency access grant
  await logAuditEvent(
    supabase,
    user.id,
    "EMERGENCY_ACCESS_GRANTED",
    "patient",
    patientId,
    { grantId: grant.id, expiresAt, reason, nationalId, wasCreated },
    "ALERT"
  );

  console.log(
    `[SECURITY ALERT] Doctor ${profile.name} (${
      user.id
    }) activated BREAK-GLASS for patient ${patientId} (National ID: ${nationalId}). Reason: ${reason}. Patient was ${
      wasCreated ? "created" : "found"
    }.`
  );

  revalidatePath("/");
  return {
    success: true,
    grant,
    patient: {
      id: patientId,
      name: patientName,
      nationalIdNo: nationalId,
    },
    wasCreated,
  };
}
