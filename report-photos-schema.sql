-- Report Photos Table - Links photos to reports
CREATE TABLE IF NOT EXISTS report_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL DEFAULT 'general', -- before, after, general, task_specific
    display_order INTEGER NOT NULL DEFAULT 0,
    include_in_report BOOLEAN NOT NULL DEFAULT true,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, photo_id)
);

-- Report Tasks Table - Links tasks and their completion status to reports
CREATE TABLE IF NOT EXISTS report_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    task_description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    display_order INTEGER NOT NULL DEFAULT 0,
    include_in_report BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, task_id)
);

-- Report Configuration Table - Stores report template settings
CREATE TABLE IF NOT EXISTS report_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    secondary_color VARCHAR(7) DEFAULT '#1F2937',
    accent_color VARCHAR(7) DEFAULT '#10B981',
    font_family VARCHAR(50) DEFAULT 'Inter',
    include_company_logo BOOLEAN NOT NULL DEFAULT true,
    include_company_colors BOOLEAN NOT NULL DEFAULT true,
    include_photos BOOLEAN NOT NULL DEFAULT true,
    include_tasks BOOLEAN NOT NULL DEFAULT true,
    include_notes BOOLEAN NOT NULL DEFAULT true,
    include_timer_data BOOLEAN NOT NULL DEFAULT true,
    photo_layout VARCHAR(20) DEFAULT 'grid', -- grid, carousel, list
    max_photos_per_report INTEGER DEFAULT 20,
    report_template TEXT DEFAULT 'standard', -- standard, detailed, minimal
    custom_header_text TEXT,
    custom_footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Report Templates Table - Predefined report templates
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL, -- Stores template configuration
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default report templates
INSERT INTO report_templates (name, description, template_data, is_default) VALUES
('Standard', 'Professional report with photos, tasks, and company branding', 
'{
  "sections": ["header", "job_info", "tasks", "photos", "notes", "footer"],
  "photo_layout": "grid",
  "include_company_logo": true,
  "include_company_colors": true,
  "max_photos": 20
}', true),
('Detailed', 'Comprehensive report with all details and large photos',
'{
  "sections": ["header", "job_info", "tasks", "photos", "notes", "timer_data", "footer"],
  "photo_layout": "carousel",
  "include_company_logo": true,
  "include_company_colors": true,
  "max_photos": 50
}', false),
('Minimal', 'Simple report with essential information only',
'{
  "sections": ["header", "job_info", "tasks", "footer"],
  "photo_layout": "list",
  "include_company_logo": false,
  "include_company_colors": false,
  "max_photos": 5
}', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON report_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_report_photos_photo_id ON report_photos(photo_id);
CREATE INDEX IF NOT EXISTS idx_report_tasks_report_id ON report_tasks(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tasks_task_id ON report_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_report_configurations_user_id ON report_configurations(user_id);

-- Create RLS policies
ALTER TABLE report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Report Photos policies
CREATE POLICY "Users can view their own report photos" ON report_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_photos.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own report photos" ON report_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_photos.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own report photos" ON report_photos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_photos.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own report photos" ON report_photos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_photos.report_id
            AND j.user_id = auth.uid()
        )
    );

-- Report Tasks policies
CREATE POLICY "Users can view their own report tasks" ON report_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_tasks.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own report tasks" ON report_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_tasks.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own report tasks" ON report_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_tasks.report_id
            AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own report tasks" ON report_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM reports r
            JOIN jobs j ON r.job_id = j.id
            WHERE r.id = report_tasks.report_id
            AND j.user_id = auth.uid()
        )
    );

-- Report Configurations policies
CREATE POLICY "Users can view their own report configurations" ON report_configurations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own report configurations" ON report_configurations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own report configurations" ON report_configurations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own report configurations" ON report_configurations
    FOR DELETE USING (user_id = auth.uid());

-- Report Templates policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view report templates" ON report_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_report_photos_updated_at BEFORE UPDATE ON report_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_tasks_updated_at BEFORE UPDATE ON report_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_configurations_updated_at BEFORE UPDATE ON report_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
