# Clean Report - Professional Cleaning Management

A modern SaaS web application for cleaning companies to manage client jobs, track completed tasks with photos, and generate branded follow-up reports.

## Features

### Core Features
- **Client Management**: Add, edit, and manage client profiles
- **Job Scheduling**: Schedule and track cleaning jobs with detailed task lists
- **Photo Uploads**: Attach photos to specific tasks for proof of completion
- **Task Checklists**: Create and manage task lists for each job
- **Report Generation**: Generate professional branded reports with photos
- **Email Integration**: Automatically send reports to clients via email
- **Mobile Responsive**: Optimized for on-site job use
- **Branding Customization**: Customize company colors, logo, and email templates

### Add-On Features
- **Recurring Job Scheduling**: Automatically repeat jobs on daily, weekly, bi-weekly, or monthly schedules
- **Client Self-Booking Portal**: Allow clients to book appointments based on real-time availability
- **Service Recommendation Prompts**: Automated suggestions for additional services based on task history
- **Client Feedback Collection**: Collect post-job satisfaction ratings and comments
- **Cleaner Assignment & Tracking**: Assign jobs to staff and monitor performance
- **Supply Usage Logging**: Track cleaning supplies used per job with low stock alerts
- **Branded Client Portal**: Secure client login to view job history and reports

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend API
- **Payments**: Stripe (planned)
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clean-report
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Resend Email Configuration
   RESEND_API_KEY=your_resend_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Google Maps Integration (Optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Core Tables
   CREATE TABLE clients (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT NOT NULL,
     address TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE jobs (
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

   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     is_completed BOOLEAN DEFAULT FALSE,
     order_index INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE photos (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
     file_path TEXT NOT NULL,
     file_name TEXT NOT NULL,
     file_size INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE notes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE reports (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     report_url TEXT NOT NULL,
     email_sent BOOLEAN DEFAULT FALSE,
     sent_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE user_profiles (
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
   CREATE TABLE recurring_jobs (
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

   CREATE TABLE feedback (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
     comment TEXT,
     feedback_token TEXT UNIQUE NOT NULL,
     is_submitted BOOLEAN DEFAULT FALSE,
     submitted_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE supplies (
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

   CREATE TABLE job_supplies (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
     quantity_used INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE staff_members (
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

   CREATE TABLE job_assignments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
     assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE booking_requests (
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

   CREATE TABLE calendar_integrations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     calendar_url TEXT NOT NULL,
     calendar_type TEXT DEFAULT 'google' CHECK (calendar_type IN ('google', 'outlook', 'ical')),
     is_active BOOLEAN DEFAULT TRUE,
     last_sync TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE client_portal_users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
     email TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     is_active BOOLEAN DEFAULT TRUE,
     last_login TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE service_recommendations (
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

   -- Enable RLS on all tables
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

   -- Create RLS policies (example for clients table)
   CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

   -- Repeat similar policies for other tables...
   ```

5. **Set up Google Maps Integration (Optional)**
   
   To enable map functionality in job details and location display:
   
   a. **Get a Google Maps API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
     - Directions API
   - Create credentials > API Key
   - Restrict the key to your domain for security
   
   b. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
   
   **Note**: Without this API key, maps will show an error message instead of loading.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
clean-report/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── clients/        # Client management
│   │   │   ├── jobs/           # Job management
│   │   │   ├── recurring/      # Recurring jobs
│   │   │   ├── reports/        # Reports management
│   │   │   ├── supplies/       # Supplies management
│   │   │   └── settings/       # Settings & branding
│   │   ├── booking/            # Client self-booking portal
│   │   ├── feedback/           # Client feedback collection
│   │   ├── login/              # Authentication pages
│   │   └── signup/
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json
```

## Key Features Implementation

### Core Features
- **Authentication**: Supabase Auth integration with protected routes
- **Client Management**: CRUD operations for clients with contact information
- **Job Management**: Job scheduling with status tracking and task lists
- **Report Generation**: Professional branded reports with photo integration
- **Mobile Responsive Design**: Optimized for on-site job use

### Add-On Features

#### 1. Recurring Job Scheduling
- **Frequency Options**: Daily, weekly, bi-weekly, monthly
- **End Date Support**: Optional end dates or indefinite repetition
- **Automatic Job Generation**: System creates jobs based on schedule
- **Active/Inactive Toggle**: Enable/disable recurring jobs

#### 2. Client Self-Booking Portal
- **Public Booking Form**: Accessible via unique booking tokens
- **Real-time Availability**: Integration with Google Calendar iCal feeds
- **Service Selection**: Multiple cleaning service types
- **Auto-confirmation**: Optional automatic booking confirmation

#### 3. Service Recommendation Prompts
- **Task History Tracking**: Monitor task completion frequency
- **Automated Alerts**: Trigger when tasks are overdue
- **Upsell Suggestions**: Pre-written templates for service recommendations
- **Client-specific Recommendations**: Personalized based on client history

#### 4. Client Feedback Collection
- **Secure Feedback Links**: Tokenized URLs for feedback submission
- **Star Rating System**: 1-5 star ratings with optional comments
- **Low Rating Alerts**: Automatic notifications for poor feedback
- **Feedback Analytics**: Track satisfaction over time

#### 5. Cleaner Assignment & Tracking
- **Staff Management**: Add and manage cleaning staff
- **Job Assignment**: Assign specific cleaners to jobs
- **Performance Tracking**: Monitor completion rates and feedback
- **Role-based Access**: Admin and cleaner user roles

#### 6. Supply Usage Logging
- **Inventory Management**: Track cleaning supplies
- **Low Stock Alerts**: Automatic notifications when supplies run low
- **Usage Tracking**: Log supplies used per job
- **Stock Management**: Add/remove supplies with real-time updates

#### 7. Branded Client Portal
- **Secure Client Login**: Magic link or password authentication
- **Job History**: View past cleaning jobs and reports
- **Photo Gallery**: Browse cleaning photos from past jobs
- **Booking Integration**: Direct access to self-booking system

## API Endpoints

### Core Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `POST /api/reports/generate` - Generate report

### Add-On Endpoints
- `POST /api/recurring-jobs` - Create recurring job
- `GET /api/booking/[token]` - Get booking form
- `POST /api/booking` - Submit booking request
- `POST /api/feedback/[token]` - Submit feedback
- `GET /api/supplies` - List supplies
- `POST /api/supplies/usage` - Log supply usage

## Troubleshooting

### Common Issues

#### Google Maps Not Loading
If you see a spinner or error message instead of maps:

1. **Check API Key**: Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your `.env.local` file
2. **Verify API Key**: Make sure the API key is valid and not restricted incorrectly
3. **Enable APIs**: Ensure the following APIs are enabled in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. **Domain Restrictions**: If you've restricted the API key, make sure your domain is included

#### Database Connection Issues
- Verify your Supabase URL and API keys are correct
- Check that all required tables are created
- Ensure Row Level Security policies are properly configured

#### Email Not Sending
- Verify your Resend API key is correct
- Check that the email domain is verified in Resend
- Ensure the `NEXT_PUBLIC_APP_URL` is set correctly

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@cleanreport.app or create an issue in the repository.

## Roadmap

### Phase 2 Features
- [ ] PDF report generation
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Stripe payment integration
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

### Phase 3 Features
- [ ] AI-powered task recommendations
- [ ] Automated scheduling optimization
- [ ] Integration with accounting software
- [ ] Advanced reporting and analytics
- [ ] White-label solutions
- [ ] Multi-tenant architecture
