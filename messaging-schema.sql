-- Messaging System Database Schema
-- This schema supports real-time communication between admins and sub contractors

-- Chat Threads Table
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sub_contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  last_message JSONB,
  unread_count INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'sub_contractor')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  attachments JSONB,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Attachments Table (for tracking uploaded files)
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Online Status Table (for tracking user presence)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_admin_id ON chat_threads(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_sub_contractor_id ON chat_threads(sub_contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_job_id ON chat_threads(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_updated_at ON chat_threads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Chat Threads RLS Policies
CREATE POLICY "Users can view their own chat threads" ON chat_threads
  FOR SELECT USING (
    auth.uid() = admin_id OR auth.uid() = sub_contractor_id
  );

CREATE POLICY "Admins can create chat threads" ON chat_threads
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id
  );

CREATE POLICY "Users can update their own chat threads" ON chat_threads
  FOR UPDATE USING (
    auth.uid() = admin_id OR auth.uid() = sub_contractor_id
  );

CREATE POLICY "Admins can delete chat threads" ON chat_threads
  FOR DELETE USING (
    auth.uid() = admin_id
  );

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE id = messages.thread_id 
      AND (admin_id = auth.uid() OR sub_contractor_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE id = messages.thread_id 
      AND (admin_id = auth.uid() OR sub_contractor_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

CREATE POLICY "Admins can delete messages" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE id = messages.thread_id 
      AND admin_id = auth.uid()
    )
  );

-- Message Attachments RLS Policies
CREATE POLICY "Users can view attachments in their threads" ON message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_threads ct ON m.thread_id = ct.id
      WHERE m.id = message_attachments.message_id
      AND (ct.admin_id = auth.uid() OR ct.sub_contractor_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload attachments to their messages" ON message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_threads ct ON m.thread_id = ct.id
      WHERE m.id = message_attachments.message_id
      AND m.sender_id = auth.uid()
      AND (ct.admin_id = auth.uid() OR ct.sub_contractor_id = auth.uid())
    )
  );

-- User Presence RLS Policies
CREATE POLICY "Users can view presence of thread participants" ON user_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE (admin_id = auth.uid() OR sub_contractor_id = auth.uid())
      AND (admin_id = user_presence.user_id OR sub_contractor_id = user_presence.user_id)
    )
  );

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert their own presence" ON user_presence
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_chat_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads 
  SET updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_thread_updated_at_trigger
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_thread_updated_at();

-- Function to update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_threads 
    SET unread_count = unread_count + 1
    WHERE id = NEW.thread_id
    AND admin_id != NEW.sender_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
    UPDATE chat_threads 
    SET unread_count = GREATEST(0, unread_count - 1)
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unread_count_trigger
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_count();

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_presence (user_id, is_online, last_seen)
  VALUES (auth.uid(), TRUE, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    is_online = TRUE,
    last_seen = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Users can upload attachments to their threads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE (admin_id = auth.uid() OR sub_contractor_id = auth.uid())
      AND id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can view attachments in their threads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE (admin_id = auth.uid() OR sub_contractor_id = auth.uid())
      AND id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can delete their own attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-attachments' AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_threads ct ON m.thread_id = ct.id
      WHERE m.sender_id = auth.uid()
      AND m.id::text = (storage.foldername(name))[2]
    )
  );

-- Insert sample data for testing
INSERT INTO chat_threads (admin_id, sub_contractor_id, job_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO messages (thread_id, sender_id, sender_name, sender_type, content, message_type) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Mike Admin', 'admin', 'Hi Sarah, you have a new job assignment for the Johnson residence.', 'text'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sub_contractor', 'Thanks Mike! I can see the job details. What time should I start?', 'text')
ON CONFLICT DO NOTHING; 