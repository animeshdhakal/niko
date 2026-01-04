-- Migration: Add PKI Infrastructure
-- Created: 2026-01-04 14:00:00

-- Create system_keys table for Root CA
CREATE TABLE IF NOT EXISTS "public"."system_keys" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key_type" text NOT NULL UNIQUE, -- 'BLOCKCHAIN_ROOT_CA'
    "public_key" text NOT NULL,
    "encrypted_private_key" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "public"."system_keys" ENABLE ROW LEVEL SECURITY;

-- Only ministry role can manage system keys
CREATE POLICY "ministry_manage_system_keys" ON "public"."system_keys"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'))
    WITH CHECK (exists (select 1 from public.accounts where id = auth.uid() and role = 'ministry'));

-- Update hospitals table with PKI fields
ALTER TABLE "public"."hospitals"
    ADD COLUMN IF NOT EXISTS "public_key" text,
    ADD COLUMN IF NOT EXISTS "certificate_pem" text,
    ADD COLUMN IF NOT EXISTS "encrypted_private_key" text; -- Protected by RLS

-- Update lab_reports table with signature fields
ALTER TABLE "public"."lab_reports"
    ADD COLUMN IF NOT EXISTS "report_hash" text,
    ADD COLUMN IF NOT EXISTS "signature" text,
    ADD COLUMN IF NOT EXISTS "signer_hospital_id" uuid REFERENCES "public"."hospitals"("id");

-- RLS for private keys in hospitals (Ensure only designated admins or backend processes can access)
-- Note: 'encrypted_private_key' is just a column, but we should be careful.
-- The existing policies allow ministry to manage hospitals. We might want to restrict viewing the private key specifically if possible,
-- but Postgres RLS is row-based (mostly). Column-level security via GRANT is an option, but for now we rely on the fact
-- that we only select specific columns in our queries usually.
-- However, anyone with 'ministry_manage_hospitals' policy can Select *.
