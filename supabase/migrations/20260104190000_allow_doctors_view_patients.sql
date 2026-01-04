-- Migration: Allow doctors to view patients they have appointments with

-- Policy for accounts table
-- Doctors should be able to see the basic profile info of patients they have appointments with
CREATE POLICY "Doctors can view patients with appointments" ON "public"."accounts"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.doctor_id = auth.uid()
            AND appointments.user_id = accounts.id
        )
    );
