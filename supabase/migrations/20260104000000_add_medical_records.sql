-- Migration: Add Medical Records to Appointments
-- Created: 2026-01-04

-- Add lab_report_type enum
CREATE TYPE "public"."lab_report_type" AS ENUM('blood_test', 'urine_test', 'xray', 'ct_scan', 'mri', 'ultrasound', 'other');

-- Add medical record fields to appointments table
ALTER TABLE "public"."appointments"
    ADD COLUMN IF NOT EXISTS "initial_symptoms" text,
    ADD COLUMN IF NOT EXISTS "diagnosis" text,
    ADD COLUMN IF NOT EXISTS "final_diagnosis" text,
    ADD COLUMN IF NOT EXISTS "doctor_notes" text,
    ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add provider update policy for appointments
CREATE POLICY "provider_update_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'));

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS "public"."prescriptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "appointment_id" uuid NOT NULL REFERENCES "public"."appointments"("id") ON DELETE CASCADE,
    "medicine_name" text NOT NULL,
    "dosage" text NOT NULL,
    "frequency" text NOT NULL,
    "duration" text,
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "public"."prescriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_prescriptions" ON "public"."prescriptions"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (
        select 1 from public.appointments
        where appointments.id = prescriptions.appointment_id
        and appointments.user_id = auth.uid()
    ));

CREATE POLICY "provider_manage_prescriptions" ON "public"."prescriptions"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'));

CREATE POLICY "ministry_view_prescriptions" ON "public"."prescriptions"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS "public"."lab_reports" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "appointment_id" uuid NOT NULL REFERENCES "public"."appointments"("id") ON DELETE CASCADE,
    "report_type" lab_report_type NOT NULL,
    "report_name" text NOT NULL,
    "file_url" text,
    "notes" text,
    "created_by" uuid NOT NULL REFERENCES "public"."accounts"("id"),
    "checked_by" uuid REFERENCES "public"."accounts"("id"),
    "report_date" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "public"."lab_reports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_lab_reports" ON "public"."lab_reports"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (
        select 1 from public.appointments
        where appointments.id = lab_reports.appointment_id
        and appointments.user_id = auth.uid()
    ));

CREATE POLICY "provider_manage_lab_reports" ON "public"."lab_reports"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'));

CREATE POLICY "ministry_view_lab_reports" ON "public"."lab_reports"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

-- Create lab_report_items table
CREATE TABLE IF NOT EXISTS "public"."lab_report_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "lab_report_id" uuid NOT NULL REFERENCES "public"."lab_reports"("id") ON DELETE CASCADE,
    "test_name" text NOT NULL,
    "result" text NOT NULL,
    "normal_range" text,
    "unit" text,
    "is_abnormal" boolean DEFAULT false
);

ALTER TABLE "public"."lab_report_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_lab_report_items" ON "public"."lab_report_items"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (
        select 1 from public.lab_reports lr
        join public.appointments a on a.id = lr.appointment_id
        where lr.id = lab_report_items.lab_report_id
        and a.user_id = auth.uid()
    ));

CREATE POLICY "provider_manage_lab_report_items" ON "public"."lab_report_items"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'provider'));

CREATE POLICY "ministry_view_lab_report_items" ON "public"."lab_report_items"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));
