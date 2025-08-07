-- Check and create feedback table if it doesn't exist
-- Run this in your Supabase SQL editor

-- Check if feedback table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback'
    ) THEN
        -- Create feedback table
        CREATE TABLE feedback (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            feedback_token TEXT UNIQUE NOT NULL,
            is_submitted BOOLEAN DEFAULT false,
            submitted_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
        DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
        DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
        DROP POLICY IF EXISTS "Users can delete own feedback" ON feedback;
        DROP POLICY IF EXISTS "Public feedback access via tokens" ON feedback;
        DROP POLICY IF EXISTS "Public feedback submission" ON feedback;
        
        CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (
            EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
        );
        CREATE POLICY "Users can insert own feedback" ON feedback FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
        );
        CREATE POLICY "Users can update own feedback" ON feedback FOR UPDATE USING (
            EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
        );
        CREATE POLICY "Users can delete own feedback" ON feedback FOR DELETE USING (
            EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
        );
        
        -- Public feedback access via tokens (for submitting feedback)
        CREATE POLICY "Public feedback access via tokens" ON feedback FOR SELECT USING (true);
        CREATE POLICY "Public feedback submission" ON feedback FOR UPDATE USING (true);
        
        RAISE NOTICE 'Feedback table created successfully!';
    ELSE
        RAISE NOTICE 'Feedback table already exists!';
    END IF;
END $$;

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
AND table_schema = 'public'
ORDER BY ordinal_position; 