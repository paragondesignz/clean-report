-- Create recurring_job_notes table for centralized note management
CREATE TABLE IF NOT EXISTS recurring_job_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recurring_job_id UUID NOT NULL REFERENCES recurring_jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'client_preference', 'access_instructions', 'special_requirements')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recurring_job_notes_user_id ON recurring_job_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_job_notes_recurring_job_id ON recurring_job_notes(recurring_job_id);
CREATE INDEX IF NOT EXISTS idx_recurring_job_notes_category ON recurring_job_notes(category);
CREATE INDEX IF NOT EXISTS idx_recurring_job_notes_created_at ON recurring_job_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recurring_job_notes_user_job ON recurring_job_notes(user_id, recurring_job_id);

-- Enable Row Level Security
ALTER TABLE recurring_job_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own recurring job notes
CREATE POLICY "Users can view their own recurring job notes" ON recurring_job_notes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own recurring job notes
CREATE POLICY "Users can create their own recurring job notes" ON recurring_job_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own recurring job notes
CREATE POLICY "Users can update their own recurring job notes" ON recurring_job_notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own recurring job notes
CREATE POLICY "Users can delete their own recurring job notes" ON recurring_job_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recurring_job_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_job_notes_updated_at
    BEFORE UPDATE ON recurring_job_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_recurring_job_notes_updated_at();

-- Add columns to tasks table to track recurring patterns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_from_recurring_pattern') THEN
        ALTER TABLE tasks ADD COLUMN created_from_recurring_pattern BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurring_frequency') THEN
        ALTER TABLE tasks ADD COLUMN recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly', 'bi_annual', 'annual', 'custom'));
    END IF;
END $$;