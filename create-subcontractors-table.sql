-- Create subcontractors table
CREATE TABLE IF NOT EXISTS sub_contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job assignments for subcontractors
CREATE TABLE IF NOT EXISTS sub_contractor_job_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  sub_contractor_id UUID REFERENCES sub_contractors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sub_contractors_user_id ON sub_contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_contractors_admin_id ON sub_contractors(admin_id);
CREATE INDEX IF NOT EXISTS idx_sub_contractor_job_assignments_job_id ON sub_contractor_job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_sub_contractor_job_assignments_sub_contractor_id ON sub_contractor_job_assignments(sub_contractor_id);

-- Create triggers for updated_at
CREATE TRIGGER update_sub_contractors_updated_at BEFORE UPDATE ON sub_contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_contractor_job_assignments_updated_at BEFORE UPDATE ON sub_contractor_job_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE sub_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_contractor_job_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for sub_contractors table
CREATE POLICY "Admins can view their sub contractors" ON sub_contractors
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can insert their sub contractors" ON sub_contractors
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their sub contractors" ON sub_contractors
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their sub contractors" ON sub_contractors
  FOR DELETE USING (admin_id = auth.uid());

CREATE POLICY "Sub contractors can view their own profile" ON sub_contractors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sub contractors can update their own profile" ON sub_contractors
  FOR UPDATE USING (user_id = auth.uid());

-- Policies for sub_contractor_job_assignments table
CREATE POLICY "Admins can view job assignments for their sub contractors" ON sub_contractor_job_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sub_contractors 
      WHERE sub_contractors.id = sub_contractor_job_assignments.sub_contractor_id 
      AND sub_contractors.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert job assignments" ON sub_contractor_job_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sub_contractors 
      WHERE sub_contractors.id = sub_contractor_job_assignments.sub_contractor_id 
      AND sub_contractors.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update job assignments" ON sub_contractor_job_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sub_contractors 
      WHERE sub_contractors.id = sub_contractor_job_assignments.sub_contractor_id 
      AND sub_contractors.admin_id = auth.uid()
    )
  );

CREATE POLICY "Sub contractors can view their job assignments" ON sub_contractor_job_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sub_contractors 
      WHERE sub_contractors.id = sub_contractor_job_assignments.sub_contractor_id 
      AND sub_contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Sub contractors can update their job assignments" ON sub_contractor_job_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sub_contractors 
      WHERE sub_contractors.id = sub_contractor_job_assignments.sub_contractor_id 
      AND sub_contractors.user_id = auth.uid()
    )
  );
