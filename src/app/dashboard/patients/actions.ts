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

  // Get list of unique patient IDs from the appointments
  const patientIds = Array.from(
    new Set(data?.map((app) => app.patient?.id).filter(Boolean))
  );

  // Fetch active access grants for these patients
  const { data: grants } = await supabase
    .from("access_grants")
    .select("patient_id")
    .eq("doctor_id", user.id)
    .in("patient_id", patientIds)
    .gt("expires_at", new Date().toISOString());

  const grantSet = new Set(grants?.map((g) => g.patient_id));

  const appointmentsWithAccess =
    data?.map((app) => ({
      ...app,
      hasAccess: grantSet.has(app.patient?.id),
    })) || [];

  return {
    appointments: appointmentsWithAccess,
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

const GetPatientLabReportsSchema = z.object({
  patientId: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});

export async function getPatientLabReports(
  input: z.input<typeof GetPatientLabReportsSchema>
) {
  const { patientId, page, pageSize } = GetPatientLabReportsSchema.parse(input);
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Verify Doctor Access
  const { data: grant } = await supabase
    .from("access_grants")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!grant) {
    throw new Error("Access denied. No active grant found for this patient.");
  }

  const offset = (page - 1) * pageSize;

  // 2. Fetch Reports
  // We filter by appointment's user_id
  const { data, count, error } = await supabase
    .from("lab_reports")
    .select(
      `
      *,
      lab_report_items(*),
      creator: created_by (
        name
      ),
      appointments!inner (
        user_id,
        users:accounts!appointments_user_id_fkey (
          email
        )
      )
    `,
      { count: "exact" }
    )
    .eq("appointments.user_id", patientId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(error.message);
  }

  return {
    reports: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  };
}
