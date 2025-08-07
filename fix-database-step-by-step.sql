-- Step-by-step database fix script
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create missing tables with proper user_id columns
-- 1. Service Types Table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recurring Jobs Table
CREATE TABLE IF NOT EXISTS recurring_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  scheduled_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Supplies Table
CREATE TABLE IF NOT EXISTS supplies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reports Table (recreate with proper user_id)
DROP TABLE IF EXISTS reports CASCADE;
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  report_url TEXT NOT NULL,
  custom_message TEXT,
  email_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Calendar Integrations Table
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_url TEXT NOT NULL,
  calendar_type VARCHAR(20) DEFAULT 'google' CHECK (calendar_type IN ('google', 'outlook', 'ical')),
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Booking Requests Table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  booking_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  feedback_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add user_id columns to existing tables (only if they don't exist)
-- Check and add user_id to user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
        ALTER TABLE user_profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add user_id to clients
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'user_id') THEN
        ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add user_id to jobs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'user_id') THEN
        ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add user_id to tasks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'user_id') THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add user_id to notes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'user_id') THEN
        ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add user_id to photos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'user_id') THEN
        ALTER TABLE photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Set user_id for existing records (only for tables that have the column)
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Only update tables that have the user_id column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
            UPDATE user_profiles SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'user_id') THEN
            UPDATE clients SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'user_id') THEN
            UPDATE jobs SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_integrations' AND column_name = 'user_id') THEN
            UPDATE calendar_integrations SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_types' AND column_name = 'user_id') THEN
            UPDATE service_types SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_jobs' AND column_name = 'user_id') THEN
            UPDATE recurring_jobs SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplies' AND column_name = 'user_id') THEN
            UPDATE supplies SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'user_id') THEN
            UPDATE booking_requests SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'user_id') THEN
            UPDATE feedback SET user_id = first_user_id WHERE user_id IS NULL;
        END IF;
        
        RAISE NOTICE 'Updated existing records with user_id: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- Step 4: Make user_id columns NOT NULL (only for tables that have the column)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
        ALTER TABLE user_profiles ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'user_id') THEN
        ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'user_id') THEN
        ALTER TABLE jobs ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_integrations' AND column_name = 'user_id') THEN
        ALTER TABLE calendar_integrations ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_types' AND column_name = 'user_id') THEN
        ALTER TABLE service_types ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_jobs' AND column_name = 'user_id') THEN
        ALTER TABLE recurring_jobs ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplies' AND column_name = 'user_id') THEN
        ALTER TABLE supplies ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'user_id') THEN
        ALTER TABLE booking_requests ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'user_id') THEN
        ALTER TABLE feedback ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_types_user_id ON service_types(user_id);
CREATE INDEX IF NOT EXISTS idx_service_types_is_active ON service_types(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_user_id ON recurring_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_client_id ON recurring_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON supplies(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_job_id ON reports(job_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_job_id ON feedback(job_id);

-- Step 6: Enable Row Level Security on all tables
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for service_types
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

-- Step 8: Create RLS policies for recurring_jobs
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

-- Step 9: Create RLS policies for supplies
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

-- Step 10: Create RLS policies for reports
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

-- Step 11: Create RLS policies for calendar_integrations
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

-- Step 12: Create RLS policies for booking_requests
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

-- Step 13: Create RLS policies for feedback
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

-- Step 14: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 15: Create triggers for updated_at columns
CREATE TRIGGER update_service_types_updated_at 
  BEFORE UPDATE ON service_types 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_jobs_updated_at 
  BEFORE UPDATE ON recurring_jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplies_updated_at 
  BEFORE UPDATE ON supplies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON reports 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at 
  BEFORE UPDATE ON calendar_integrations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_requests_updated_at 
  BEFORE UPDATE ON booking_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at 
  BEFORE UPDATE ON feedback 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

SELECT 'Database setup completed successfully!' as status; 