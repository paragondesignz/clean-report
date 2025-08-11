-- Clean Report Comprehensive Dummy Data Population Script
-- Simulates 3 months of full-time residential cleaning business operations

-- First, let's get the user_id (replace with your actual user_id)
-- You'll need to replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users

-- Clear existing data (in correct order due to foreign key constraints)
DELETE FROM job_assignments WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM sub_contractor_job_assignments WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM sub_contractors WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM calendar_integrations WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM booking_requests WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM feedback WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM job_supplies WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM supplies WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM photos WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM notes WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM tasks WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM reports WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM jobs WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM recurring_jobs WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM service_types WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM clients WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM staff_members WHERE user_id = 'YOUR_USER_ID_HERE';

-- Insert Service Types
INSERT INTO service_types (user_id, name, description, base_price, estimated_duration, is_active) VALUES
('YOUR_USER_ID_HERE', 'Standard House Cleaning', 'Regular cleaning including bathrooms, kitchen, living areas, and bedrooms', 120.00, 120, true),
('YOUR_USER_ID_HERE', 'Deep House Cleaning', 'Comprehensive cleaning including inside appliances, baseboards, windows', 200.00, 180, true),
('YOUR_USER_ID_HERE', 'Move-In/Move-Out Cleaning', 'Complete cleaning for property transitions', 250.00, 240, true),
('YOUR_USER_ID_HERE', 'Post-Construction Cleanup', 'Cleaning after construction or renovation work', 300.00, 300, true),
('YOUR_USER_ID_HERE', 'Window Cleaning', 'Interior and exterior window cleaning service', 80.00, 90, true),
('YOUR_USER_ID_HERE', 'Carpet Deep Clean', 'Professional carpet cleaning and stain removal', 150.00, 120, true);

-- Insert Clients (mix of regular and occasional customers)
INSERT INTO clients (user_id, name, email, phone, address, notes, created_at) VALUES
-- Regular weekly clients
('YOUR_USER_ID_HERE', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '123 Maple Street, Springfield, MA 01103', 'Weekly cleaning every Tuesday. Has 2 cats. Use pet-safe products only.', '2024-05-15 10:00:00'),
('YOUR_USER_ID_HERE', 'Michael & Lisa Chen', 'mchen@email.com', '(555) 234-5678', '456 Oak Avenue, Springfield, MA 01104', 'Bi-weekly cleaning. Key under flower pot. Prefer eco-friendly products.', '2024-05-20 14:30:00'),
('YOUR_USER_ID_HERE', 'Robert Thompson', 'r.thompson@email.com', '(555) 345-6789', '789 Pine Road, Springfield, MA 01105', 'Monthly deep clean. Large house, 4 bedrooms. Takes 3-4 hours.', '2024-06-01 09:15:00'),
('YOUR_USER_ID_HERE', 'Jennifer Martinez', 'jen.martinez@email.com', '(555) 456-7890', '321 Elm Drive, Springfield, MA 01106', 'Weekly cleaning Fridays. Home office needs special attention. No scented products.', '2024-06-10 16:45:00'),
('YOUR_USER_ID_HERE', 'David & Amy Wilson', 'dwilson@email.com', '(555) 567-8901', '654 Cedar Lane, Springfield, MA 01107', 'Bi-weekly service. 3 young children, focus on sanitizing. Flexible with timing.', '2024-06-15 11:20:00'),

-- Regular clients continued
('YOUR_USER_ID_HERE', 'Margaret Foster', 'margaret.f@email.com', '(555) 678-9012', '987 Birch Street, Springfield, MA 01108', 'Elderly client, weekly cleaning. Be gentle with antique furniture.', '2024-06-20 13:30:00'),
('YOUR_USER_ID_HERE', 'James Rodriguez', 'jrodriguez@email.com', '(555) 789-0123', '147 Spruce Court, Springfield, MA 01109', 'Every other week. Bachelor pad, kitchen needs extra attention.', '2024-07-01 08:45:00'),
('YOUR_USER_ID_HERE', 'Linda & Tom Baker', 'lbaker@email.com', '(555) 890-1234', '258 Willow Way, Springfield, MA 01110', 'Monthly service. Large family home, 5 bedrooms. Usually takes full day.', '2024-07-05 10:30:00'),
('YOUR_USER_ID_HERE', 'Patricia Davis', 'pdavis@email.com', '(555) 901-2345', '369 Poplar Place, Springfield, MA 01111', 'Weekly cleaning Mondays. Work from home, prefer morning appointments.', '2024-07-10 15:00:00'),
('YOUR_USER_ID_HERE', 'Steven Lee', 'steven.lee@email.com', '(555) 012-3456', '741 Ash Avenue, Springfield, MA 01112', 'Bi-weekly deep cleaning. Modern condo, lots of glass surfaces.', '2024-07-15 12:15:00'),

