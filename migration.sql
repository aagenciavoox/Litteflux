-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create System Notes Table
CREATE TABLE IF NOT EXISTS system_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    color TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE
);

-- 3. Add Soft Delete Columns
-- We use DO blocks to avoid errors if columns already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'deleted_at') THEN
        ALTER TABLE campaigns ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'deleted_at') THEN
        ALTER TABLE leads ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'influencers' AND column_name = 'deleted_at') THEN
        ALTER TABLE influencers ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- 4. Enable RLS (Optional but recommended)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notes ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Simple implementation for now)
-- Audit Logs: Insert by any auth user, View by Admin only
CREATE POLICY "Enable insert for authenticated users" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable view for admins" ON audit_logs FOR SELECT TO authenticated USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- System Notes: Full access for Admins only
CREATE POLICY "Admins full access to notes" ON system_notes FOR ALL TO authenticated USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);
