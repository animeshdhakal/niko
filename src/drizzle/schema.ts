import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  pgPolicy,
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
