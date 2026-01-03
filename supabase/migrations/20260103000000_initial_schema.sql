-- Migration: Initial Schema with RLS Policies
-- Created for Niko Healthcare Platform

-- Create enums
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'deleted');
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'provider', 'ministry');

-- Create accounts table (user profiles)
CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" uuid PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "national_id_no" text UNIQUE,
    "role" user_role NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS "public"."hospitals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "contact_number" text NOT NULL,
    "email" text NOT NULL,
    "province" text,
    "district" text,
    "city" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create hospital_departments table
CREATE TABLE IF NOT EXISTS "public"."hospital_departments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "hospital_id" uuid NOT NULL REFERENCES "public"."hospitals"("id") ON DELETE CASCADE,
    "name" text NOT NULL
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "hospital_department_id" uuid NOT NULL REFERENCES "public"."hospital_departments"("id") ON DELETE CASCADE,
    "daily_capacity" double precision DEFAULT 10 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "public"."accounts"("id") ON DELETE CASCADE,
    "doctor_id" uuid NOT NULL REFERENCES "public"."doctors"("id") ON DELETE CASCADE,
    "date" timestamp NOT NULL,
    "status" appointment_status DEFAULT 'pending' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hospitals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hospital_departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts table
CREATE POLICY "view_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- RLS Policies for hospitals table
CREATE POLICY "ministry_manage_hospitals" ON "public"."hospitals"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "universal_view_hospitals" ON "public"."hospitals"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);

-- RLS Policies for hospital_departments table
CREATE POLICY "ministry_manage_departments" ON "public"."hospital_departments"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "universal_view_departments" ON "public"."hospital_departments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);

-- RLS Policies for doctors table
CREATE POLICY "ministry_manage_doctors" ON "public"."doctors"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "public_view_doctors" ON "public"."doctors"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);

-- RLS Policies for appointments table
CREATE POLICY "view_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "create_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ministry_view_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));
