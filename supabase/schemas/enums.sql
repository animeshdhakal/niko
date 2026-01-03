-- Enums and Types

-- User roles for the healthcare platform
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'provider', 'ministry');

-- Appointment status tracking
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'deleted');
