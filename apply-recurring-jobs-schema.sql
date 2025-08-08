-- Apply the recurring jobs schema updates
-- Run this in your Supabase SQL editor

-- Add recurring_job_id to jobs table to link job instances to their recurring job
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'recurring_job_id') THEN
        ALTER TABLE jobs ADD COLUMN recurring_job_id UUID REFERENCES recurring_jobs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add end_time field to jobs table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'end_time') THEN
        ALTER TABLE jobs ADD COLUMN end_time TEXT;
    END IF;
END $$;

-- Add recurring_instance_date to track which specific occurrence this job represents
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'recurring_instance_date') THEN
        ALTER TABLE jobs ADD COLUMN recurring_instance_date DATE;
    END IF;
END $$;

-- Add index for better performance when querying job instances
CREATE INDEX IF NOT EXISTS idx_jobs_recurring_job_id ON jobs(recurring_job_id);

-- Ensure recurring_jobs table has proper structure
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'recurring_jobs' AND column_name = 'last_generated_date') THEN
        ALTER TABLE recurring_jobs ADD COLUMN last_generated_date TEXT;
    END IF;
END $$;