-- Accounts Schema
-- User profiles linked to auth.users

CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" uuid PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "national_id_no" text UNIQUE,
    "role" user_role NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON "public"."accounts"
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);
