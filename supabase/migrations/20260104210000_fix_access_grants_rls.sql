-- Migration: Fix RLS policies for access_grants to allow Patients and Doctors to create grants

-- 1. Patients can view their own grants (to see who has access)
CREATE POLICY "Patients can view their grants" ON access_grants
    FOR SELECT
    USING (auth.uid() = patient_id);

-- 2. Patients can insert grants (When approving a request)
CREATE POLICY "Patients can create grants" ON access_grants
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- 3. Doctors can insert grants (When activating Break-Glass emergency access)
CREATE POLICY "Doctors can create grants" ON access_grants
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);
