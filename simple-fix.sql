-- Simple Database Fix Script
-- This script only adds user_id columns to existing tables
-- It's designed to be safe and not fail

-- First, let's see what tables exist
SELECT 'Current tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Add user_id column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to user_profiles';
    ELSE
        RAISE NOTICE 'user_id column already exists in user_profiles';
    END IF;
END $$;

-- Add user_id column to clients if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE clients ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to clients';
    ELSE
        RAISE NOTICE 'user_id column already exists in clients';
    END IF;
END $$;

-- Add user_id column to jobs if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to jobs';
    ELSE
        RAISE NOTICE 'user_id column already exists in jobs';
    END IF;
END $$;

-- Add user_id column to tasks if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to tasks';
    ELSE
        RAISE NOTICE 'user_id column already exists in tasks';
    END IF;
END $$;

-- Add user_id column to notes if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE notes ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to notes';
    ELSE
        RAISE NOTICE 'user_id column already exists in notes';
    END IF;
END $$;

-- Add user_id column to photos if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE photos ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to photos';
    ELSE
        RAISE NOTICE 'user_id column already exists in photos';
    END IF;
END $$;

-- Create service_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS service_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS recurring_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    scheduled_time TIME,
    is_active BOOLEAN DEFAULT true,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplies table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0,
    unit VARCHAR(50),
    low_stock_threshold INTEGER DEFAULT 5,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    custom_message TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ical_url TEXT NOT NULL,
    last_synced TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Simple fix completed successfully!' as status; 