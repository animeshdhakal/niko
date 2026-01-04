-- 1. Modify accounts table to include doctor-specific fields
ALTER TABLE "public"."accounts"
ADD COLUMN "hospital_department_id" uuid REFERENCES "public"."hospital_departments"("id") ON DELETE SET NULL,
ADD COLUMN "daily_capacity" double precision DEFAULT 10;

-- 2. Update appointments table constraints BEFORE dropping doctors
-- Drop the existing FK to doctors
ALTER TABLE "public"."appointments"
DROP CONSTRAINT "appointments_doctor_id_fkey";

-- Add new FK to accounts
ALTER TABLE "public"."appointments"
ADD CONSTRAINT "appointments_doctor_id_fkey"
FOREIGN KEY ("doctor_id")
REFERENCES "public"."accounts"("id")
ON DELETE CASCADE;

-- 3. Drop dependent policies on appointments table
DROP POLICY IF EXISTS "doctor_view_own_appointments" ON "public"."appointments";
DROP POLICY IF EXISTS "doctor_update_own_appointments" ON "public"."appointments";

-- 4. Drop doctors table
DROP TABLE "public"."doctors";

-- 5. Re-create policies on appointments table
-- doctor_view_own_appointments: check auth.uid() = doctor_id
CREATE POLICY "doctor_view_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = doctor_id);

-- doctor_update_own_appointments: check auth.uid() = doctor_id
CREATE POLICY "doctor_update_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (auth.uid() = doctor_id);

-- 6. Update accounts policies
CREATE POLICY "view_doctor_profiles" ON "public"."accounts"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (role = 'doctor');
