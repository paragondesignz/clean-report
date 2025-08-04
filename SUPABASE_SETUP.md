# Supabase Setup Guide for Clean Report

This guide will walk you through setting up your Supabase project for the Clean Report application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `clean-report` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project directory, create or update `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Resend Email Configuration (optional for now)
   RESEND_API_KEY=your_resend_api_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-setup.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create:
- All required tables (clients, jobs, tasks, photos, etc.)
- Row Level Security (RLS) policies
- Database indexes for performance
- Storage bucket for photo uploads
- Automatic timestamp triggers

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. Click "Save"

## Step 6: Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password

## Step 7: Configure Storage (Optional)

1. Go to **Storage** → **Policies**
2. Verify that the storage policies were created correctly
3. The `photos` bucket should be public for client access

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000`

3. Try to sign up with a new account

4. Verify that:
   - You can create an account
   - You're redirected to the dashboard
   - You can access all the features

## Troubleshooting

### Common Issues

**"Invalid API key" error**
- Double-check your environment variables
- Make sure you're using the correct keys from the API settings

**"Table doesn't exist" error**
- Run the SQL setup script again
- Check that all tables were created in the **Table Editor**

**Authentication redirect issues**
- Verify your redirect URLs in Authentication settings
- Make sure your site URL is correct

**Storage upload failures**
- Check that the `photos` bucket exists
- Verify storage policies are in place

### Getting Help

If you encounter issues:

1. Check the Supabase logs in **Logs** → **Database**
2. Check the browser console for JavaScript errors
3. Verify your environment variables are loaded correctly
4. Ensure all SQL scripts ran successfully

## Next Steps

Once your Supabase setup is complete:

1. **Add Real Data**: Replace mock data with actual Supabase queries
2. **Configure Email**: Set up Resend for email functionality
3. **Deploy**: Deploy to Vercel or your preferred platform
4. **Customize**: Update branding and email templates

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your service role key secure
- Regularly rotate your API keys
- Monitor your Supabase usage and costs

## Production Deployment

When deploying to production:

1. Update your environment variables with production URLs
2. Add your production domain to Supabase redirect URLs
3. Configure custom domains if needed
4. Set up monitoring and alerts
5. Configure backup strategies

---

Your Supabase setup is now complete! The Clean Report application should be fully functional with all features working. 