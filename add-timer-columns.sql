-- Add timer columns to jobs table
DO $$
BEGIN
    -- Add timer_started_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'timer_started_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN timer_started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add timer_ended_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'timer_ended_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN timer_ended_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add total_time_seconds column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'total_time_seconds' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN total_time_seconds INTEGER DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'Timer columns added successfully!';
END $$;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public' 
AND column_name IN ('timer_started_at', 'timer_ended_at', 'total_time_seconds')
ORDER BY ordinal_position; 