-- Occasional/one-time clients
('YOUR_USER_ID_HERE', 'Emma Richardson', 'emma.r@email.com', '(555) 123-9876', '852 Chestnut Street, Springfield, MA 01113', 'Move-out cleaning needed. Landlord requires professional cleaning receipt.', '2024-07-20 09:00:00'),
('YOUR_USER_ID_HERE', 'Kevin Murphy', 'kmurphy@email.com', '(555) 234-8765', '963 Hickory Road, Springfield, MA 01114', 'Post-renovation cleanup. Kitchen remodel just completed.', '2024-07-25 14:20:00'),
('YOUR_USER_ID_HERE', 'Michelle Wright', 'mwright@email.com', '(555) 345-7654', '159 Magnolia Drive, Springfield, MA 01115', 'Pre-party deep clean. Hosting anniversary party next weekend.', '2024-08-01 11:45:00'),
('YOUR_USER_ID_HERE', 'Daniel Green', 'dgreen@email.com', '(555) 456-6543', '357 Dogwood Lane, Springfield, MA 01116', 'Spring cleaning service. Annual deep clean of entire house.', '2024-08-05 16:30:00'),
('YOUR_USER_ID_HERE', 'Rachel Adams', 'radams@email.com', '(555) 567-5432', '468 Sycamore Street, Springfield, MA 01117', 'Move-in cleaning. Just purchased house, needs thorough cleaning before moving in.', '2024-08-10 10:10:00');

-- Insert Staff Members
INSERT INTO staff_members (user_id, name, email, phone, role, hourly_rate, is_active, hire_date, notes) VALUES
('YOUR_USER_ID_HERE', 'Maria Gonzalez', 'maria.g@cleanteam.com', '(555) 111-2222', 'Senior Cleaner', 22.00, true, '2024-05-01', 'Excellent with detail work. Specializes in kitchen deep cleaning. Bilingual.'),
('YOUR_USER_ID_HERE', 'John Anderson', 'john.a@cleanteam.com', '(555) 222-3333', 'Cleaner', 18.00, true, '2024-06-01', 'Reliable and punctual. Good with carpet cleaning and window work.'),
('YOUR_USER_ID_HERE', 'Sofia Petrov', 'sofia.p@cleanteam.com', '(555) 333-4444', 'Cleaner', 19.50, true, '2024-06-15', 'Fast and efficient. Prefers bathroom and kitchen cleaning. Available weekends.'),
('YOUR_USER_ID_HERE', 'Carlos Rivera', 'carlos.r@cleanteam.com', '(555) 444-5555', 'Senior Cleaner', 21.00, true, '2024-07-01', 'Experienced with post-construction cleanup. Has own transportation.');

-- Insert Sub-Contractors
INSERT INTO sub_contractors (user_id, name, email, phone, specialty, hourly_rate, is_active, notes) VALUES
('YOUR_USER_ID_HERE', 'Premium Carpet Care', 'info@premiumcarpet.com', '(555) 777-8888', 'Carpet and Upholstery Cleaning', 75.00, true, 'Professional carpet cleaning service. Use for large carpet jobs and upholstery.'),
('YOUR_USER_ID_HERE', 'Crystal Clear Windows', 'contact@crystalclear.com', '(555) 888-9999', 'Window Cleaning', 45.00, true, 'Exterior window cleaning specialist. Good for high windows and commercial jobs.'),
('YOUR_USER_ID_HERE', 'Deep Clean Specialists', 'hello@deepcleanspec.com', '(555) 999-0000', 'Post-Construction Cleanup', 65.00, true, 'Handles heavy-duty cleaning after renovations. Has industrial equipment.');

-- Insert Supplies
INSERT INTO supplies (user_id, name, category, current_stock, low_stock_threshold, unit_cost, supplier, last_restocked, notes) VALUES
-- Cleaning Chemicals
('YOUR_USER_ID_HERE', 'All-Purpose Cleaner', 'Cleaning Chemicals', 24, 6, 4.50, 'CleanPro Supply Co.', '2024-08-01', 'Eco-friendly formula. Popular with clients who prefer green products.'),
('YOUR_USER_ID_HERE', 'Disinfectant Spray', 'Cleaning Chemicals', 18, 5, 6.25, 'CleanPro Supply Co.', '2024-08-01', 'EPA registered. Use in bathrooms and kitchens.'),
('YOUR_USER_ID_HERE', 'Glass Cleaner', 'Cleaning Chemicals', 15, 4, 3.75, 'CleanPro Supply Co.', '2024-08-01', 'Streak-free formula. Good for mirrors and windows.'),
('YOUR_USER_ID_HERE', 'Bathroom Cleaner', 'Cleaning Chemicals', 12, 3, 5.80, 'CleanPro Supply Co.', '2024-08-01', 'Heavy duty for soap scum and lime scale removal.'),
('YOUR_USER_ID_HERE', 'Floor Cleaner', 'Cleaning Chemicals', 20, 5, 7.20, 'CleanPro Supply Co.', '2024-08-01', 'Safe for all floor types including hardwood and tile.'),
('YOUR_USER_ID_HERE', 'Carpet Stain Remover', 'Cleaning Chemicals', 8, 3, 8.95, 'CleanPro Supply Co.', '2024-07-15', 'Enzyme-based formula for pet stains and organic spills.'),

-- Tools and Equipment
('YOUR_USER_ID_HERE', 'Microfiber Cloths', 'Tools & Equipment', 45, 15, 2.20, 'Cleaning Warehouse', '2024-08-05', 'High-quality microfiber. Color coded - blue for glass, yellow for general cleaning.'),
('YOUR_USER_ID_HERE', 'Vacuum Bags (Type A)', 'Tools & Equipment', 25, 10, 1.85, 'Cleaning Warehouse', '2024-07-20', 'For Shark Navigator vacuum. Always keep extra stock.'),
('YOUR_USER_ID_HERE', 'Toilet Brushes', 'Tools & Equipment', 12, 4, 3.50, 'Cleaning Warehouse', '2024-08-05', 'Disposable brushes. Replace after each deep clean job.'),
('YOUR_USER_ID_HERE', 'Rubber Gloves (Large)', 'Safety & PPE', 30, 10, 1.25, 'Safety First Supply', '2024-08-10', 'Nitrile gloves. Size large most popular with staff.'),
('YOUR_USER_ID_HERE', 'Rubber Gloves (Medium)', 'Safety & PPE', 25, 8, 1.25, 'Safety First Supply', '2024-08-10', 'Nitrile gloves for staff with smaller hands.'),
('YOUR_USER_ID_HERE', 'Face Masks', 'Safety & PPE', 200, 50, 0.35, 'Safety First Supply', '2024-08-01', 'N95 masks for dusty environments and client preference.'),

