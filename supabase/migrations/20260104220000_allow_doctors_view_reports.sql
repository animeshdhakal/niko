-- Migration: Allow doctors to view lab reports if they have an active access grant

-- 1. Policy for lab_reports
CREATE POLICY "Doctors can view reports with access grant" ON "public"."lab_reports"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN access_grants ag ON ag.patient_id = a.user_id
            WHERE a.id = lab_reports.appointment_id
            AND ag.doctor_id = auth.uid()
            AND ag.expires_at > now()
        )
    );

-- 2. Policy for lab_report_items
CREATE POLICY "Doctors can view report items with access grant" ON "public"."lab_report_items"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_reports lr
            JOIN appointments a ON a.id = lr.appointment_id
            JOIN access_grants ag ON ag.patient_id = a.user_id
            WHERE lr.id = lab_report_items.lab_report_id
            AND ag.doctor_id = auth.uid()
            AND ag.expires_at > now()
        )
    );
