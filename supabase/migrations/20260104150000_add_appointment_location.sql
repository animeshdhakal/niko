-- Migration: Add location fields to appointments
-- Created: 2026-01-04 15:00:00

ALTER TABLE "public"."appointments"
    ADD COLUMN IF NOT EXISTS "hospital_id" uuid REFERENCES "public"."hospitals"("id"),
    ADD COLUMN IF NOT EXISTS "department_id" uuid REFERENCES "public"."hospital_departments"("id");
