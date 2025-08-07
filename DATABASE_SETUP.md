# Database Setup Guide

## The Issue
Your app is trying to save settings but the database tables don't exist yet. You need to create the tables in your Supabase project.

## Quick Fix

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: `gdvgrctspftydfmicrah`

### Step 2: Open SQL Editor
1. In your Supabase project dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### Step 3: Run the Database Setup
1. Copy the entire contents of the `supabase-setup.sql` file
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the SQL

### Step 4: Verify Tables Created
After running the SQL, you should see these tables in the **"Table Editor"**:
- `clients`
- `jobs`
- `tasks`
- `photos`
- `notes`
- `reports`
- `user_profiles` ← **This is the one you need for settings**
- `calendar_integrations`
- `recurring_jobs`
- `supplies`
- `booking_requests`
- `feedback`

## Alternative: Use the Setup Script

If you prefer to use the automated script:

```bash
# Make sure you're in the project directory
cd clean-report

# Run the setup script
node scripts/setup-database.js
```

## Test the Fix

After setting up the database:

1. Go to your app's settings page
2. Click **"Test Connection"** button
3. You should see "Connection Test Successful"
4. Try saving some settings - the save button should work now

## Common Issues

### "relation does not exist" error
- This means the tables weren't created properly
- Go back to Step 2 and make sure the SQL ran successfully

### "permission denied" error
- Check that your environment variables are correct
- Make sure you're logged into the app

### "network error"
- Check your internet connection
- Verify your Supabase project is active

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify your `.env.local` file has the correct Supabase credentials
3. Make sure your Supabase project is not paused 