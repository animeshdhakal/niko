-- Migration: Add system_keys table for PKI
-- Created: 2026-01-04 16:00:00

CREATE TABLE IF NOT EXISTS "public"."system_keys" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key_type" text NOT NULL UNIQUE,
    "public_key" text NOT NULL,
    "encrypted_private_key" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "public"."system_keys" ENABLE ROW LEVEL SECURITY;

-- Only Ministry can manage system keys
DROP POLICY IF EXISTS "ministry_manage_system_keys" ON "public"."system_keys";
CREATE POLICY "ministry_manage_system_keys" ON "public"."system_keys"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

-- Allow read for authenticated users if needed for verification?
-- Actually, only public_key is needed for verification.
-- But public_key for Root CA is needed by everyone.
DROP POLICY IF EXISTS "public_view_system_keys" ON "public"."system_keys";
CREATE POLICY "public_view_system_keys" ON "public"."system_keys"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
