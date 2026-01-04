-- Lab Report Items Schema (for textual test results)

CREATE TABLE IF NOT EXISTS "public"."lab_report_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "lab_report_id" uuid NOT NULL REFERENCES "public"."lab_reports"("id") ON DELETE CASCADE,
    "test_name" text NOT NULL,
    "result" text NOT NULL,
    "normal_range" text,
    "unit" text,
    "is_abnormal" boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE "public"."lab_report_items" ENABLE ROW LEVEL SECURITY;

-- Policies (inherit from parent lab_reports)
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
