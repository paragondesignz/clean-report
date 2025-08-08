-- Create task_suggestions table for AI-powered task recommendations
CREATE TABLE IF NOT EXISTS task_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    recurring_job_id UUID REFERENCES recurring_jobs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_task', 'frequency_adjustment', 'seasonal_task', 'maintenance_reminder')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_task JSONB NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    reasoning TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'implemented')),
    implemented_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_task_suggestions_user_id ON task_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_client_id ON task_suggestions(client_id);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_status ON task_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_created_at ON task_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_user_client ON task_suggestions(user_id, client_id);

-- Enable Row Level Security
ALTER TABLE task_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own task suggestions
CREATE POLICY "Users can view their own task suggestions" ON task_suggestions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own task suggestions
CREATE POLICY "Users can create their own task suggestions" ON task_suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own task suggestions
CREATE POLICY "Users can update their own task suggestions" ON task_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own task suggestions
CREATE POLICY "Users can delete their own task suggestions" ON task_suggestions
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_suggestions_updated_at
    BEFORE UPDATE ON task_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_task_suggestions_updated_at();

-- Add property_type column to clients table if it doesn't exist (for better AI suggestions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'property_type') THEN
        ALTER TABLE clients ADD COLUMN property_type TEXT DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'office', 'retail', 'restaurant', 'medical'));
    END IF;
END $$;