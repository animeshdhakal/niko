"use server";

import { z } from "zod";
import { checkRole } from "@/lib/server-utils";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const GetHospitalsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  search: z.string().optional(),
  pageSize: z.coerce.number().min(1).default(10),
});

export async function getHospitals(input: z.input<typeof GetHospitalsSchema>) {
  await checkRole("ministry");

  const { page, search, pageSize } = GetHospitalsSchema.parse(input);
  const offset = (page - 1) * pageSize;

  const supabase = getSupabaseAdminClient();

  let query = supabase.from("hospitals").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,district.ilike.%${search}%,province.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(error.message);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    hospitals: data || [],
    totalPages,
    currentPage: page,
  };
}