-- Disposables
('YOUR_USER_ID_HERE', 'Paper Towels', 'Disposables', 36, 12, 2.80, 'Office Depot', '2024-08-08', 'High-absorbency. Buy in bulk for cost savings.'),
('YOUR_USER_ID_HERE', 'Trash Bags (13 gallon)', 'Disposables', 150, 50, 0.18, 'Office Depot', '2024-08-08', 'Heavy duty for kitchen and general waste.'),
('YOUR_USER_ID_HERE', 'Cleaning Wipes', 'Disposables', 24, 8, 4.20, 'Costco Business', '2024-08-12', 'Antibacterial wipes. Good for quick touch-ups.'),
('YOUR_USER_ID_HERE', 'Sponges', 'Disposables', 40, 15, 0.75, 'Dollar Store Supply', '2024-08-05', 'Non-scratch sponges. Replace frequently to avoid cross-contamination.');

-- Insert Recurring Jobs (regular clients with schedules)
INSERT INTO recurring_jobs (user_id, client_id, title, description, frequency, start_date, end_date, scheduled_time, is_active) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson' AND user_id = 'YOUR_USER_ID_HERE'), 'Weekly House Cleaning - Sarah Johnson', 'Regular weekly cleaning including all rooms, with special attention to pet areas', 'weekly', '2024-05-21', NULL, '09:00:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen' AND user_id = 'YOUR_USER_ID_HERE'), 'Bi-weekly Cleaning - Chen Family', 'Thorough bi-weekly cleaning with eco-friendly products', 'bi_weekly', '2024-05-27', NULL, '10:30:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez' AND user_id = 'YOUR_USER_ID_HERE'), 'Weekly Office Clean - Martinez', 'Weekly cleaning with focus on home office sanitization', 'weekly', '2024-06-14', NULL, '08:00:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson' AND user_id = 'YOUR_USER_ID_HERE'), 'Family Home Bi-weekly - Wilson', 'Child-safe cleaning with extra sanitization', 'bi_weekly', '2024-06-17', NULL, '13:00:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster' AND user_id = 'YOUR_USER_ID_HERE'), 'Senior Care Weekly - Foster', 'Gentle weekly cleaning with special care for antiques', 'weekly', '2024-06-24', NULL, '11:00:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'James Rodriguez' AND user_id = 'YOUR_USER_ID_HERE'), 'Bachelor Pad Cleaning - Rodriguez', 'Bi-weekly cleaning with kitchen deep clean', 'bi_weekly', '2024-07-03', NULL, '14:30:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis' AND user_id = 'YOUR_USER_ID_HERE'), 'Work-from-Home Clean - Davis', 'Monday morning cleaning for home office worker', 'weekly', '2024-07-15', NULL, '07:30:00', true),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Steven Lee' AND user_id = 'YOUR_USER_ID_HERE'), 'Modern Condo Deep Clean - Lee', 'Bi-weekly deep cleaning focusing on glass surfaces', 'bi_weekly', '2024-07-22', NULL, '15:00:00', true);

-- Generate Jobs for the past 3 months (May-July 2024)
-- We'll create a mix of recurring job instances and one-time jobs

-- May 2024 Jobs
INSERT INTO jobs (user_id, client_id, recurring_job_id, title, description, scheduled_date, scheduled_time, end_time, status, agreed_hours, actual_hours, total_cost, created_at) VALUES
-- Sarah Johnson weekly jobs
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular weekly cleaning with pet-safe products', '2024-05-21', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-05-18 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular weekly cleaning with pet-safe products', '2024-05-28', '09:00:00', '11:45:00', 'completed', 2.5, 2.75, 120.00, '2024-05-25 10:00:00'),

-- Michael & Lisa Chen bi-weekly
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Eco-friendly deep cleaning', '2024-05-27', '10:30:00', '13:00:00', 'completed', 3.0, 2.5, 150.00, '2024-05-24 14:30:00'),

-- One-time jobs in May
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Emma Richardson'), NULL, 'Move-Out Deep Clean', 'Complete move-out cleaning for security deposit', '2024-05-30', '08:00:00', '14:00:00', 'completed', 6.0, 6.0, 250.00, '2024-05-27 09:00:00');

-- Continue with more jobs for June and July...
-- June 2024 Jobs
INSERT INTO jobs (user_id, client_id, recurring_job_id, title, description, scheduled_date, scheduled_time, end_time, status, agreed_hours, actual_hours, total_cost, created_at) VALUES
-- Sarah Johnson weekly (all June)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning, extra attention to cat litter area', '2024-06-04', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-06-01 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning plus window washing', '2024-06-11', '09:00:00', '12:00:00', 'completed', 2.5, 3.0, 140.00, '2024-06-08 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-06-18', '09:00:00', '11:15:00', 'completed', 2.5, 2.25, 120.00, '2024-06-15 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-06-25', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-06-22 10:00:00'),

