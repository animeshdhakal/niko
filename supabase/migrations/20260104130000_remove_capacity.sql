
-- Migration: Remove daily_capacity from accounts table
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "daily_capacity";
