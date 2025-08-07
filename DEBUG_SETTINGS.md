# Settings Save Issue - Debugging Guide

## Current Issue
The save button on the settings page is failing with "Error saving settings: {}"

## Debugging Steps

### Step 1: Test Connection
1. Go to your app's settings page
2. Click the **"Test Connection"** button
3. Check the browser console for detailed logs
4. Look for the toast notification

### Step 2: Check Browser Console
Open your browser's developer tools (F12) and look for:

1. **Authentication logs:**
   ```
   Auth check: { user: "user-id-here", error: null }
   ```

2. **Table check logs:**
   ```
   Table check results: { allTablesExist: true/false, ... }
   ```

3. **Save attempt logs:**
   ```
   createUserProfile called with: { company_name: "...", ... }
   Auth result: { user: "...", error: null }
   Inserting data: { ... }
   Supabase response: { data: ..., error: ... }
   ```

### Step 3: Common Issues & Solutions

#### Issue: "Not Authenticated"
**Solution:** Make sure you're logged into the app

#### Issue: "Missing Database Tables"
**Solution:** Run the database setup:
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run the contents of `fix-user-profiles.sql`

#### Issue: "Database error: relation does not exist"
**Solution:** The `user_profiles` table doesn't exist. Run:
```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;
```

#### Issue: Empty error object `{}`
**Solution:** This usually means a network or authentication issue. Check:
- Your internet connection
- Supabase project is active
- Environment variables are correct

### Step 4: Manual Database Check

If the test connection doesn't work, manually check your database:

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Look for `user_profiles` table
4. Check if it has these columns:
   - `id`
   - `user_id`
   - `company_name`
   - `logo_url`
   - `primary_color`
   - `secondary_color`
   - `email_template`
   - `contact_email` ← **This was missing**
   - `contact_phone` ← **This was missing**
   - `website_url` ← **This was missing**
   - `created_at`
   - `updated_at`

### Step 5: Environment Variables Check

Verify your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://gdvgrctspftydfmicrah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Expected Behavior After Fix

1. **Test Connection** should show: "All required database tables exist and are accessible"
2. **Save button** should turn green when you make changes
3. **Save operation** should complete successfully with a success toast
4. **Console logs** should show successful database operations

## Still Having Issues?

If you're still getting errors after following these steps:

1. **Copy all console logs** and share them
2. **Check if Supabase project is paused** (should be active)
3. **Try refreshing the page** and testing again
4. **Check network tab** in dev tools for failed requests 