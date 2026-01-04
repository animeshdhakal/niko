-- Prescriptions Schema

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

-- Enable Row Level Security
ALTER TABLE "public"."prescriptions" ENABLE ROW LEVEL SECURITY;

-- Policies
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
