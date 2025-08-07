-- Check which tables exist and which are missing
-- Run this in your Supabase SQL editor to see what needs to be created

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = t.table_name) 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM (
  SELECT unnest(ARRAY[
    'user_profiles',
    'clients',
    'jobs',
    'tasks',
    'notes',
    'photos',
    'reports',
    'calendar_integrations',
    'service_types',
    'recurring_jobs',
    'supplies',
    'booking_requests',
    'feedback'
  ]) as table_name
) t
ORDER BY status DESC, table_name; 