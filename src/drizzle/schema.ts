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
    nationalIdNo: text("national_id_no").unique(),
    role: userRole("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("view_own_profile", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`auth.uid() = ${table.id}`,
    }),
    pgPolicy("update_own_profile", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
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
      to: ["authenticated"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
      withCheck: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
    pgPolicy("universal_view_hospitals", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`true`,
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
      to: ["authenticated"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
      withCheck: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
    pgPolicy("universal_view_departments", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`true`,
    }),
  ]
);

// Relations

export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "deleted",
]);

export const doctors = pgTable(
  "doctors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    hospitalDepartmentId: uuid("hospital_department_id")
      .notNull()
      .references(() => hospitalDepartments.id, { onDelete: "cascade" }),
    dailyCapacity: doublePrecision("daily_capacity").notNull().default(10), // Using doublePrecision for number, or integer if available/preferred. Usually integer for capacity. Drizzle has integer.
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  () => [
    pgPolicy("ministry_manage_doctors", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
      withCheck: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
    pgPolicy("public_view_doctors", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`true`,
    }),
  ]
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(), // Using timestamp for date
    status: appointmentStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("view_own_appointments", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`auth.uid() = ${table.userId}`,
    }),
    pgPolicy("create_own_appointments", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`auth.uid() = ${table.userId}`,
    }),
    pgPolicy("ministry_view_appointments", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`exists (select 1 from public.users where id = auth.uid() and role = 'ministry')`,
    }),
  ]
);

// Relations
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  departments: many(hospitalDepartments),
}));

export const hospitalDepartmentsRelations = relations(
  hospitalDepartments,
  ({ one, many }) => ({
    hospital: one(hospitals, {
      fields: [hospitalDepartments.hospitalId],
      references: [hospitals.id],
    }),
    doctors: many(doctors),
  })
);

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  department: one(hospitalDepartments, {
    fields: [doctors.hospitalDepartmentId],
    references: [hospitalDepartments.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));
