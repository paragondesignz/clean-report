-- Simple Database Diagnostic
-- This will show results you can see in the SQL editor

-- 1. Show which tables exist
SELECT 'EXISTING TABLES' as category, table_name as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if key tables exist
SELECT 'KEY TABLES CHECK' as category,
       table_name,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
           THEN 'EXISTS' 
           ELSE 'MISSING' 
       END as status
FROM (VALUES 
    ('user_profiles'),
    ('clients'), 
    ('jobs'),
    ('tasks'),
    ('notes'),
    ('photos'),
    ('service_types'),
    ('recurring_jobs'),
    ('supplies'),
    ('reports'),
    ('calendar_integrations'),
    ('booking_requests'),
    ('feedback')
) AS t(table_name);

-- 3. Check which existing tables have user_id columns
SELECT 'USER_ID COLUMNS' as category,
       table_name,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = t.table_name 
               AND column_name = 'user_id' 
               AND table_schema = 'public'
           ) 
           THEN 'HAS user_id' 
           ELSE 'MISSING user_id' 
       END as status
FROM (VALUES 
    ('user_profiles'),
    ('clients'), 
    ('jobs'),
    ('tasks'),
    ('notes'),
    ('photos'),
    ('service_types'),
    ('recurring_jobs'),
    ('supplies'),
    ('reports'),
    ('calendar_integrations'),
    ('booking_requests'),
    ('feedback')
) AS t(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = t.table_name 
    AND table_schema = 'public'
);

-- 4. Count records in existing tables (only for tables that exist)
SELECT 'RECORD COUNTS' as category,
       table_name,
       record_count
FROM (
    SELECT 'user_profiles' as table_name, (SELECT COUNT(*) FROM user_profiles) as record_count
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
    UNION ALL
    SELECT 'clients', (SELECT COUNT(*) FROM clients)
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public')
    UNION ALL
    SELECT 'jobs', (SELECT COUNT(*) FROM jobs)
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public')
) as counts;

-- 5. Summary
SELECT 'SUMMARY' as category,
       'Run simple-fix.sql to add missing user_id columns and create missing tables' as recommendation; 