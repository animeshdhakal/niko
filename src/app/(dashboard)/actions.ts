"use server";

import { z } from "zod";
import { checkRole } from "@/lib/server-utils";
import { getDrizzleSupabaseAdminClient } from "@/lib/drizzle-client";
import { hospitals } from "@/drizzle/schema";
import { count, desc, ilike, or } from "drizzle-orm";

const GetHospitalsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  search: z.string().optional(),
  pageSize: z.coerce.number().min(1).default(10),
});

export async function getHospitals(input: z.input<typeof GetHospitalsSchema>) {
  await checkRole("ministry");

  const { page, search, pageSize } = GetHospitalsSchema.parse(input);
  const offset = (page - 1) * pageSize;

  const db = getDrizzleSupabaseAdminClient();

  const whereClause = search
    ? or(
        ilike(hospitals.name, `%${search}%`),
        ilike(hospitals.city, `%${search}%`),
        ilike(hospitals.district, `%${search}%`),
        ilike(hospitals.province, `%${search}%`)
      )
    : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(hospitals)
    .where(whereClause);

  const data = await db
    .select()
    .from(hospitals)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(hospitals.createdAt));

  const totalPages = Math.ceil(totalResult.count / pageSize);

  return {
    hospitals: data,
    totalPages,
    currentPage: page,
  };
}
