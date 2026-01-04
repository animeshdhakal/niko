
-- Rename emergency_access_grants to generic access_grants
ALTER TABLE emergency_access_grants RENAME TO access_grants;

-- Add grant_type to distinguish between EMERGENCY and CONSENT
ALTER TABLE access_grants
ADD COLUMN grant_type TEXT CHECK (grant_type IN ('EMERGENCY', 'CONSENT')) NOT NULL DEFAULT 'EMERGENCY';

-- Update RLS policies for access_grants to be generic
DROP POLICY "Doctors can view their active grants" ON access_grants;
CREATE POLICY "Doctors can view their grants" ON access_grants
    FOR SELECT
    USING (auth.uid() = doctor_id);

-- Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES accounts(id) NOT NULL,
    patient_id UUID REFERENCES accounts(id) NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS for access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Doctors can view requests they made
CREATE POLICY "Doctors can view their requests" ON access_requests
    FOR SELECT
    USING (auth.uid() = doctor_id);

-- Doctors can insert requests
CREATE POLICY "Doctors can create requests" ON access_requests
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

-- Patients can view requests sent to them
CREATE POLICY "Patients can view their requests" ON access_requests
    FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can update requests sent to them (to Approve/Reject)
CREATE POLICY "Patients can update their requests" ON access_requests
    FOR UPDATE
    USING (auth.uid() = patient_id);
