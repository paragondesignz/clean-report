# Sub Contractors Setup Guide

## Database Setup

The subcontractors feature requires two new database tables. Follow these steps to set them up:

### 1. Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### 2. Run the Complete Database Setup
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `complete-database-setup.sql`
4. Click **Run** to execute the script

**Note**: This script sets up the entire database including all core tables (clients, jobs, etc.) and the subcontractors tables. If you already have some tables, the script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data.

### 3. Verify Tables Created
After running the script, you should see:
- `sub_contractors` table
- `sub_contractor_job_assignments` table
- Associated indexes and policies

## Testing the Feature

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Log In
Make sure you're logged in to the application before accessing the subcontractors page.

### 3. Access the Page
Navigate to `/sub-contractors` in your application.

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**
   - Make sure you're logged in
   - Check that your Supabase environment variables are correct

2. **"Database tables not set up" Error**
   - Run the SQL script in Supabase as described above
   - Check that the tables were created successfully

3. **"Network Error"**
   - Check your internet connection
   - Verify the development server is running

4. **Empty Page**
   - This is normal if no subcontractors have been added yet
   - Use the "Add Sub Contractor" button to create your first one

### Debug Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab

2. **Test API Endpoints**
   - Try accessing `/api/sub-contractors/debug` to test basic API functionality
   - Check the Network tab for API request details

3. **Verify Environment Variables**
   Make sure your `.env.local` file contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Features Available

Once set up, you can:
- ✅ Add new subcontractors
- ✅ Edit existing subcontractors
- ✅ Delete subcontractors
- ✅ View subcontractor statistics
- ✅ Track job assignments
- ✅ Manage specialties and hourly rates

## Next Steps

After setting up the database tables, the subcontractors feature will be fully functional. You can then:
1. Add your first subcontractor
2. Assign jobs to subcontractors
3. Track their progress and performance