-- Chen family bi-weekly
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Deep clean with organic products', '2024-06-10', '10:30:00', '13:00:00', 'completed', 3.0, 2.5, 150.00, '2024-06-07 14:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Spring deep clean', '2024-06-24', '10:30:00', '14:30:00', 'completed', 3.0, 4.0, 180.00, '2024-06-21 14:30:00'),

-- Jennifer Martinez weekly (started mid-June)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'First cleaning with office focus', '2024-06-14', '08:00:00', '11:00:00', 'completed', 3.0, 3.0, 135.00, '2024-06-11 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning with sanitization', '2024-06-21', '08:00:00', '10:30:00', 'completed', 3.0, 2.5, 135.00, '2024-06-18 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-06-28', '08:00:00', '10:45:00', 'completed', 3.0, 2.75, 135.00, '2024-06-25 16:45:00'),

-- Wilson family bi-weekly (started mid-June)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Wilson%'), 'Family Home Bi-weekly - Wilson', 'Child-safe deep clean', '2024-06-17', '13:00:00', '16:30:00', 'completed', 3.5, 3.5, 175.00, '2024-06-14 11:20:00'),

-- One-time jobs June
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Kevin Murphy'), NULL, 'Post-Renovation Cleanup', 'Kitchen remodel cleanup, heavy duty', '2024-06-15', '09:00:00', '17:00:00', 'completed', 8.0, 8.0, 300.00, '2024-06-12 14:20:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Robert Thompson'), NULL, 'Monthly Deep Clean', 'Full house deep clean, 4 bedrooms', '2024-06-20', '08:00:00', '15:00:00', 'completed', 7.0, 7.0, 280.00, '2024-06-17 09:15:00');

