export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          description: string
          scheduled_date: string
          scheduled_time: string
          status: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          title: string
          description: string
          scheduled_date: string
          scheduled_time: string
          status?: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          title?: string
          description?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          job_id: string
          title: string
          description: string
          is_completed: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          title: string
          description: string
          is_completed?: boolean
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          title?: string
          description?: string
          is_completed?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          task_id: string
          file_path: string
          file_name: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          file_path: string
          file_name: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          file_path?: string
          file_name?: string
          file_size?: number
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          job_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          job_id: string
          report_url: string
          email_sent: boolean
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          report_url: string
          email_sent?: boolean
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          report_url?: string
          email_sent?: boolean
          sent_at?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          logo_url: string
          primary_color: string
          secondary_color: string
          email_template: string
          contact_email: string
          contact_phone: string
          website_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          logo_url?: string
          primary_color?: string
          secondary_color?: string
          email_template?: string
          contact_email?: string
          contact_phone?: string
          website_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          logo_url?: string
          primary_color?: string
          secondary_color?: string
          email_template?: string
          contact_email?: string
          contact_phone?: string
          website_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add-on Features Tables
      recurring_jobs: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          description: string
          frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly'
          start_date: string
          end_date: string | null
          scheduled_time: string
          is_active: boolean
          last_generated_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          title: string
          description: string
          frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly'
          start_date: string
          end_date?: string | null
          scheduled_time: string
          is_active?: boolean
          last_generated_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          title?: string
          description?: string
          frequency?: 'daily' | 'weekly' | 'bi_weekly' | 'monthly'
          start_date?: string
          end_date?: string | null
          scheduled_time?: string
          is_active?: boolean
          last_generated_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          job_id: string
          rating: number
          comment: string | null
          feedback_token: string
          is_submitted: boolean
          submitted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          rating?: number
          comment?: string | null
          feedback_token: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          rating?: number
          comment?: string | null
          feedback_token?: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
        }
      }
      supplies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          current_stock: number
          low_stock_threshold: number
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          current_stock: number
          low_stock_threshold: number
          unit: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          current_stock?: number
          low_stock_threshold?: number
          unit?: string
          created_at?: string
          updated_at?: string
        }
      }
      job_supplies: {
        Row: {
          id: string
          job_id: string
          supply_id: string
          quantity_used: number
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          supply_id: string
          quantity_used: number
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          supply_id?: string
          quantity_used?: number
          created_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          role: 'cleaner' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone: string
          role?: 'cleaner' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'cleaner' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      job_assignments: {
        Row: {
          id: string
          job_id: string
          staff_member_id: string
          assigned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          staff_member_id: string
          assigned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          staff_member_id?: string
          assigned_at?: string
          created_at?: string
        }
      }
      booking_requests: {
        Row: {
          id: string
          user_id: string
          client_name: string
          client_email: string
          client_phone: string
          requested_date: string
          requested_time: string
          service_type: string
          description: string | null
          status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
          booking_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          client_email: string
          client_phone: string
          requested_date: string
          requested_time: string
          service_type: string
          description?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
          booking_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          requested_date?: string
          requested_time?: string
          service_type?: string
          description?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
          booking_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      calendar_integrations: {
        Row: {
          id: string
          user_id: string
          calendar_url: string
          calendar_type: 'google' | 'outlook' | 'ical'
          is_active: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_url: string
          calendar_type?: 'google' | 'outlook' | 'ical'
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_url?: string
          calendar_type?: 'google' | 'outlook' | 'ical'
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_portal_users: {
        Row: {
          id: string
          client_id: string
          email: string
          password_hash: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          email: string
          password_hash: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          email?: string
          password_hash?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_recommendations: {
        Row: {
          id: string
          user_id: string
          client_id: string
          task_name: string
          last_completed_date: string | null
          frequency_weeks: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          task_name: string
          last_completed_date?: string | null
          frequency_weeks: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          task_name?: string
          last_completed_date?: string | null
          frequency_weeks?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Client = Database['public']['Tables']['clients']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Add-on Features Types
export type RecurringJob = Database['public']['Tables']['recurring_jobs']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type Supply = Database['public']['Tables']['supplies']['Row']
export type JobSupply = Database['public']['Tables']['job_supplies']['Row']
export type StaffMember = Database['public']['Tables']['staff_members']['Row']
export type JobAssignment = Database['public']['Tables']['job_assignments']['Row']
export type BookingRequest = Database['public']['Tables']['booking_requests']['Row']
export type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row']
export type ClientPortalUser = Database['public']['Tables']['client_portal_users']['Row']
export type ServiceRecommendation = Database['public']['Tables']['service_recommendations']['Row'] 

// Extended types with relationships
export interface JobWithClient extends Job {
  client?: Client
}

export interface ReportWithJob extends Report {
  job?: JobWithClient
}

export interface RecurringJobWithClient extends RecurringJob {
  client?: Client
}

export interface FeedbackWithJob extends Feedback {
  job?: JobWithClient
} 