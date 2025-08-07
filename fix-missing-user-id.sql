-- Fix missing user_id columns in existing tables
-- Run this in your Supabase SQL editor if you get "column user_id does not exist" errors

-- Check which tables exist and add user_id columns if missing
DO $$
DECLARE
    table_name text;
    column_exists boolean;
BEGIN
    -- List of tables that should have user_id columns
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'user_profiles',
            'clients', 
            'jobs',
            'tasks',
            'notes',
            'photos',
            'reports',
            'calendar_integrations',
            'service_types',
            'recurring_jobs',
            'supplies',
            'booking_requests',
            'feedback'
        ])
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) THEN
            -- Check if user_id column exists
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = table_name AND column_name = 'user_id'
            ) INTO column_exists;
            
            -- Add user_id column if it doesn't exist
            IF NOT column_exists THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE', table_name);
                RAISE NOTICE 'Added user_id column to table: %', table_name;
            ELSE
                RAISE NOTICE 'user_id column already exists in table: %', table_name;
            END IF;
        ELSE
            RAISE NOTICE 'Table does not exist: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Update existing records to set user_id (this is a placeholder - you'll need to set appropriate user_id values)
-- For now, we'll set a default user_id for existing records
-- You should update these with actual user IDs from your auth.users table

-- Get the first user from auth.users (you may want to update this with a specific user_id)
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing records with the first user's ID
        -- Only update records that don't already have a user_id
        UPDATE user_profiles SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE clients SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE jobs SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE reports SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE calendar_integrations SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE service_types SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE recurring_jobs SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE supplies SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE booking_requests SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE feedback SET user_id = first_user_id WHERE user_id IS NULL;
        
        RAISE NOTICE 'Updated existing records with user_id: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- Make user_id columns NOT NULL after setting values
ALTER TABLE user_profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reports ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE calendar_integrations ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE service_types ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE recurring_jobs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE supplies ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE booking_requests ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE feedback ALTER COLUMN user_id SET NOT NULL;

-- Recreate RLS policies to ensure they work with user_id columns
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Jobs policies
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

CREATE POLICY "Users can view their own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar integrations policies
DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can insert their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON calendar_integrations;

CREATE POLICY "Users can view their own calendar integrations" ON calendar_integrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar integrations" ON calendar_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar integrations" ON calendar_integrations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar integrations" ON calendar_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Service types policies
DROP POLICY IF EXISTS "Users can view their own service types" ON service_types;
DROP POLICY IF EXISTS "Users can insert their own service types" ON service_types;
DROP POLICY IF EXISTS "Users can update their own service types" ON service_types;
DROP POLICY IF EXISTS "Users can delete their own service types" ON service_types;

CREATE POLICY "Users can view their own service types" ON service_types
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own service types" ON service_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own service types" ON service_types
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own service types" ON service_types
  FOR DELETE USING (auth.uid() = user_id);

-- Recurring jobs policies
DROP POLICY IF EXISTS "Users can view their own recurring jobs" ON recurring_jobs;
DROP POLICY IF EXISTS "Users can insert their own recurring jobs" ON recurring_jobs;
DROP POLICY IF EXISTS "Users can update their own recurring jobs" ON recurring_jobs;
DROP POLICY IF EXISTS "Users can delete their own recurring jobs" ON recurring_jobs;

CREATE POLICY "Users can view their own recurring jobs" ON recurring_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recurring jobs" ON recurring_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring jobs" ON recurring_jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring jobs" ON recurring_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Supplies policies
DROP POLICY IF EXISTS "Users can view their own supplies" ON supplies;
DROP POLICY IF EXISTS "Users can insert their own supplies" ON supplies;
DROP POLICY IF EXISTS "Users can update their own supplies" ON supplies;
DROP POLICY IF EXISTS "Users can delete their own supplies" ON supplies;

CREATE POLICY "Users can view their own supplies" ON supplies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own supplies" ON supplies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own supplies" ON supplies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supplies" ON supplies
  FOR DELETE USING (auth.uid() = user_id);

-- Booking requests policies
DROP POLICY IF EXISTS "Users can view their own booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Users can insert their own booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Users can update their own booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Users can delete their own booking requests" ON booking_requests;

CREATE POLICY "Users can view their own booking requests" ON booking_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own booking requests" ON booking_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own booking requests" ON booking_requests
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own booking requests" ON booking_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Feedback policies
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;

CREATE POLICY "Users can view their own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON feedback
  FOR DELETE USING (auth.uid() = user_id);

SELECT 'user_id columns fixed successfully!' as status; 