# Timer Setup Instructions

The timer functionality requires additional database columns to be added to the `jobs` table. Follow these steps to set up the timer feature:

## 1. Run Database Migration

Copy and paste the following SQL into your Supabase SQL Editor:

```sql
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
```

## 2. Verify Installation

After running the migration, you can verify the columns were added by running:

```sql
-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public' 
AND column_name IN ('timer_started_at', 'timer_ended_at', 'total_time_seconds')
ORDER BY ordinal_position;
```

## 3. Test the Timer

Once the migration is complete:

1. Go to any job detail page
2. Look for the "Job Timer" card in the sidebar
3. Click "Start Job" to begin the timer
4. The timer should now work without errors

## Timer Features

- **Start Timer**: Begins tracking time and sets job status to "In Progress"
- **Pause Timer**: Pauses the timer without completing the job
- **Resume Timer**: Continues a paused timer
- **Complete Job**: Stops the timer and marks the job as completed
- **Persistent**: Timer continues running even if you navigate away from the page
- **Time Display**: Shows total time and current session time in HH:MM:SS format

## Troubleshooting

If you still see errors after running the migration:

1. Check the browser console for detailed error messages
2. Verify the columns exist in your Supabase database
3. Make sure your Supabase connection is working properly
4. Try refreshing the page after the migration

The timer system will automatically detect if the required columns exist and provide helpful error messages if they're missing. 