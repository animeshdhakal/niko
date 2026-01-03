"use server";

import { z } from "zod";
import { getDrizzleSupabaseClient } from "@/lib/drizzle-client";
import {
  appointments,
  doctors,
  hospitalDepartments,
  hospitals,
} from "@/drizzle/schema";
import { eq, sql, and, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.date(),
});

export async function bookAppointment(
  input: z.input<typeof BookAppointmentSchema>
) {
  const { doctorId, date } = BookAppointmentSchema.parse(input);
  const { runTransaction } = await getDrizzleSupabaseClient();

  return await runTransaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, sql`auth.uid()`),
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.nationalIdNo) {
      throw new Error("National ID Number is required to book an appointment");
    }

    // Check capacity
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointmentsCount = await tx
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          gte(appointments.date, startOfDay),
          lt(appointments.date, endOfDay),
          eq(appointments.status, "confirmed") // Assuming only confirmed count towards capacity, or pending? Let's say all non-cancelled.
          // For simplicity, let's count all for now or filter status != cancelled
        )
      );

    // We need to fetch doctor's capacity
    const doctor = await tx.query.doctors.findFirst({
      where: eq(doctors.id, doctorId),
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const currentCount = Number(existingAppointmentsCount[0].count);

    if (currentCount >= doctor.dailyCapacity) {
      throw new Error("Doctor is fully booked for this date");
    }

    // Book appointment
    await tx.insert(appointments).values({
      userId: user.id,
      doctorId,
      date,
      status: "confirmed", // Auto confirm for now
    });

    revalidatePath("/appointments");
    return { success: true };
  });
}

export async function getDoctorsByDepartment(departmentId: string) {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    return await tx.query.doctors.findMany({
      where: eq(doctors.hospitalDepartmentId, departmentId),
    });
  });
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

  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    const totalResult = await tx
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.userId, sql`auth.uid()`));

    const totalPages = Math.ceil(totalResult[0].count / pageSize);

    const data = await tx.query.appointments.findMany({
      where: (appointments, { eq }) => eq(appointments.userId, sql`auth.uid()`),
      with: {
        doctor: {
          with: {
            department: {
              with: {
                hospital: true,
              },
            },
          },
        },
      },
      orderBy: (appointments, { desc }) => [desc(appointments.date)],
      limit: pageSize,
      offset: offset,
    });

    return {
      appointments: data,
      totalPages,
      currentPage: page,
    };
  });
}

export async function getDepartments(hospitalId: string) {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    return await tx.query.hospitalDepartments.findMany({
      where: eq(hospitalDepartments.hospitalId, hospitalId),
    });
  });
}

export async function getProvinces() {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    const data = await tx
      .select({ province: hospitals.province })
      .from(hospitals)
      .groupBy(hospitals.province);
    return data
      .map((d) => d.province)
      .filter((p): p is string => p !== null)
      .sort();
  });
}

export async function getDistricts(province: string) {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    const data = await tx
      .select({ district: hospitals.district })
      .from(hospitals)
      .where(eq(hospitals.province, province))
      .groupBy(hospitals.district);
    return data
      .map((d) => d.district)
      .filter((d): d is string => d !== null)
      .sort();
  });
}

export async function getCities(province: string, district: string) {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    const data = await tx
      .select({ city: hospitals.city })
      .from(hospitals)
      .where(
        and(eq(hospitals.province, province), eq(hospitals.district, district))
      )
      .groupBy(hospitals.city);
    return data
      .map((d) => d.city)
      .filter((c): c is string => c !== null)
      .sort();
  });
}

export async function getHospitalsByLocation(
  province: string,
  district: string,
  city: string
) {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    return await tx.query.hospitals.findMany({
      where: and(
        eq(hospitals.province, province),
        eq(hospitals.district, district),
        eq(hospitals.city, city)
      ),
      columns: {
        id: true,
        name: true,
      },
    });
  });
}

export async function getAllHospitalsForBooking() {
  const { runTransaction } = await getDrizzleSupabaseClient();
  return await runTransaction(async (tx) => {
    return await tx.query.hospitals.findMany({
      columns: {
        id: true,
        name: true,
        city: true,
        district: true,
      },
    });
  });
}
