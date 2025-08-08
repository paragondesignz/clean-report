-- Fix Database Schema Issues
-- This SQL script fixes the database relationship problems and validation errors

-- First, ensure sub_contractors table exists with correct schema
CREATE TABLE IF NOT EXISTS sub_contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sub_contractors table
ALTER TABLE sub_contractors ENABLE ROW LEVEL SECURITY;

-- Drop existing job_worker_assignments table if it has schema issues
DROP TABLE IF EXISTS job_worker_assignments CASCADE;

-- Recreate job_worker_assignments table with correct foreign key relationships
CREATE TABLE job_worker_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID, -- Now a UUID instead of TEXT, can be NULL for 'owner' type
    worker_type TEXT NOT NULL CHECK (worker_type IN ('owner', 'sub_contractor')),
    sub_contractor_id UUID REFERENCES sub_contractors(id) ON DELETE CASCADE, -- Proper foreign key
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    assigned_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2) DEFAULT 0,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    is_clocked_in BOOLEAN DEFAULT false,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Add constraint to ensure proper worker assignment
    CONSTRAINT valid_worker_assignment CHECK (
        (worker_type = 'owner' AND worker_id IS NULL AND sub_contractor_id IS NULL) OR
        (worker_type = 'sub_contractor' AND sub_contractor_id IS NOT NULL)
    )
);

-- Enable RLS on job_worker_assignments table
ALTER TABLE job_worker_assignments ENABLE ROW LEVEL SECURITY;

-- Fix user_profiles table timestamp issues
-- Ensure all timestamp columns allow NULL and have proper defaults
ALTER TABLE user_profiles 
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure all timestamp fields in other tables are properly set
ALTER TABLE client_portal_users 
    ALTER COLUMN last_login DROP NOT NULL,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_worker_assignments_job_id ON job_worker_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_worker_assignments_sub_contractor_id ON job_worker_assignments(sub_contractor_id);
CREATE INDEX IF NOT EXISTS idx_job_worker_assignments_worker_type ON job_worker_assignments(worker_type);

CREATE INDEX IF NOT EXISTS idx_sub_contractors_user_id ON sub_contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_contractors_admin_id ON sub_contractors(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_client_id ON client_portal_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_email ON client_portal_users(email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_job_worker_assignments_updated_at ON job_worker_assignments;
CREATE TRIGGER update_job_worker_assignments_updated_at
    BEFORE UPDATE ON job_worker_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sub_contractors_updated_at ON sub_contractors;
CREATE TRIGGER update_sub_contractors_updated_at
    BEFORE UPDATE ON sub_contractors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_portal_users_updated_at ON client_portal_users;
CREATE TRIGGER update_client_portal_users_updated_at
    BEFORE UPDATE ON client_portal_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for job_worker_assignments
DROP POLICY IF EXISTS "job_worker_assignments_select_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_select_policy" ON job_worker_assignments
    FOR SELECT USING (
        -- Allow access if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        ) OR
        -- Allow sub-contractors to view their own assignments
        (worker_type = 'sub_contractor' AND sub_contractor_id IN (
            SELECT id FROM sub_contractors WHERE user_id = auth.uid()
        ))
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
        ) OR
        -- Allow sub-contractors to update their own assignments (clock in/out)
        (worker_type = 'sub_contractor' AND sub_contractor_id IN (
            SELECT id FROM sub_contractors WHERE user_id = auth.uid()
        ))
    );

