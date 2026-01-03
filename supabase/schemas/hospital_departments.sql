-- Hospital Departments Schema

CREATE TABLE IF NOT EXISTS "public"."hospital_departments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "hospital_id" uuid NOT NULL REFERENCES "public"."hospitals"("id") ON DELETE CASCADE,
    "name" text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."hospital_departments" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "ministry_manage_departments" ON "public"."hospital_departments"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "universal_view_departments" ON "public"."hospital_departments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