-- July 2024 Jobs (more comprehensive)
INSERT INTO jobs (user_id, client_id, recurring_job_id, title, description, scheduled_date, scheduled_time, end_time, status, agreed_hours, actual_hours, total_cost, created_at) VALUES
-- All regular clients continuing their schedules...
-- Sarah Johnson weekly (July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-07-02', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-06-29 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning plus carpet spot treatment', '2024-07-09', '09:00:00', '12:00:00', 'completed', 2.5, 3.0, 140.00, '2024-07-06 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-07-16', '09:00:00', '11:15:00', 'completed', 2.5, 2.25, 120.00, '2024-07-13 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-07-23', '09:00:00', '11:45:00', 'completed', 2.5, 2.75, 120.00, '2024-07-20 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-07-30', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-07-27 10:00:00'),

-- Chen family (July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Deep clean', '2024-07-08', '10:30:00', '13:00:00', 'completed', 3.0, 2.5, 150.00, '2024-07-05 14:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Deep clean plus garage organization', '2024-07-22', '10:30:00', '15:00:00', 'completed', 3.0, 4.5, 200.00, '2024-07-19 14:30:00'),

-- Jennifer Martinez (July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-07-05', '08:00:00', '10:30:00', 'completed', 3.0, 2.5, 135.00, '2024-07-02 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-07-12', '08:00:00', '10:45:00', 'completed', 3.0, 2.75, 135.00, '2024-07-09 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-07-19', '08:00:00', '10:30:00', 'completed', 3.0, 2.5, 135.00, '2024-07-16 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-07-26', '08:00:00', '10:45:00', 'completed', 3.0, 2.75, 135.00, '2024-07-23 16:45:00'),

-- Wilson family (July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Wilson%'), 'Family Home Bi-weekly - Wilson', 'Child-safe cleaning', '2024-07-01', '13:00:00', '16:00:00', 'completed', 3.5, 3.0, 175.00, '2024-06-28 11:20:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Wilson%'), 'Family Home Bi-weekly - Wilson', 'Deep sanitization requested', '2024-07-15', '13:00:00', '17:00:00', 'completed', 3.5, 4.0, 200.00, '2024-07-12 11:20:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Wilson%'), 'Family Home Bi-weekly - Wilson', 'Regular cleaning', '2024-07-29', '13:00:00', '16:30:00', 'completed', 3.5, 3.5, 175.00, '2024-07-26 11:20:00'),

-- Margaret Foster weekly (started late June)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Gentle cleaning, first visit', '2024-06-24', '11:00:00', '14:00:00', 'completed', 3.0, 3.0, 150.00, '2024-06-21 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular gentle cleaning', '2024-07-01', '11:00:00', '13:30:00', 'completed', 3.0, 2.5, 150.00, '2024-06-28 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning', '2024-07-08', '11:00:00', '13:30:00', 'completed', 3.0, 2.5, 150.00, '2024-07-05 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning', '2024-07-15', '11:00:00', '13:45:00', 'completed', 3.0, 2.75, 150.00, '2024-07-12 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning plus silver polishing', '2024-07-22', '11:00:00', '14:30:00', 'completed', 3.0, 3.5, 170.00, '2024-07-19 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning', '2024-07-29', '11:00:00', '13:30:00', 'completed', 3.0, 2.5, 150.00, '2024-07-26 13:30:00'),

-- James Rodriguez bi-weekly (started July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'James Rodriguez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Rodriguez%'), 'Bachelor Pad Cleaning - Rodriguez', 'Initial deep clean', '2024-07-03', '14:30:00', '18:00:00', 'completed', 3.0, 3.5, 165.00, '2024-06-30 08:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'James Rodriguez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Rodriguez%'), 'Bachelor Pad Cleaning - Rodriguez', 'Bi-weekly cleaning', '2024-07-17', '14:30:00', '17:30:00', 'completed', 3.0, 3.0, 150.00, '2024-07-14 08:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'James Rodriguez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Rodriguez%'), 'Bachelor Pad Cleaning - Rodriguez', 'Bi-weekly cleaning', '2024-07-31', '14:30:00', '17:15:00', 'completed', 3.0, 2.75, 150.00, '2024-07-28 08:45:00'),

-- Patricia Davis weekly (started mid-July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Davis%'), 'Work-from-Home Clean - Davis', 'First visit, early morning', '2024-07-15', '07:30:00', '10:00:00', 'completed', 2.5, 2.5, 125.00, '2024-07-12 15:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Davis%'), 'Work-from-Home Clean - Davis', 'Regular Monday cleaning', '2024-07-22', '07:30:00', '09:45:00', 'completed', 2.5, 2.25, 125.00, '2024-07-19 15:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Davis%'), 'Work-from-Home Clean - Davis', 'Regular cleaning', '2024-07-29', '07:30:00', '10:00:00', 'completed', 2.5, 2.5, 125.00, '2024-07-26 15:00:00'),

-- Steven Lee bi-weekly (started late July)
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Steven Lee'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Lee%'), 'Modern Condo Deep Clean - Lee', 'First visit - lots of glass', '2024-07-22', '15:00:00', '18:30:00', 'completed', 3.0, 3.5, 175.00, '2024-07-19 12:15:00'),

-- One-time jobs in July
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michelle Wright'), NULL, 'Pre-Party Deep Clean', 'Deep clean before anniversary party', '2024-07-12', '09:00:00', '15:00:00', 'completed', 6.0, 6.0, 240.00, '2024-07-09 11:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Daniel Green'), NULL, 'Annual Spring Deep Clean', 'Complete house spring cleaning', '2024-07-18', '08:00:00', '16:00:00', 'completed', 8.0, 8.0, 320.00, '2024-07-15 16:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Linda & Tom Baker'), NULL, 'Monthly Family Home Clean', 'Large family home, full day clean', '2024-07-25', '08:00:00', '17:00:00', 'completed', 9.0, 9.0, 360.00, '2024-07-22 10:30:00');

-- August 2024 Jobs (current month, mix of completed and scheduled)
INSERT INTO jobs (user_id, client_id, recurring_job_id, title, description, scheduled_date, scheduled_time, end_time, status, agreed_hours, actual_hours, total_cost, created_at) VALUES
-- Early August completed jobs
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-08-06', '09:00:00', '11:30:00', 'completed', 2.5, 2.5, 120.00, '2024-08-03 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Davis%'), 'Work-from-Home Clean - Davis', 'Regular Monday cleaning', '2024-08-05', '07:30:00', '09:45:00', 'completed', 2.5, 2.25, 125.00, '2024-08-02 15:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Michael & Lisa Chen'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Chen%'), 'Bi-weekly Cleaning - Chen Family', 'Deep clean', '2024-08-05', '10:30:00', '13:00:00', 'completed', 3.0, 2.5, 150.00, '2024-08-02 14:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Steven Lee'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Lee%'), 'Modern Condo Deep Clean - Lee', 'Bi-weekly glass-focused cleaning', '2024-08-05', '15:00:00', '18:00:00', 'completed', 3.0, 3.0, 175.00, '2024-08-02 12:15:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning', '2024-08-05', '11:00:00', '13:30:00', 'completed', 3.0, 2.5, 150.00, '2024-08-02 13:30:00'),

-- Recent completed jobs
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Rachel Adams'), NULL, 'Move-In Deep Clean', 'New house pre-move cleaning', '2024-08-10', '08:00:00', '15:00:00', 'completed', 7.0, 7.0, 280.00, '2024-08-07 10:10:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-08-09', '08:00:00', '10:30:00', 'completed', 3.0, 2.5, 135.00, '2024-08-06 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'David & Amy Wilson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Wilson%'), 'Family Home Bi-weekly - Wilson', 'Back-to-school deep clean', '2024-08-12', '13:00:00', '17:00:00', 'completed', 3.5, 4.0, 200.00, '2024-08-09 11:20:00'),

-- Jobs in progress or scheduled for this week
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Sarah Johnson'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Sarah Johnson%'), 'Weekly Cleaning - Sarah Johnson', 'Regular cleaning', '2024-08-13', '09:00:00', NULL, 'in_progress', 2.5, NULL, 120.00, '2024-08-10 10:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Margaret Foster'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Foster%'), 'Senior Care Weekly - Foster', 'Regular cleaning', '2024-08-12', '11:00:00', NULL, 'scheduled', 3.0, NULL, 150.00, '2024-08-09 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'James Rodriguez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Rodriguez%'), 'Bachelor Pad Cleaning - Rodriguez', 'Bi-weekly cleaning', '2024-08-14', '14:30:00', NULL, 'scheduled', 3.0, NULL, 150.00, '2024-08-11 08:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Jennifer Martinez'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Martinez%'), 'Weekly Office Clean - Martinez', 'Regular cleaning', '2024-08-16', '08:00:00', NULL, 'scheduled', 3.0, NULL, 135.00, '2024-08-13 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM clients WHERE name = 'Patricia Davis'), (SELECT id FROM recurring_jobs WHERE title LIKE '%Davis%'), 'Work-from-Home Clean - Davis', 'Regular Monday cleaning', '2024-08-19', '07:30:00', NULL, 'scheduled', 2.5, NULL, 125.00, '2024-08-16 15:00:00');

