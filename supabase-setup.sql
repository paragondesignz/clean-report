-- Clean Report - Complete Database Setup Script
-- Run this in your Supabase SQL Editor

-- Core Tables

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  report_url TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  email_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add-On Features Tables

-- Recurring jobs table
CREATE TABLE IF NOT EXISTS recurring_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  scheduled_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  feedback_token TEXT UNIQUE NOT NULL,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplies table
CREATE TABLE IF NOT EXISTS supplies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job supplies table
CREATE TABLE IF NOT EXISTS job_supplies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'cleaner' CHECK (role IN ('cleaner', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job assignments table
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  booking_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar integrations table
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_url TEXT NOT NULL,
  calendar_type TEXT DEFAULT 'google' CHECK (calendar_type IN ('google', 'outlook', 'ical')),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client portal users table
CREATE TABLE IF NOT EXISTS client_portal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service recommendations table
CREATE TABLE IF NOT EXISTS service_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  last_completed_date DATE,
  frequency_weeks INTEGER NOT NULL DEFAULT 4,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Users can view own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
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

-- Photos policies
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

-- Notes policies
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

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = reports.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = reports.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = reports.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = reports.job_id AND jobs.user_id = auth.uid())
);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Recurring jobs policies
CREATE POLICY "Users can view own recurring jobs" ON recurring_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring jobs" ON recurring_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring jobs" ON recurring_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring jobs" ON recurring_jobs FOR DELETE USING (auth.uid() = user_id);

-- Feedback policies
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

-- Supplies policies
CREATE POLICY "Users can view own supplies" ON supplies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplies" ON supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplies" ON supplies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplies" ON supplies FOR DELETE USING (auth.uid() = user_id);

-- Job supplies policies
CREATE POLICY "Users can view own job supplies" ON job_supplies FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_supplies.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can insert own job supplies" ON job_supplies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_supplies.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can update own job supplies" ON job_supplies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_supplies.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can delete own job supplies" ON job_supplies FOR DELETE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_supplies.job_id AND jobs.user_id = auth.uid())
);

-- Staff members policies
CREATE POLICY "Users can view own staff" ON staff_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own staff" ON staff_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own staff" ON staff_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own staff" ON staff_members FOR DELETE USING (auth.uid() = user_id);

-- Job assignments policies
CREATE POLICY "Users can view own job assignments" ON job_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can insert own job assignments" ON job_assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can update own job assignments" ON job_assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "Users can delete own job assignments" ON job_assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.user_id = auth.uid())
);

-- Booking requests policies
CREATE POLICY "Users can view own booking requests" ON booking_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own booking requests" ON booking_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own booking requests" ON booking_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own booking requests" ON booking_requests FOR DELETE USING (auth.uid() = user_id);

-- Calendar integrations policies
CREATE POLICY "Users can view own calendar integrations" ON calendar_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar integrations" ON calendar_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar integrations" ON calendar_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar integrations" ON calendar_integrations FOR DELETE USING (auth.uid() = user_id);

-- Client portal users policies
CREATE POLICY "Users can view own client portal users" ON client_portal_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_users.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert own client portal users" ON client_portal_users FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_users.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update own client portal users" ON client_portal_users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_users.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete own client portal users" ON client_portal_users FOR DELETE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_portal_users.client_id AND clients.user_id = auth.uid())
);

-- Service recommendations policies
CREATE POLICY "Users can view own service recommendations" ON service_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own service recommendations" ON service_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own service recommendations" ON service_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own service recommendations" ON service_recommendations FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_photos_task_id ON photos(task_id);
CREATE INDEX IF NOT EXISTS idx_notes_job_id ON notes(job_id);
CREATE INDEX IF NOT EXISTS idx_reports_job_id ON reports(job_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_user_id ON recurring_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_job_id ON feedback(job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_token ON feedback(feedback_token);
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON supplies(user_id);
CREATE INDEX IF NOT EXISTS idx_job_supplies_job_id ON job_supplies(job_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_job_id ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_token ON booking_requests(booking_token);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_client_id ON client_portal_users(client_id);
CREATE INDEX IF NOT EXISTS idx_service_recommendations_user_id ON service_recommendations(user_id);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_jobs_updated_at BEFORE UPDATE ON recurring_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON supplies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON booking_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_portal_users_updated_at BEFORE UPDATE ON client_portal_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_recommendations_updated_at BEFORE UPDATE ON service_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable storage for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
SELECT 'Database setup completed successfully!' as status; 