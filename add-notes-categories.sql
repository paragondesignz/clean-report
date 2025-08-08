-- Add category column to notes table for enhanced job notes system
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'category') THEN
        ALTER TABLE notes ADD COLUMN category TEXT DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'client_preference', 'access_instructions', 'special_requirements'));
    END IF;
END $$;

-- Create index for better query performance on category
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- Update any existing notes to have the general category
UPDATE notes SET category = 'general' WHERE category IS NULL;