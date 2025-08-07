-- Fix Reports Table
-- This script will ensure the reports table has the correct structure

-- First, check if reports table exists
SELECT 'Checking reports table...' as status;

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    report_url TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reports ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to reports table';
    ELSE
        RAISE NOTICE 'user_id column already exists in reports table';
    END IF;
END $$;

-- Add RLS policies if they don't exist
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
    DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
    DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
    DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
    
    -- Create new policies
    CREATE POLICY "Users can view their own reports" ON reports
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own reports" ON reports
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own reports" ON reports
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own reports" ON reports
        FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies created for reports table';
END $$;

-- Success message
SELECT 'Reports table fixed successfully!' as status; 