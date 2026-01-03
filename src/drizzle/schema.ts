import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  pgPolicy,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", [
  "citizen",
  "provider",
  "ministry",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull(), // We reference auth.users manually in logic or via foreign key if we pull auth schema
    email: text("email").notNull(),
    name: text("name"),
    role: userRole("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("view_own_profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`auth.uid() = ${table.id}`,
    }),
    pgPolicy("update_own_profile", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`auth.uid() = ${table.id}`,
    }),
  ]
);

export const hospitals = pgTable(
  "hospitals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    contactNumber: text("contact_number").notNull(),
    email: text("email").notNull(),
    province: text("province"),
    district: text("district"),
    city: text("city"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  () => [
    pgPolicy("ministry_manage_hospitals", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
      withCheck: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
  ]
);

export const hospitalDepartments = pgTable(
  "hospital_departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hospitalId: uuid("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  () => [
    pgPolicy("ministry_manage_departments", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
      withCheck: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
  ]
);