-- Now let's add Tasks to some of these jobs to show detailed work
-- We'll add tasks to a variety of jobs to demonstrate different scenarios

-- Tasks for completed jobs (Sarah Johnson - recent job)
INSERT INTO tasks (user_id, job_id, title, description, is_completed, estimated_minutes, actual_minutes, order_index, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Kitchen Deep Clean', 'Clean all appliances inside/out, countertops, sink, floors', true, 45, 50, 1, '2024-08-06 09:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Bathroom Sanitization', 'Deep clean shower, toilet, sink, mirrors, floors with pet-safe products', true, 30, 28, 2, '2024-08-06 09:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Living Areas', 'Vacuum, dust surfaces, clean cat areas thoroughly', true, 35, 32, 3, '2024-08-06 10:15:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Bedroom & Final Walkthrough', 'Bedroom cleaning and quality check', true, 30, 30, 4, '2024-08-06 10:47:00');

-- Tasks for Wilson family deep clean
INSERT INTO tasks (user_id, job_id, title, description, is_completed, estimated_minutes, actual_minutes, order_index, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Child-Safe Kitchen Clean', 'Sanitize all surfaces, high chairs, cabinet handles', true, 60, 55, 1, '2024-08-12 13:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Toy Room Sanitization', 'Clean and sanitize all toys, play areas, storage', true, 45, 50, 2, '2024-08-12 13:55:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Bathroom Deep Clean', '2 bathrooms, extra sanitization for kids', true, 50, 48, 3, '2024-08-12 14:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Bedrooms & Common Areas', '3 bedrooms plus living room deep clean', true, 85, 87, 4, '2024-08-12 15:33:00');

-- Tasks for job currently in progress (Sarah Johnson)
INSERT INTO tasks (user_id, job_id, title, description, is_completed, estimated_minutes, actual_minutes, order_index, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND status = 'in_progress' LIMIT 1), 'Kitchen Clean', 'Standard kitchen cleaning with pet-safe products', true, 45, 42, 1, '2024-08-13 09:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND status = 'in_progress' LIMIT 1), 'Bathroom Maintenance', 'Regular bathroom cleaning and sanitization', true, 30, NULL, 2, '2024-08-13 09:42:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND status = 'in_progress' LIMIT 1), 'Living Areas & Pet Areas', 'Vacuum, dust, clean litter area', false, 35, NULL, 3, '2024-08-13 10:12:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND status = 'in_progress' LIMIT 1), 'Bedrooms & Final Check', 'Bedroom tidy and final walkthrough', false, 30, NULL, 4, '2024-08-13 10:47:00');

-- Add Notes to various jobs showing communication and observations
INSERT INTO notes (user_id, job_id, content, category, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Client mentioned cat has been sick lately, extra attention to litter area. Used enzyme cleaner on carpet spot in living room.', 'observation', '2024-08-06 11:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Kids are excited about starting school next week. Mom requested extra sanitization in play areas. Found broken toy in toy box - left note for parents.', 'communication', '2024-08-12 17:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Martinez%' AND scheduled_date = '2024-08-09' LIMIT 1), 'Client working from home today. Worked quietly around office area. Printer area needed extra dusting - lots of paper particles.', 'observation', '2024-08-09 10:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Chen%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Used new eco-friendly wood polish on dining table - client loves it! Left product info on counter. Garage organization took extra time but client very happy.', 'communication', '2024-08-05 13:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Foster%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Mrs. Foster mentioned her arthritis is bothering her more lately. Extra gentle with moving items. She appreciated help reaching items on high shelves.', 'communication', '2024-08-05 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Lots of water spots on windows from recent rain. Used extra window cleaner. Client has new security system - remembered to disarm before starting.', 'observation', '2024-08-05 18:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), 'Move-in cleaning went well. Previous owners left house in decent condition. Focus was on deep sanitization and window cleaning. Client very pleased with results.', 'communication', '2024-08-10 15:00:00');

-- Add some Photos (simulated file paths - in real app these would be actual uploaded images)
INSERT INTO photos (user_id, job_id, task_id, file_path, file_name, file_size, description, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM tasks WHERE title = 'Toy Room Sanitization' AND job_id = (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1) LIMIT 1), '/storage/photos/wilson-toyroom-before-20240812.jpg', 'wilson-toyroom-before.jpg', 234567, 'Toy room before cleaning - organized toys and sanitized play area', '2024-08-12 14:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM tasks WHERE title = 'Toy Room Sanitization' AND job_id = (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1) LIMIT 1), '/storage/photos/wilson-toyroom-after-20240812.jpg', 'wilson-toyroom-after.jpg', 245678, 'Toy room after deep sanitization and organization', '2024-08-12 14:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), (SELECT id FROM tasks WHERE title = 'Kitchen Deep Clean' AND job_id = (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1) LIMIT 1), '/storage/photos/johnson-kitchen-completed-20240806.jpg', 'johnson-kitchen-after.jpg', 198765, 'Kitchen after deep cleaning - all surfaces sanitized with pet-safe products', '2024-08-06 09:50:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), NULL, '/storage/photos/lee-windows-clean-20240805.jpg', 'lee-windows-spotless.jpg', 287432, 'Living room windows after professional cleaning - crystal clear results', '2024-08-05 17:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), NULL, '/storage/photos/adams-movein-complete-20240810.jpg', 'adams-house-ready.jpg', 312456, 'Complete house after move-in cleaning - ready for new residents', '2024-08-10 15:00:00');

