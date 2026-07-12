# Supabase Setup Guide

Follow these steps to connect the DLPP Audit & Compliance System to Supabase.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: DLPP Audit System
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
4. Click "Create new project" and wait 2-3 minutes

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

## Step 3: Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Option B: Manual SQL Execution

1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and click "Run"
6. Repeat for `supabase/migrations/002_rls_policies.sql`

## Step 5: Create Storage Buckets

1. In Supabase dashboard, go to "Storage"
2. Click "Create a new bucket"
3. Create these buckets:
   - **Name**: `compliance-evidence`
   - **Public**: No (Private)
   - Click "Create bucket"
4. Repeat for `compliance-reports` bucket

## Step 6: Set Up Authentication

1. Go to "Authentication" > "Providers"
2. Enable "Email" provider
3. (Optional) Enable other providers like Google, Microsoft, etc.
4. Go to "Authentication" > "URL Configuration"
5. Add your site URL: `http://localhost:3000` (for development)

## Step 7: Create Initial Users

1. Go to "Authentication" > "Users"
2. Click "Add user"
3. Create users with emails
4. After creating users, go to "SQL Editor" and run:

```sql
-- Insert people records for your users
INSERT INTO people (user_id, full_name, email, role, org_unit_id, active)
VALUES
  ('USER_ID_FROM_AUTH', 'Admin User', 'admin@dlpp.org', 'Audit Admin', (SELECT id FROM org_units WHERE code = 'CORP'), true),
  ('USER_ID_FROM_AUTH_2', 'Manager User', 'manager@dlpp.org', 'Audit Manager', (SELECT id FROM org_units WHERE code = 'CORP'), true);
```

Replace `USER_ID_FROM_AUTH` with the actual UUID from the auth.users table.

## Step 8: Test the Connection

1. Restart your dev server:
   ```bash
   bun run dev
   ```
2. Open http://localhost:3000
3. Check browser console for any connection errors
4. Try creating a test engagement or finding

## Step 9: Verify RLS Policies

1. Go to "Authentication" and sign in as one of your test users
2. Try accessing different pages
3. Verify you can only see data you should have access to
4. Test creating, editing, and deleting records

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure you copied the `anon` key, not the `service_role` key
- Restart your dev server after changing environment variables

### "Row Level Security" errors
- Make sure you're signed in
- Check that your user has a corresponding record in the `people` table
- Verify RLS policies are enabled on all tables

### Connection timeout
- Check your internet connection
- Verify the Supabase project URL is correct
- Try accessing the Supabase dashboard directly

## Next Steps

After successful setup:
1. ✅ Populate reference data (org units, obligations, controls)
2. ✅ Create more users and assign roles
3. ✅ Test all CRUD operations
4. ✅ Set up email notifications (optional)
5. ✅ Configure storage policies for file uploads
6. ✅ Deploy to production

## Production Deployment

When deploying to production:
1. Create a new Supabase project for production (don't use the same one!)
2. Run migrations on production database
3. Update environment variables in your deployment platform (Netlify/Vercel)
4. Add production URL to Supabase Authentication > URL Configuration
5. Enable RLS policies and test thoroughly before going live
