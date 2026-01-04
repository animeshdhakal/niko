-- Hospitals Schema
-- Healthcare facility information

CREATE TABLE IF NOT EXISTS "public"."hospitals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "contact_number" text NOT NULL,
    "email" text NOT NULL,
    "province" text,
    "district" text,
    "city" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."hospitals" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "ministry_manage_hospitals" ON "public"."hospitals"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

CREATE POLICY "universal_view_hospitals" ON "public"."hospitals"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