DROP POLICY IF EXISTS "job_worker_assignments_delete_policy" ON job_worker_assignments;
CREATE POLICY "job_worker_assignments_delete_policy" ON job_worker_assignments
    FOR DELETE USING (
        -- Allow delete if the job belongs to the authenticated user
        job_id IN (
            SELECT id FROM jobs WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for sub_contractors
DROP POLICY IF EXISTS "sub_contractors_select_policy" ON sub_contractors;
CREATE POLICY "sub_contractors_select_policy" ON sub_contractors
    FOR SELECT USING (
        -- Admins can view their sub contractors
        admin_id = auth.uid() OR
        -- Sub contractors can view their own profile
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "sub_contractors_insert_policy" ON sub_contractors;
CREATE POLICY "sub_contractors_insert_policy" ON sub_contractors
    FOR INSERT WITH CHECK (
        -- Only admins can create sub contractor records
        admin_id = auth.uid()
    );

DROP POLICY IF EXISTS "sub_contractors_update_policy" ON sub_contractors;
CREATE POLICY "sub_contractors_update_policy" ON sub_contractors
    FOR UPDATE USING (
        -- Admins can update their sub contractors
        admin_id = auth.uid() OR
        -- Sub contractors can update their own profile
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "sub_contractors_delete_policy" ON sub_contractors;
CREATE POLICY "sub_contractors_delete_policy" ON sub_contractors
    FOR DELETE USING (
        -- Only admins can delete sub contractor records
        admin_id = auth.uid()
    );

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

-- Function to calculate actual hours from clock times (updated for new schema)
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON client_portal_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_worker_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sub_contractors TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure jobs table has required columns for hours allocation
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS agreed_hours DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS end_time TIME;

-- Ensure recurring_jobs table has required columns
ALTER TABLE recurring_jobs ADD COLUMN IF NOT EXISTS agreed_hours DECIMAL(10,2);
ALTER TABLE recurring_jobs ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);

-- Ensure feedback table has additional columns for enhanced feedback system
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS feedback_type TEXT DEFAULT 'job_specific' CHECK (feedback_type IN ('job_specific', 'general', 'suggestion', 'complaint'));
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'feedback_form' CHECK (source IN ('feedback_form', 'customer_portal', 'email', 'admin'));

-- Ensure user_profiles table has hourly_rate column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;

-- Ensure calendar_integrations table exists (create if missing)
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_url TEXT NOT NULL,
  calendar_type TEXT DEFAULT 'google' CHECK (calendar_type IN ('google', 'outlook', 'ical')),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on calendar_integrations
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_integrations
DROP POLICY IF EXISTS "calendar_integrations_select_policy" ON calendar_integrations;
CREATE POLICY "calendar_integrations_select_policy" ON calendar_integrations
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "calendar_integrations_insert_policy" ON calendar_integrations;
CREATE POLICY "calendar_integrations_insert_policy" ON calendar_integrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "calendar_integrations_update_policy" ON calendar_integrations;
CREATE POLICY "calendar_integrations_update_policy" ON calendar_integrations
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "calendar_integrations_delete_policy" ON calendar_integrations;
CREATE POLICY "calendar_integrations_delete_policy" ON calendar_integrations
    FOR DELETE USING (user_id = auth.uid());

-- Create index for calendar_integrations
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);

-- Create indexes for enhanced feedback system
CREATE INDEX IF NOT EXISTS idx_feedback_client_id ON feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source);

-- Create trigger for calendar_integrations updated_at
DROP TRIGGER IF EXISTS update_calendar_integrations_updated_at ON calendar_integrations;
CREATE TRIGGER update_calendar_integrations_updated_at
    BEFORE UPDATE ON calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refresh schema cache to ensure PostgREST recognizes all relationships
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Database schema fixes applied successfully!';
    RAISE NOTICE 'Fixed: job_worker_assignments <-> sub_contractors relationship';
    RAISE NOTICE 'Fixed: user_profiles timestamp validation errors'; 
    RAISE NOTICE 'Fixed: RLS policies and permissions';
    RAISE NOTICE 'Added: hourly_rate column to user_profiles table';
    RAISE NOTICE 'Added: calendar_integrations table with RLS policies';
    RAISE NOTICE 'Added: Proper foreign key constraints and indexes';
    RAISE NOTICE 'Schema cache refreshed for PostgREST';
END $$;