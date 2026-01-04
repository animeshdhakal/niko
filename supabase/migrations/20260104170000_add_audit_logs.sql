
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Nullable for system actions or unauthed
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    severity TEXT CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'ALERT')) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins (Ministry) can read audit logs.
-- System/Server functions can Insert.
CREATE POLICY "Ministry can view audit logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM accounts
            WHERE accounts.id = auth.uid() AND accounts.role = 'ministry'
        )
    );

-- Anyone authenticated can insert logs (e.g. via server actions mostly, but strictly we might want to limit this to service role if possible,
-- but for "Break Glass" triggered by a doctor, they effectively insert a log.
-- To be safe, let's allow insert for authenticated users, but they can't delete/update.)
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');


-- Create emergency_access_grants table
CREATE TABLE IF NOT EXISTS emergency_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES accounts(id) NOT NULL,
    patient_id UUID REFERENCES accounts(id) NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS for emergency_access_grants
ALTER TABLE emergency_access_grants ENABLE ROW LEVEL SECURITY;

-- Doctors can see their own grants
CREATE POLICY "Doctors can view their active grants" ON emergency_access_grants
    FOR SELECT
    USING (auth.uid() = doctor_id);

-- Ministry can view all
CREATE POLICY "Ministry can view all grants" ON emergency_access_grants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM accounts
            WHERE accounts.id = auth.uid() AND accounts.role = 'ministry'
        )
    );
