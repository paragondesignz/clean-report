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
          end_time: string | null
          recurring_job_id: string | null
          recurring_instance_date: string | null
          status: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          timer_started_at: string | null
          timer_ended_at: string | null
          total_time_seconds: number
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
          end_time?: string | null
          recurring_job_id?: string | null
          recurring_instance_date?: string | null
          status?: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          timer_started_at?: string | null
          timer_ended_at?: string | null
          total_time_seconds?: number
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
          end_time?: string | null
          recurring_job_id?: string | null
          recurring_instance_date?: string | null
          status?: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          timer_started_at?: string | null
          timer_ended_at?: string | null
          total_time_seconds?: number
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
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          report_url: string
          email_sent?: boolean
          sent_at?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          report_url?: string
          email_sent?: boolean
          sent_at?: string
          user_id?: string
          created_at?: string
        }
      }
      report_photos: {
        Row: {
          id: string
          report_id: string
          photo_id: string
          photo_type: string
          display_order: number
          include_in_report: boolean
          caption: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          photo_id: string
          photo_type?: string
          display_order?: number
          include_in_report?: boolean
          caption?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          photo_id?: string
          photo_type?: string
          display_order?: number
          include_in_report?: boolean
          caption?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_tasks: {
        Row: {
          id: string
          report_id: string
          task_id: string
          task_title: string
          task_description: string | null
          is_completed: boolean
          completed_at: string | null
          display_order: number
          include_in_report: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          task_id: string
          task_title: string
          task_description?: string | null
          is_completed?: boolean
          completed_at?: string | null
          display_order?: number
          include_in_report?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          task_id?: string
          task_title?: string
          task_description?: string | null
          is_completed?: boolean
          completed_at?: string | null
          display_order?: number
          include_in_report?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      report_configurations: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_logo_url: string | null
          primary_color: string
          secondary_color: string
          accent_color: string
          font_family: string
          include_company_logo: boolean
          include_company_colors: boolean
          include_photos: boolean
          include_tasks: boolean
          include_notes: boolean
          include_timer_data: boolean
          photo_layout: string
          max_photos_per_report: number
          report_template: string
          custom_header_text: string | null
          custom_footer_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          font_family?: string
          include_company_logo?: boolean
          include_company_colors?: boolean
          include_photos?: boolean
          include_tasks?: boolean
          include_notes?: boolean
          include_timer_data?: boolean
          photo_layout?: string
          max_photos_per_report?: number
          report_template?: string
          custom_header_text?: string | null
          custom_footer_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          font_family?: string
          include_company_logo?: boolean
          include_company_colors?: boolean
          include_photos?: boolean
          include_tasks?: boolean
          include_notes?: boolean
          include_timer_data?: boolean
          photo_layout?: string
          max_photos_per_report?: number
          report_template?: string
          custom_header_text?: string | null
          custom_footer_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          template_data: any
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          template_data: any
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          template_data?: any
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          subscription_tier: 'free' | 'pro'
          mobile_portal_password: string | null
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
          subscription_tier?: 'free' | 'pro'
          mobile_portal_password?: string | null
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
          subscription_tier?: 'free' | 'pro'
          mobile_portal_password?: string | null
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
          rating: number | null
          comment: string | null
          feedback_token: string
          is_submitted: boolean
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          rating?: number | null
          comment?: string | null
          feedback_token: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          rating?: number | null
          comment?: string | null
          feedback_token?: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
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
      service_types: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sub_contractors: {
        Row: {
          id: string
          user_id: string
          admin_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          status: 'active' | 'inactive' | 'pending'
          hourly_rate: number
          specialties: string[]
          availability: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          admin_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          status?: 'active' | 'inactive' | 'pending'
          hourly_rate?: number
          specialties?: string[]
          availability?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          admin_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          status?: 'active' | 'inactive' | 'pending'
          hourly_rate?: number
          specialties?: string[]
          availability?: any
          created_at?: string
          updated_at?: string
        }
      }
      sub_contractor_job_assignments: {
        Row: {
          id: string
          job_id: string
          sub_contractor_id: string
          assigned_at: string
          status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          sub_contractor_id: string
          assigned_at?: string
          status?: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          sub_contractor_id?: string
          assigned_at?: string
          status?: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          job_id: string | null
          invoice_number: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          notes: string | null
          terms: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          job_id?: string | null
          invoice_number?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
          issue_date?: string
          due_date: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          notes?: string | null
          terms?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          job_id?: string | null
          invoice_number?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          notes?: string | null
          terms?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total_price: number
          tax_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          total_price?: number
          tax_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          tax_rate?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          transaction_fee: number
          net_amount: number
          currency: string
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          payment_method: string | null
          stripe_account_id: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          transaction_fee?: number
          net_amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          payment_method?: string | null
          stripe_account_id?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          transaction_fee?: number
          net_amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          payment_method?: string | null
          stripe_account_id?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      stripe_connect_accounts: {
        Row: {
          id: string
          user_id: string
          stripe_account_id: string
          account_type: 'express' | 'standard' | 'custom'
          charges_enabled: boolean
          payouts_enabled: boolean
          details_submitted: boolean
          business_type: string | null
          country: string | null
          email: string | null
          account_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_account_id: string
          account_type: 'express' | 'standard' | 'custom'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          business_type?: string | null
          country?: string | null
          email?: string | null
          account_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_account_id?: string
          account_type?: 'express' | 'standard' | 'custom'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          business_type?: string | null
          country?: string | null
          email?: string | null
          account_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          stripe_payment_method_id: string
          type: 'card' | 'bank_account' | 'sepa_debit'
          card_brand: string | null
          card_last4: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          bank_name: string | null
          bank_last4: string | null
          is_default: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_method_id: string
          type: 'card' | 'bank_account' | 'sepa_debit'
          card_brand?: string | null
          card_last4?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          bank_name?: string | null
          bank_last4?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_method_id?: string
          type?: 'card' | 'bank_account' | 'sepa_debit'
          card_brand?: string | null
          card_last4?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          bank_name?: string | null
          bank_last4?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      financial_transactions: {
        Row: {
          id: string
          user_id: string
          invoice_id: string | null
          payment_id: string | null
          type: 'invoice_created' | 'payment_received' | 'fee_charged' | 'refund_issued' | 'payout_sent'
          amount: number
          description: string
          reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id?: string | null
          payment_id?: string | null
          type: 'invoice_created' | 'payment_received' | 'fee_charged' | 'refund_issued' | 'payout_sent'
          amount: number
          description: string
          reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string | null
          payment_id?: string | null
          type?: 'invoice_created' | 'payment_received' | 'fee_charged' | 'refund_issued' | 'payout_sent'
          amount?: number
          description?: string
          reference?: string | null
          created_at?: string
        }
      }
      invoice_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          template_data: any
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template_data?: any
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template_data?: any
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tax_rates: {
        Row: {
          id: string
          user_id: string
          name: string
          rate: number
          is_default: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          rate: number
          is_default?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          rate?: number
          is_default?: boolean
          is_active?: boolean
          created_at?: string
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
export type ReportPhoto = Database['public']['Tables']['report_photos']['Row']
export type ReportTask = Database['public']['Tables']['report_tasks']['Row']
export type ReportConfiguration = Database['public']['Tables']['report_configurations']['Row']
export type ReportTemplate = Database['public']['Tables']['report_templates']['Row']
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
export type ServiceType = Database['public']['Tables']['service_types']['Row']
export type SubContractor = Database['public']['Tables']['sub_contractors']['Row']
export type SubContractorJobAssignment = Database['public']['Tables']['sub_contractor_job_assignments']['Row']

// Invoicing types
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type StripeConnectAccount = Database['public']['Tables']['stripe_connect_accounts']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row']
export type InvoiceTemplate = Database['public']['Tables']['invoice_templates']['Row']
export type TaxRate = Database['public']['Tables']['tax_rates']['Row'] 

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

export interface SubContractor {
  id: string
  user_id: string
  admin_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  hourly_rate: number
  specialties: string[]
  availability: {
    monday: { start: string; end: string; available: boolean }
    tuesday: { start: string; end: string; available: boolean }
    wednesday: { start: string; end: string; available: boolean }
    thursday: { start: string; end: string; available: boolean }
    friday: { start: string; end: string; available: boolean }
    saturday: { start: string; end: string; available: boolean }
    sunday: { start: string; end: string; available: boolean }
  }
  created_at: string
  updated_at: string
}

export interface SubContractorJobAssignment {
  id: string
  job_id: string
  sub_contractor_id: string
  assigned_at: string
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
  admin_notes: string
}


export interface JobPhoto {
  id: string
  job_id: string
  sub_contractor_id: string
  task_id?: string
  photo_url: string
  photo_type: 'before' | 'after' | 'general' | 'task_specific'
  description: string
  uploaded_at: string
}

export interface JobTask {
  id: string
  job_id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'low' | 'medium' | 'high'
  estimated_time: number
  actual_time?: number
  notes: string
  sub_contractor_notes: string
  completed_at?: string
  created_at: string
  updated_at: string
} 