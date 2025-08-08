-- Customer Portal & Hours Allocation Complete Database Setup
-- Run this SQL file in your Supabase SQL Editor to ensure all tables and policies are set up correctly

-- Enable RLS on all tables
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_worker_assignments ENABLE ROW LEVEL SECURITY;

-- Create client_portal_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_portal_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_worker_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_worker_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id TEXT NOT NULL, -- 'owner' for account holder, or sub_contractor UUID
    worker_type TEXT NOT NULL CHECK (worker_type IN ('owner', 'sub_contractor')),
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    assigned_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2) DEFAULT 0,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    is_clocked_in BOOLEAN DEFAULT false,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure jobs table has agreed_hours column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS agreed_hours DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);

-- Ensure recurring_jobs table has agreed_hours column  
ALTER TABLE recurring_jobs ADD COLUMN IF NOT EXISTS agreed_hours DECIMAL(10,2);
ALTER TABLE recurring_jobs ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_portal_users_client_id ON client_portal_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_email ON client_portal_users(email);
CREATE INDEX IF NOT EXISTS idx_job_worker_assignments_job_id ON job_worker_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_worker_assignments_worker_id ON job_worker_assignments(worker_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_client_portal_users_updated_at ON client_portal_users;
CREATE TRIGGER update_client_portal_users_updated_at
    BEFORE UPDATE ON client_portal_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_worker_assignments_updated_at ON job_worker_assignments;
CREATE TRIGGER update_job_worker_assignments_updated_at
    BEFORE UPDATE ON job_worker_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for client_portal_users
DROP POLICY IF EXISTS "client_portal_users_select_policy" ON client_portal_users;
CREATE POLICY "client_portal_users_select_policy" ON client_portal_users
    FOR SELECT USING (
        -- Allow access if the client belongs to the authenticated user
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "client_portal_users_insert_policy" ON client_portal_users;
CREATE POLICY "client_portal_users_insert_policy" ON client_portal_users
    FOR INSERT WITH CHECK (
        -- Allow insert if the client belongs to the authenticated user
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "client_portal_users_update_policy" ON client_portal_users;
CREATE POLICY "client_portal_users_update_policy" ON client_portal_users
    FOR UPDATE USING (
        -- Allow update if the client belongs to the authenticated user
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "client_portal_users_delete_policy" ON client_portal_users;
CREATE POLICY "client_portal_users_delete_policy" ON client_portal_users
    FOR DELETE USING (
        -- Allow delete if the client belongs to the authenticated user
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for job_worker_assignments
DROP POLICY IF EXISTS "job_worker_assignments_select_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_select_policy" ON job_worker_assignments
    FOR SELECT USING (
        -- Allow access if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "job_worker_assignments_insert_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_insert_policy" ON job_worker_assignments
    FOR INSERT WITH CHECK (
        -- Allow insert if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "job_worker_assignments_update_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_update_policy" ON job_worker_assignments
    FOR UPDATE USING (
        -- Allow update if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "job_worker_assignments_delete_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_delete_policy" ON job_worker_assignments
    FOR DELETE USING (
        -- Allow delete if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        )
    );

-- Function to calculate actual hours from clock times
CREATE OR REPLACE FUNCTION calculate_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- If clocking out, calculate actual hours and total cost
    IF OLD.is_clocked_in = true AND NEW.is_clocked_in = false AND NEW.clock_out_time IS NOT NULL THEN
        -- Calculate hours worked
        NEW.actual_hours = COALESCE(OLD.actual_hours, 0) + 
            EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0;
        
        -- Calculate total cost
        NEW.total_cost = NEW.actual_hours * NEW.hourly_rate;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for automatic calculation
DROP TRIGGER IF EXISTS calculate_hours_trigger ON job_worker_assignments;
CREATE TRIGGER calculate_hours_trigger
    BEFORE UPDATE ON job_worker_assignments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_actual_hours();

-- Function to update job costs when worker assignments change
CREATE OR REPLACE FUNCTION update_job_costs()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the job's actual cost based on all worker assignments
    UPDATE jobs 
    SET actual_cost = (
        SELECT COALESCE(SUM(total_cost), 0) 
        FROM job_worker_assignments 
        WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
    )
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add trigger to update job costs
DROP TRIGGER IF EXISTS update_job_costs_trigger ON job_worker_assignments;
CREATE TRIGGER update_job_costs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON job_worker_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_job_costs();

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON client_portal_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_worker_assignments TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create a function for customer portal authentication (for API use)
CREATE OR REPLACE FUNCTION authenticate_customer_portal(
    email_input TEXT,
    password_input TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    client_id UUID,
    client_data JSONB,
    error_message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    portal_user RECORD;
    client_record RECORD;
BEGIN
    -- Find the portal user
    SELECT * INTO portal_user
    FROM client_portal_users cpu
    WHERE cpu.email = email_input AND cpu.is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB, 'Account not found or inactive'::TEXT;
        RETURN;
    END IF;
    
    -- Note: Password verification should be done in the application layer
    -- This function is for structure only
    
    -- Get client data
    SELECT * INTO client_record
    FROM clients c
    WHERE c.id = portal_user.client_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB, 'Client record not found'::TEXT;
        RETURN;
    END IF;
    
    -- Update last login
    UPDATE client_portal_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE id = portal_user.id;
    
    -- Return success with client data
    RETURN QUERY SELECT 
        true,
        client_record.id,
        row_to_json(client_record)::JSONB,
        NULL::TEXT;
END;
$$;

-- Create function to get customer job statistics
CREATE OR REPLACE FUNCTION get_customer_job_stats(customer_client_id UUID)
RETURNS TABLE(
    total_jobs INTEGER,
    completed_jobs INTEGER,
    scheduled_jobs INTEGER,
    in_progress_jobs INTEGER,
    total_hours DECIMAL,
    agreed_hours DECIMAL,
    total_cost DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as completed_jobs,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END)::INTEGER as scheduled_jobs,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::INTEGER as in_progress_jobs,
        COALESCE(SUM(total_time_seconds), 0)::DECIMAL / 3600.0 as total_hours,
        COALESCE(SUM(j.agreed_hours), 0)::DECIMAL as agreed_hours,
        COALESCE(SUM(COALESCE(actual_cost, estimated_cost)), 0)::DECIMAL as total_cost
    FROM jobs j
    WHERE j.client_id = customer_client_id;
END;
$$;

-- Ensure all tables have proper RLS enabled and policies are active
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE recurring_jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users FORCE ROW LEVEL SECURITY;
ALTER TABLE job_worker_assignments FORCE ROW LEVEL SECURITY;

-- Sample data for testing (optional - remove in production)
-- Note: This assumes you have at least one user and client in your system

-- Insert a test portal user (uncomment if needed for testing)
-- INSERT INTO client_portal_users (client_id, email, password_hash, is_active)
-- SELECT 
--     c.id,
--     'test@example.com',
--     '$2a$12$example_password_hash', -- Replace with actual bcrypt hash
--     true
-- FROM clients c 
-- WHERE c.user_id = (SELECT auth.uid())
-- LIMIT 1
-- ON CONFLICT (email) DO NOTHING;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Customer Portal & Hours Allocation database setup completed successfully!';
    RAISE NOTICE 'Tables created/verified: client_portal_users, job_worker_assignments';
    RAISE NOTICE 'Columns added: agreed_hours, actual_cost, estimated_cost';
    RAISE NOTICE 'RLS policies: All security policies are active';
    RAISE NOTICE 'Triggers: Auto-calculation and cost update triggers enabled';
    RAISE NOTICE 'Functions: Customer authentication and statistics functions created';
END $$;