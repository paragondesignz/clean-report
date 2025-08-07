-- Add recurring_job_id to jobs table to link job instances to their recurring job
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS recurring_job_id UUID REFERENCES recurring_jobs(id) ON DELETE SET NULL;

-- Add end_time field to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS end_time TEXT;

-- Add index for better performance when querying job instances
CREATE INDEX IF NOT EXISTS idx_jobs_recurring_job_id ON jobs(recurring_job_id);

-- Update the RLS policy to allow users to see their recurring job instances
-- This should already be covered by existing RLS policies on jobs table

-- Add a column to track which specific occurrence this job represents
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS recurring_instance_date DATE;

-- Add a comment to explain the recurring job relationship
COMMENT ON COLUMN jobs.recurring_job_id IS 'Links this job to its parent recurring job pattern if it was generated from one';
COMMENT ON COLUMN jobs.recurring_instance_date IS 'The specific date this job instance represents in the recurring pattern';
COMMENT ON COLUMN jobs.end_time IS 'The scheduled end time for this job';