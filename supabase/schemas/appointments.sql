-- Appointments Schema

CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "public"."accounts"("id") ON DELETE CASCADE,
    "doctor_id" uuid NOT NULL REFERENCES "public"."doctors"("id") ON DELETE CASCADE,
    "date" timestamp NOT NULL,
    "status" appointment_status DEFAULT 'pending' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "create_own_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ministry_view_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));
