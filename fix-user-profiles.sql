-- Fix user_profiles table - Add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Test insert to verify the table works
-- (This will be rolled back, just for testing)
BEGIN;
  INSERT INTO user_profiles (user_id, company_name, contact_email, contact_phone, website_url)
  VALUES ('00000000-0000-0000-0000-000000000000', 'Test Company', 'test@example.com', '123-456-7890', 'https://example.com');
ROLLBACK;

SELECT 'user_profiles table fixed successfully!' as status; 