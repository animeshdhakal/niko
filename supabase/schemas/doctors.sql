-- Doctors Schema

CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "hospital_department_id" uuid NOT NULL REFERENCES "public"."hospital_departments"("id") ON DELETE CASCADE,
    "daily_capacity" double precision DEFAULT 10 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "ministry_manage_doctors" ON "public"."doctors"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "public_view_doctors" ON "public"."doctors"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
