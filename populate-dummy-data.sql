-- Clean Report - Data Cleanup Script
-- This script removes all existing data from the database
-- Use this to start fresh with your app

-- STEP 1: REMOVE ALL EXISTING DATA
SET session_replication_role = replica;

TRUNCATE TABLE 
   job_worker_assignments, sub_contractor_job_assignments, job_assignments, job_supplies,
   photos, tasks, notes, reports, feedback, recurring_job_notes, recurring_jobs, jobs,
   clients, supplies, staff_members, sub_contractors, booking_requests, calendar_integrations,
   client_portal_users, service_recommendations, service_types, user_profiles,
   financial_transactions, payments, invoice_items, invoices, payment_methods,
   stripe_connect_accounts, invoice_templates, tax_rates,
   stripe_connections, stripe_payments, twilio_connections, twilio_sms_logs,
   quickbooks_connections, quickbooks_invoices
RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;

-- SUCCESS MESSAGE
DO $$ 
BEGIN 
    RAISE NOTICE 'Database cleanup completed successfully!';
    RAISE NOTICE 'All existing data has been removed.';
    RAISE NOTICE 'You can now start fresh with your Clean Report app.';
    RAISE NOTICE '';
    RAISE NOTICE 'To add dummy data:';
    RAISE NOTICE '1. First sign up with a user account through the app';
    RAISE NOTICE '2. Then run a separate script to add sample data for that user';
    RAISE NOTICE '3. Or manually add clients, jobs, and other data through the app interface';
END $$;
