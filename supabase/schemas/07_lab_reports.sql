-- Lab Reports Schema

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

-- Enable Row Level Security
ALTER TABLE "public"."lab_reports" ENABLE ROW LEVEL SECURITY;

-- Policies
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
