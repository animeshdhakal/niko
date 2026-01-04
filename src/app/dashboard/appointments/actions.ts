"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.date(),
});

export async function bookAppointment(
  input: z.input<typeof BookAppointmentSchema>
) {
  const { doctorId, date } = BookAppointmentSchema.parse(input);
  const supabase = await getSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Not authenticated");
  }

  // Get user profile
  const { data: user, error: userError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  if (!user.national_id_no) {
    throw new Error("National ID Number is required to book an appointment");
  }

  // Check capacity
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { count: existingCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .gte("date", startOfDay.toISOString())
    .lt("date", endOfDay.toISOString())
    .eq("status", "confirmed");

  // Get doctor
  const { data: doctor, error: doctorError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", doctorId)
    .eq("role", "doctor")
    .single();

  if (doctorError || !doctor) {
    throw new Error("Doctor not found");
  }

  const currentCount = existingCount || 0;

  if (currentCount >= 10) {
    throw new Error("Doctor is fully booked for this date");
  }

  // Book appointment
  const { error: insertError } = await supabase.from("appointments").insert({
    user_id: user.id,
    doctor_id: doctorId,
    date: date.toISOString(),
    status: "confirmed",
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/appointments");
  return { success: true };
}

export async function getDoctorsByDepartment(departmentId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("role", "doctor")
    .eq("hospital_department_id", departmentId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

const GetUserAppointmentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});

export async function getUserAppointments(
  input: z.input<typeof GetUserAppointmentsSchema> = {}
) {
  const { page, pageSize } = GetUserAppointmentsSchema.parse(input);
  const offset = (page - 1) * pageSize;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { count } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalPages = Math.ceil((count || 0) / pageSize);

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctor:accounts!appointments_doctor_id_fkey(
        *,
        department:hospital_departments(
          *,
          hospital:hospitals(*)
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(error.message);
  }

  return {
    appointments: data || [],
    totalPages,
    currentPage: page,
  };
}

export async function getDepartments(hospitalId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospital_departments")
    .select("*")
    .eq("hospital_id", hospitalId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getProvinces() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("province")
    .not("province", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  // Get unique provinces
  const provinces = [...new Set(data?.map((d) => d.province))].filter(
    (p): p is string => p !== null
  );
  return provinces.sort();
}

export async function getDistricts(province: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("district")
    .eq("province", province)
    .not("district", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const districts = [...new Set(data?.map((d) => d.district))].filter(
    (d): d is string => d !== null
  );
  return districts.sort();
}

export async function getCities(province: string, district: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("city")
    .eq("province", province)
    .eq("district", district)
    .not("city", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const cities = [...new Set(data?.map((d) => d.city))].filter(
    (c): c is string => c !== null
  );
  return cities.sort();
}

export async function getHospitalsByLocation(
  province: string,
  district: string,
  city: string
) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("id, name")
    .eq("province", province)
    .eq("district", district)
    .eq("city", city);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAllHospitalsForBooking() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("id, name, city, district");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAppointmentDetails(appointmentId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get appointment with doctor info
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctor:accounts!appointments_doctor_id_fkey(
        *,
        department:hospital_departments(
          *,
          hospital:hospitals(*)
        )
      )
    `
    )
    .eq("id", appointmentId)
    .single();

  if (appointmentError) {
    throw new Error(appointmentError.message);
  }

  // Get prescriptions
  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false });

  if (prescriptionsError) {
    throw new Error(prescriptionsError.message);
  }

  // Get lab reports with items and creator/checker info
  const { data: labReports, error: labReportsError } = await supabase
    .from("lab_reports")
    .select(
      `
      *,
      created_by_account:accounts!lab_reports_created_by_fkey(id, name),
      checked_by_account:accounts!lab_reports_checked_by_fkey(id, name),
      items:lab_report_items(*)
    `
    )
    .eq("appointment_id", appointmentId)
    .order("report_date", { ascending: false });

  if (labReportsError) {
    throw new Error(labReportsError.message);
  }

  return {
    appointment,
    prescriptions: prescriptions || [],
    labReports: labReports || [],
  };
}
