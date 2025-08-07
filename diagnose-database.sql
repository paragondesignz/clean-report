-- Database Diagnostic Script
-- This script will check the current state of your database and report what needs to be fixed

-- Check if we can connect and get current user
SELECT 'Connection test' as test, current_user as current_user, current_database() as database_name;

-- Check which tables exist
SELECT 'Existing tables' as test, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check the structure of each table that should exist
DO $$
DECLARE
    tbl_name text;
    column_info record;
BEGIN
    RAISE NOTICE '=== TABLE STRUCTURE DIAGNOSIS ===';
    
    -- Check each table that should exist
    FOR tbl_name IN 
        SELECT unnest(ARRAY[
            'user_profiles', 'clients', 'jobs', 'tasks', 'notes', 'photos',
            'service_types', 'recurring_jobs', 'supplies', 'reports',
            'calendar_integrations', 'booking_requests', 'feedback'
        ])
    LOOP
        RAISE NOTICE '--- Checking table: % ---', tbl_name;
        
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            RAISE NOTICE 'Table % exists', tbl_name;
            
            -- Check columns
            FOR column_info IN 
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = tbl_name AND table_schema = 'public'
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE 'Column: % (type: %, nullable: %, default: %)', 
                    column_info.column_name, 
                    column_info.data_type, 
                    column_info.is_nullable, 
                    COALESCE(column_info.column_default, 'NULL');
            END LOOP;
            
            -- Check if user_id column exists
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = tbl_name 
                AND column_name = 'user_id' 
                AND table_schema = 'public'
            ) THEN
                RAISE NOTICE '✓ user_id column exists in %', tbl_name;
            ELSE
                RAISE NOTICE '✗ user_id column MISSING in %', tbl_name;
            END IF;
            
            -- Check RLS policies
            IF EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = tbl_name 
                AND schemaname = 'public'
            ) THEN
                RAISE NOTICE '✓ RLS policies exist for %', tbl_name;
            ELSE
                RAISE NOTICE '✗ RLS policies MISSING for %', tbl_name;
            END IF;
            
        ELSE
            RAISE NOTICE '✗ Table % does NOT exist', tbl_name;
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Check for any existing data that might conflict
DO $$
DECLARE
    tbl_name text;
    record_count integer;
BEGIN
    RAISE NOTICE '=== DATA CHECK ===';
    
    FOR tbl_name IN 
        SELECT unnest(ARRAY['user_profiles', 'clients', 'jobs', 'service_types'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO record_count;
            RAISE NOTICE 'Table %: % records', tbl_name, record_count;
        ELSE
            RAISE NOTICE 'Table %: does not exist', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Check for any triggers
SELECT 'Triggers' as test, 
       trigger_name, 
       event_manipulation, 
       action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY trigger_name;

-- Check for any constraints that might prevent operations
SELECT 'Constraints' as test, 
       constraint_name, 
       constraint_type, 
       table_name 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
ORDER BY table_name, constraint_name;

-- Final summary
SELECT '=== DIAGNOSIS COMPLETE ===' as summary; 