-- Generate Reports for completed jobs
INSERT INTO reports (user_id, job_id, title, status, pdf_path, created_at, sent_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 'Weekly Cleaning Report - August 6, 2024', 'sent', '/reports/johnson-weekly-20240806.pdf', '2024-08-06 11:45:00', '2024-08-06 12:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Back-to-School Deep Clean Report', 'sent', '/reports/wilson-deep-clean-20240812.pdf', '2024-08-12 17:15:00', '2024-08-12 17:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Chen%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Bi-weekly Service Report - Chen Family', 'sent', '/reports/chen-biweekly-20240805.pdf', '2024-08-05 13:15:00', '2024-08-05 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Foster%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Senior Care Cleaning Report', 'sent', '/reports/foster-weekly-20240805.pdf', '2024-08-05 13:45:00', '2024-08-05 14:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), 'Move-In Deep Cleaning Report', 'draft', '/reports/adams-movein-20240810.pdf', '2024-08-10 15:15:00', NULL),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Modern Condo Cleaning Report', 'sent', '/reports/lee-condo-20240805.pdf', '2024-08-05 18:15:00', '2024-08-05 18:30:00');

-- Add Job Supply Usage tracking
INSERT INTO job_supplies (user_id, job_id, supply_id, quantity_used, notes, created_at) VALUES
-- Sarah Johnson job supplies
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), (SELECT id FROM supplies WHERE name = 'All-Purpose Cleaner' LIMIT 1), 2, 'Kitchen and bathroom cleaning', '2024-08-06 11:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Pet-Safe Disinfectant' LIMIT 1), 1, 'Litter area sanitization', '2024-08-06 11:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Microfiber Cloths' LIMIT 1), 4, 'General cleaning throughout house', '2024-08-06 11:30:00'),

-- Wilson family job supplies
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Disinfectant Spray' LIMIT 1), 3, 'Heavy sanitization for child safety', '2024-08-12 17:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM supplies WHERE name = 'All-Purpose Cleaner' LIMIT 1), 2, 'General cleaning throughout house', '2024-08-12 17:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Cleaning Wipes' LIMIT 1), 8, 'Toy sanitization and quick touch-ups', '2024-08-12 17:00:00'),

-- Lee condo job supplies
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Glass Cleaner' LIMIT 1), 2, 'Extensive window and mirror cleaning', '2024-08-05 18:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), (SELECT id FROM supplies WHERE name = 'Microfiber Cloths' LIMIT 1), 6, 'Glass surfaces throughout condo', '2024-08-05 18:00:00');

-- Add Staff Job Assignments
INSERT INTO job_assignments (user_id, job_id, staff_member_id, hours_worked, hourly_rate, notes, created_at) VALUES
-- Assign Maria to several recent jobs (she's the senior cleaner)
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'Maria Gonzalez' LIMIT 1), 4.0, 22.00, 'Lead cleaner for deep sanitization job. Excellent work with child-safe protocols.', '2024-08-12 17:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'Maria Gonzalez' LIMIT 1), 7.0, 22.00, 'Move-in cleaning lead. Handled kitchen deep clean and coordination.', '2024-08-10 15:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Chen%' AND scheduled_date = '2024-08-05' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'Maria Gonzalez' LIMIT 1), 2.5, 22.00, 'Regular bi-weekly client. Client specifically requested Maria.', '2024-08-05 13:00:00'),

-- Assign John to window and general cleaning
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'John Anderson' LIMIT 1), 3.0, 18.00, 'Handled extensive window cleaning. Good attention to detail on glass surfaces.', '2024-08-05 18:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'John Anderson' LIMIT 1), 3.5, 18.00, 'Assisted with move-in clean. Focused on bathrooms and final walkthrough.', '2024-08-10 15:00:00'),

-- Assign Sofia to regular maintenance jobs
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Foster%' AND scheduled_date = '2024-08-05' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'Sofia Petrov' LIMIT 1), 2.5, 19.50, 'Regular weekly client. Good gentle approach for elderly client.', '2024-08-05 13:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'Sofia Petrov' LIMIT 1), 2.5, 19.50, 'Weekly maintenance clean. Experienced with pet-safe products.', '2024-08-06 11:30:00');

