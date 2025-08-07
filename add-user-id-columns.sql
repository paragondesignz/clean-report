-- Add user_id columns to tables that are missing them
-- Run this in your Supabase SQL editor

-- Add user_id column to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to clients if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to jobs if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to tasks if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to notes if it doesn't exist
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to photos if it doesn't exist
ALTER TABLE photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to reports if it doesn't exist
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to calendar_integrations if it doesn't exist
ALTER TABLE calendar_integrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to service_types if it doesn't exist
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to recurring_jobs if it doesn't exist
ALTER TABLE recurring_jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to supplies if it doesn't exist
ALTER TABLE supplies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to booking_requests if it doesn't exist
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to feedback if it doesn't exist
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set user_id for existing records (using the first user in auth.users)
UPDATE user_profiles SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE clients SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE jobs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE reports SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE calendar_integrations SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE service_types SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE recurring_jobs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE supplies SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE booking_requests SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE feedback SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id columns NOT NULL
ALTER TABLE user_profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reports ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE calendar_integrations ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE service_types ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE recurring_jobs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE supplies ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE booking_requests ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE feedback ALTER COLUMN user_id SET NOT NULL;

SELECT 'user_id columns added successfully!' as status; 