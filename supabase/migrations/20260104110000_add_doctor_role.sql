-- Migration: Add doctor role and link doctors to accounts
-- Date: 2026-01-04

-- Step 1: Add 'doctor' to user_role enum
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'doctor';

-- Step 2: Add account_id column to doctors table
ALTER TABLE "public"."doctors"
ADD COLUMN IF NOT EXISTS "account_id" uuid UNIQUE REFERENCES "public"."accounts"("id") ON DELETE SET NULL;

-- Step 3: Add RLS policy for doctors to view their own record
DROP POLICY IF EXISTS "doctor_view_own_record" ON "public"."doctors";
CREATE POLICY "doctor_view_own_record" ON "public"."doctors"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (account_id = auth.uid());

-- Step 4: Add RLS policies for doctors to view/update their appointments
DROP POLICY IF EXISTS "doctor_view_own_appointments" ON "public"."appointments";
CREATE POLICY "doctor_view_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (
        select 1 from public.doctors d
        where d.id = appointments.doctor_id
        and d.account_id = auth.uid()
    ));

DROP POLICY IF EXISTS "doctor_update_own_appointments" ON "public"."appointments";
CREATE POLICY "doctor_update_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (exists (
        select 1 from public.doctors d
        where d.id = appointments.doctor_id
        and d.account_id = auth.uid()
    ));
