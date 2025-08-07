-- Comprehensive Database Fix Script
-- This script will ensure all tables exist with the correct structure

-- 1. Create all required tables with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    email_template TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    status TEXT DEFAULT 'scheduled',
    timer_started_at TIMESTAMP WITH TIME ZONE,
    timer_ended_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    report_url TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    scheduled_time TIME,
    is_active BOOLEAN DEFAULT true,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0,
    unit TEXT,
    low_stock_threshold INTEGER DEFAULT 5,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ical_url TEXT NOT NULL,
    last_synced TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    message TEXT,
    status TEXT DEFAULT 'pending',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_token TEXT UNIQUE NOT NULL,
    is_submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add user_id columns to existing tables if they don't exist
DO $$
BEGIN
    -- Add user_id to user_profiles if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to clients if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE clients ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to jobs if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN user_id UUID;
    END IF;
    
    -- Add timer columns to jobs if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'timer_started_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN timer_started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'timer_ended_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN timer_ended_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'total_time_seconds' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN total_time_seconds INTEGER DEFAULT 0;
    END IF;
    
    -- Add user_id to reports if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reports ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to service_types if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_types' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE service_types ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to recurring_jobs if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recurring_jobs' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE recurring_jobs ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to supplies if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'supplies' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE supplies ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to calendar_integrations if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_integrations' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE calendar_integrations ADD COLUMN user_id UUID;
    END IF;
    
    -- Add user_id to booking_requests if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_requests' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE booking_requests ADD COLUMN user_id UUID;
    END IF;
    
    -- Add feedback_token to feedback if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'feedback_token' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE feedback ADD COLUMN feedback_token TEXT;
    END IF;
    
    -- Add is_submitted to feedback if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'is_submitted' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE feedback ADD COLUMN is_submitted BOOLEAN DEFAULT false;
    END IF;
    
    -- Add submitted_at to feedback if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'submitted_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE feedback ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for all tables
