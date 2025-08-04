# Quick Setup Instructions

## 1. Create Environment File

Create a `.env.local` file in your project root with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gdvgrctspftydfmicrah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkdmdyY3RzcGZ0eWRmbWljcmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDgyMjYsImV4cCI6MjA2OTg4NDIyNn0.jwvkXle2HS3RJBTMMtAi-qCnDxk1CZwDLXKtNBW4esI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkdmdyY3RzcGZ0eWRmbWljcmFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwODIyNiwiZXhwIjoyMDY5ODg0MjI2fQ.HW_H3d18o0EFy2zsFQu5FzboAdeRUEheMiRlKDO81-E

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 2. Set Up Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/gdvgrctspftydfmicrah
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of the `supabase-setup.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the script

## 3. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3001`
3. Under **Redirect URLs**, add:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3001/dashboard`
4. Click **Save**

## 4. Restart Your Development Server

Since you've added environment variables, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 5. Test the Application

1. Go to `http://localhost:3001`
2. Try to sign up with a new account
3. You should be redirected to the dashboard
4. All features should now work with real Supabase data

## What's Been Set Up

✅ **Database Tables**: All 18 tables created with proper relationships
✅ **Security**: Row Level Security (RLS) policies for data protection
✅ **Storage**: Photo upload bucket configured
✅ **Authentication**: User registration and login system
✅ **Performance**: Database indexes for fast queries

## Next Steps

Once the setup is complete:
1. Create your first account
2. Add some test clients and jobs
3. Test the recurring jobs feature
4. Try the supplies management
5. Test the booking and feedback portals

Your Clean Report application is now fully connected to Supabase! 🎉 