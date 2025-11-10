# Supabase Setup Instructions

This guide will help you set up Supabase for your portfolio website.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: Your project name
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Your Website

1. Open `config/supabase-config.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL',     // Replace with your Project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY'      // Replace with your anon key
};
```

Example:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `sql/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" messages

This will create:
- `projects` table - for storing project information
- `services` table - for storing service information
- `about_content` table - for storing about page content

## Step 5: Verify Setup

1. Open your website in a browser
2. Go to `admin-login.html`
3. Login with your admin credentials
4. Try adding a project or service
5. Check your Supabase dashboard → **Table Editor** to see if data is being saved

## Troubleshooting

### Data not saving?

1. Check browser console (F12) for errors
2. Verify your Supabase credentials in `config/supabase-config.js`
3. Make sure you ran the SQL schema in Supabase SQL Editor
4. Check Supabase dashboard → **Table Editor** to see if tables exist

### Getting CORS errors?

- Supabase automatically handles CORS for public API access
- Make sure you're using the **anon key**, not the service role key
- Verify your Supabase project is active

### Tables not created?

1. Go to Supabase dashboard → **SQL Editor**
2. Check if there are any errors in previous queries
3. Try running the schema.sql file again
4. Make sure you have the correct permissions

## Security Notes

⚠️ **Important**: The current setup uses public read/write access for simplicity. For production:

1. Implement proper authentication
2. Use Row Level Security (RLS) policies
3. Consider using Supabase Auth for admin authentication
4. Use service role key only on server-side (never expose it)

## Data Migration

If you have existing data in localStorage:

1. Go to Admin Panel → Settings tab
2. Click "Export All Data"
3. After setting up Supabase, you can import this data back
4. Or manually add data through the admin panel

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check browser console for detailed error messages

---

**Note**: The website will automatically fall back to localStorage if Supabase is not configured, so your existing functionality will continue to work.