DO $$
BEGIN
    -- User profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    
    CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
    
    -- Clients policies
    DROP POLICY IF EXISTS "Users can view own clients" ON clients;
    DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
    DROP POLICY IF EXISTS "Users can update own clients" ON clients;
    DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
    
    CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);
    
    -- Jobs policies
    DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
    
    CREATE POLICY "Users can view own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);
    
    -- Reports policies
    DROP POLICY IF EXISTS "Users can view own reports" ON reports;
    DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
    DROP POLICY IF EXISTS "Users can update own reports" ON reports;
    DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
    
    CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = user_id);
    
    -- Service types policies
    DROP POLICY IF EXISTS "Users can view own service types" ON service_types;
    DROP POLICY IF EXISTS "Users can insert own service types" ON service_types;
    DROP POLICY IF EXISTS "Users can update own service types" ON service_types;
    DROP POLICY IF EXISTS "Users can delete own service types" ON service_types;
    
    CREATE POLICY "Users can view own service types" ON service_types FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own service types" ON service_types FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own service types" ON service_types FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own service types" ON service_types FOR DELETE USING (auth.uid() = user_id);
    
    -- Recurring jobs policies
    DROP POLICY IF EXISTS "Users can view own recurring jobs" ON recurring_jobs;
    DROP POLICY IF EXISTS "Users can insert own recurring jobs" ON recurring_jobs;
    DROP POLICY IF EXISTS "Users can update own recurring jobs" ON recurring_jobs;
    DROP POLICY IF EXISTS "Users can delete own recurring jobs" ON recurring_jobs;
    
    CREATE POLICY "Users can view own recurring jobs" ON recurring_jobs FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own recurring jobs" ON recurring_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own recurring jobs" ON recurring_jobs FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own recurring jobs" ON recurring_jobs FOR DELETE USING (auth.uid() = user_id);
    
    -- Supplies policies
    DROP POLICY IF EXISTS "Users can view own supplies" ON supplies;
    DROP POLICY IF EXISTS "Users can insert own supplies" ON supplies;
    DROP POLICY IF EXISTS "Users can update own supplies" ON supplies;
    DROP POLICY IF EXISTS "Users can delete own supplies" ON supplies;
    
    CREATE POLICY "Users can view own supplies" ON supplies FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own supplies" ON supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own supplies" ON supplies FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own supplies" ON supplies FOR DELETE USING (auth.uid() = user_id);
    
    -- Calendar integrations policies
    DROP POLICY IF EXISTS "Users can view own calendar integrations" ON calendar_integrations;
    DROP POLICY IF EXISTS "Users can insert own calendar integrations" ON calendar_integrations;
    DROP POLICY IF EXISTS "Users can update own calendar integrations" ON calendar_integrations;
    DROP POLICY IF EXISTS "Users can delete own calendar integrations" ON calendar_integrations;
    
    CREATE POLICY "Users can view own calendar integrations" ON calendar_integrations FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own calendar integrations" ON calendar_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own calendar integrations" ON calendar_integrations FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own calendar integrations" ON calendar_integrations FOR DELETE USING (auth.uid() = user_id);
    
    -- Booking requests policies
    DROP POLICY IF EXISTS "Users can view own booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Users can insert own booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Users can update own booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Users can delete own booking requests" ON booking_requests;
    
    CREATE POLICY "Users can view own booking requests" ON booking_requests FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own booking requests" ON booking_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own booking requests" ON booking_requests FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own booking requests" ON booking_requests FOR DELETE USING (auth.uid() = user_id);
    
    -- Feedback policies (feedback is public via tokens, but jobs are protected)
    DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
    DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
    DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
    DROP POLICY IF EXISTS "Users can delete own feedback" ON feedback;
    
    CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can insert own feedback" ON feedback FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can update own feedback" ON feedback FOR UPDATE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can delete own feedback" ON feedback FOR DELETE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = feedback.job_id AND jobs.user_id = auth.uid())
    );
    
    -- Public feedback access via tokens (for submitting feedback)
    DROP POLICY IF EXISTS "Public feedback access via tokens" ON feedback;
    CREATE POLICY "Public feedback access via tokens" ON feedback FOR SELECT USING (true);
    CREATE POLICY "Public feedback submission" ON feedback FOR UPDATE USING (true);
    
    -- Tasks, notes, photos policies (these reference jobs, so they inherit user_id through the job)
    DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
    
    CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = tasks.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = tasks.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = tasks.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = tasks.job_id AND jobs.user_id = auth.uid())
    );
    
    DROP POLICY IF EXISTS "Users can view own notes" ON notes;
    DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
    DROP POLICY IF EXISTS "Users can update own notes" ON notes;
    DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
    
    CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = notes.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = notes.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = notes.job_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (
        EXISTS (SELECT 1 FROM jobs WHERE jobs.id = notes.job_id AND jobs.user_id = auth.uid())
    );
    
    DROP POLICY IF EXISTS "Users can view own photos" ON photos;
    DROP POLICY IF EXISTS "Users can insert own photos" ON photos;
    DROP POLICY IF EXISTS "Users can update own photos" ON photos;
    DROP POLICY IF EXISTS "Users can delete own photos" ON photos;
    
    CREATE POLICY "Users can view own photos" ON photos FOR SELECT USING (
        EXISTS (SELECT 1 FROM tasks JOIN jobs ON tasks.job_id = jobs.id WHERE tasks.id = photos.task_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can insert own photos" ON photos FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM tasks JOIN jobs ON tasks.job_id = jobs.id WHERE tasks.id = photos.task_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can update own photos" ON photos FOR UPDATE USING (
        EXISTS (SELECT 1 FROM tasks JOIN jobs ON tasks.job_id = jobs.id WHERE tasks.id = photos.task_id AND jobs.user_id = auth.uid())
    );
    CREATE POLICY "Users can delete own photos" ON photos FOR DELETE USING (
        EXISTS (SELECT 1 FROM tasks JOIN jobs ON tasks.job_id = jobs.id WHERE tasks.id = photos.task_id AND jobs.user_id = auth.uid())
    );
END $$;

-- 5. Success message
SELECT 'Comprehensive database fix completed successfully!' as status; 