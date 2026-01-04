-- Migration: Add reason field to appointments
-- Created: 2026-01-04 15:15:00

ALTER TABLE "public"."appointments"
    ADD COLUMN IF NOT EXISTS "reason" text;
