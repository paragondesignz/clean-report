-- Test Reports Table
-- This script will check if the reports table exists and has the correct structure

-- Check if reports table exists
SELECT 'Table exists check' as test, 
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'reports' 
         AND table_schema = 'public'
       ) as table_exists;

-- Check reports table structure
SELECT 'Reports table structure' as test,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_id column exists
SELECT 'User ID column check' as test,
       EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'reports' 
         AND column_name = 'user_id' 
         AND table_schema = 'public'
       ) as has_user_id;

-- Count reports
SELECT 'Reports count' as test,
       COUNT(*) as total_reports
FROM reports
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'reports' 
  AND table_schema = 'public'
);

-- Test a simple query
SELECT 'Test query' as test,
       id,
       job_id,
       report_url,
       email_sent,
       created_at
FROM reports
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'reports' 
  AND table_schema = 'public'
)
LIMIT 5; 