"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

const GetDoctorAppointmentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
  status: z
    .enum(["all", "pending", "confirmed", "cancelled", "completed"])
    .default("all"),
});

export async function getDoctorAppointments(
  input: z.input<typeof GetDoctorAppointmentsSchema> = {}
) {
  const { page, pageSize, status } = GetDoctorAppointmentsSchema.parse(input);
  const offset = (page - 1) * pageSize;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify user is a doctor
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!account || account.role !== "doctor") {
    throw new Error("Access denied. Only doctors can access this page.");
  }

  // Build query
  let countQuery = supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id);

  let dataQuery = supabase
    .from("appointments")
    .select(
      `
      *,
      patient:accounts!appointments_user_id_fkey(
        id,
        name,
        email,
        national_id_no
      )
    `
    )
    .eq("doctor_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Apply status filter
  if (status !== "all") {
    countQuery = countQuery.eq("status", status);
    dataQuery = dataQuery.eq("status", status);
  }

  const { count } = await countQuery;
  const totalPages = Math.ceil((count || 0) / pageSize);

  const { data, error } = await dataQuery;

  if (error) {
    throw new Error(error.message);
  }

  return {
    appointments: data || [],
    totalPages,
    currentPage: page,
    totalCount: count || 0,
  };
}

const UpdateAppointmentDiagnosisSchema = z.object({
  appointmentId: z.string().uuid(),
  initialSymptoms: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  finalDiagnosis: z.string().optional().nullable(),
  doctorNotes: z.string().optional().nullable(),
});

export async function updateAppointmentDiagnosis(
  input: z.input<typeof UpdateAppointmentDiagnosisSchema>
) {
  const {
    appointmentId,
    initialSymptoms,
    diagnosis,
    finalDiagnosis,
    doctorNotes,
  } = UpdateAppointmentDiagnosisSchema.parse(input);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify user is a doctor
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!account || account.role !== "doctor") {
    throw new Error("Access denied. Only doctors can update diagnoses.");
  }

  // Verify appointment belongs to this doctor
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .eq("doctor_id", user.id)
    .single();

  if (!appointment) {
    throw new Error("Appointment not found or access denied.");
  }

  // Update the appointment
  const { error } = await supabase
    .from("appointments")
    .update({
      initial_symptoms: initialSymptoms,
      diagnosis: diagnosis,
      final_diagnosis: finalDiagnosis,
      doctor_notes: doctorNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/patients");
  return { success: true };
}

const UpdateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

export async function updateAppointmentStatus(
  input: z.input<typeof UpdateAppointmentStatusSchema>
) {
  const { appointmentId, status } = UpdateAppointmentStatusSchema.parse(input);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify user is a doctor
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!account || account.role !== "doctor") {
    throw new Error(
      "Access denied. Only doctors can update appointment status."
    );
  }

  // Verify appointment belongs to this doctor
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .eq("doctor_id", user.id)
    .single();

  if (!appointment) {
    throw new Error("Appointment not found or access denied.");
  }

  // Update status
  const { error } = await supabase
    .from("appointments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/patients");
  return { success: true };
}
