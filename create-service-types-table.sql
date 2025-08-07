-- Create service_types table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_types_user_id ON service_types(user_id);
CREATE INDEX IF NOT EXISTS idx_service_types_is_active ON service_types(is_active);

-- Enable Row Level Security
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own service types" ON service_types
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service types" ON service_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service types" ON service_types
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service types" ON service_types
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_types_updated_at 
  BEFORE UPDATE ON service_types 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default service types for existing users (optional)
-- This can be run manually if needed
-- INSERT INTO service_types (user_id, name, description) 
-- SELECT id, 'General Cleaning', 'Standard cleaning service including dusting, vacuuming, and surface cleaning' 
-- FROM auth.users 
-- WHERE id NOT IN (SELECT DISTINCT user_id FROM service_types);

SELECT 'service_types table created successfully!' as status; 