-- Enums and Types

-- User roles for the healthcare platform
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'provider', 'ministry', 'doctor');

-- Appointment status tracking
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'deleted');

-- Lab report types
CREATE TYPE "public"."lab_report_type" AS ENUM('blood_test', 'urine_test', 'xray', 'ct_scan', 'mri', 'ultrasound', 'other');