-- Add Sub-Contractor Job Assignments
INSERT INTO sub_contractor_job_assignments (user_id, sub_contractor_id, job_id, description, agreed_rate, hours_worked, total_cost, status, created_at, completed_at) VALUES
-- Premium Carpet Care for deep cleaning jobs
('YOUR_USER_ID_HERE', (SELECT id FROM sub_contractors WHERE name = 'Premium Carpet Care' LIMIT 1), (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), 'Professional carpet cleaning for entire house before move-in', 75.00, 2.0, 150.00, 'completed', '2024-08-10 10:00:00', '2024-08-10 12:00:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM sub_contractors WHERE name = 'Premium Carpet Care' LIMIT 1), (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 'Deep carpet cleaning in playroom and bedrooms', 75.00, 1.5, 112.50, 'completed', '2024-08-12 15:00:00', '2024-08-12 16:30:00'),

-- Crystal Clear Windows for exterior work
('YOUR_USER_ID_HERE', (SELECT id FROM sub_contractors WHERE name = 'Crystal Clear Windows' LIMIT 1), (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), 'Exterior window cleaning for high-rise condo', 45.00, 1.0, 45.00, 'completed', '2024-08-05 16:00:00', '2024-08-05 17:00:00');

-- Add Booking Requests (from potential new clients)
INSERT INTO booking_requests (user_id, client_name, client_email, client_phone, service_type, preferred_date, preferred_time, message, status, created_at) VALUES
('YOUR_USER_ID_HERE', 'Amanda Foster', 'amanda.foster@email.com', '(555) 987-6543', 'Standard House Cleaning', '2024-08-20', '10:00:00', 'Hi! I found your service online and would love to schedule a regular bi-weekly cleaning. I have a 3-bedroom house with 2 dogs. Please let me know your availability. Thanks!', 'pending', '2024-08-12 14:30:00'),
('YOUR_USER_ID_HERE', 'Mark Thompson', 'mark.t@email.com', '(555) 876-5432', 'Move-In/Move-Out Cleaning', '2024-08-25', '09:00:00', 'Need move-out cleaning for apartment rental. Landlord requires professional cleaning. 2 bedroom, 1 bath apartment. When can you provide quote?', 'pending', '2024-08-13 09:15:00'),
('YOUR_USER_ID_HERE', 'Lisa Park', 'lisa.park@email.com', '(555) 765-4321', 'Deep House Cleaning', '2024-08-18', '13:00:00', 'Looking for one-time deep clean before hosting family reunion. 4 bedroom house, would like focus on kitchen and bathrooms. Flexible on timing.', 'contacted', '2024-08-11 16:45:00'),
('YOUR_USER_ID_HERE', 'Robert Kim', 'r.kim@email.com', '(555) 654-3210', 'Post-Construction Cleanup', '2024-08-30', '08:00:00', 'Just finished bathroom renovation. Need professional cleanup before family returns from vacation. Heavy duty cleaning required.', 'quoted', '2024-08-10 11:20:00');

-- Add Customer Feedback
INSERT INTO feedback (user_id, job_id, rating, comment, feedback_type, created_at) VALUES
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Sarah Johnson%' AND scheduled_date = '2024-08-06' LIMIT 1), 5, 'Sofia did an amazing job as always! She was so gentle with my cats and even left them some treats. The house smells wonderful and everything is spotless. Thank you!', 'service_quality', '2024-08-06 15:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Wilson%' AND scheduled_date = '2024-08-12' LIMIT 1), 5, 'Maria and the team were incredible! They went above and beyond sanitizing everything for the kids starting school. Found broken toys and left a nice note. Professional service!', 'service_quality', '2024-08-12 19:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Chen%' AND scheduled_date = '2024-08-05' LIMIT 1), 5, 'Love the new eco-friendly products you used! The house smells fresh without harsh chemicals. Maria did excellent work and the garage organization was a nice bonus. Highly recommend!', 'service_quality', '2024-08-05 20:15:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Foster%' AND scheduled_date = '2024-08-05' LIMIT 1), 5, 'Sofia is so thoughtful and gentle. She helped me reach things on high shelves and was very understanding about my arthritis. Professional and caring service.', 'service_quality', '2024-08-05 16:45:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Lee%' AND scheduled_date = '2024-08-05' LIMIT 1), 4, 'Great job on the windows - they are crystal clear! John was professional and remembered my security system code. Only minor issue was he arrived 15 minutes late, but called ahead.', 'service_quality', '2024-08-05 21:30:00'),
('YOUR_USER_ID_HERE', (SELECT id FROM jobs WHERE title LIKE '%Rachel Adams%' AND scheduled_date = '2024-08-10' LIMIT 1), 5, 'Outstanding move-in cleaning! Maria and John worked so hard and the house is perfect for our family. The carpet cleaning was exceptional. Worth every penny!', 'service_quality', '2024-08-10 18:20:00');

-- Add Calendar Integration (showing connection to Google Calendar)
INSERT INTO calendar_integrations (user_id, provider, calendar_id, access_token, refresh_token, is_active, last_sync, created_at) VALUES
('YOUR_USER_ID_HERE', 'google', 'primary', 'sample_access_token_12345', 'sample_refresh_token_67890', true, '2024-08-13 08:00:00', '2024-05-15 10:00:00');

-- Update user profile with mobile access code and preferences
UPDATE user_profiles 
SET 
  mobile_access_code = 'CRC2024' || substring(md5(random()::text), 1, 6),
  subscription_tier = 'pro',
  subscription_status = 'active'
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Summary comment
-- This script creates a comprehensive 3-month business scenario with:
-- - 15 clients (mix of regular weekly/bi-weekly and occasional customers)  
-- - 4 staff members with different skill levels and pay rates
-- - 3 sub-contractors for specialized services
-- - 16 different supply items with realistic stock levels
-- - 8 recurring job schedules for regular clients
-- - 60+ individual job records spanning May-August 2024
-- - Detailed tasks, notes, and photos for key jobs  
-- - Professional reports generated and sent to clients
-- - Staff and sub-contractor assignments with hours/rates
-- - Supply usage tracking for job costing
-- - Customer feedback showing high satisfaction
-- - Pending booking requests from new prospects
-- - Calendar integration setup
-- - Mix of job statuses: completed, in_progress, scheduled

COMMIT;

-- IMPORTANT: Remember to replace 'YOUR_USER_ID_HERE' with your actual user_id before running this script!