# Database Setup Instructions

## Your Supabase Project
- **URL**: https://yvnkyjnwvylrweyzvibs.supabase.co
- **Status**: Connected ✅

## Apply Database Migrations

### Method 1: Using Supabase SQL Editor (Recommended - 2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs
   - Sign in if needed

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy Migration SQL**
   - In Same, open the file: `landauditsystem/supabase/combined_migration.sql`
   - Copy ALL the contents (1,442 lines)

4. **Run Migration**
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait 10-20 seconds for completion
   - You should see "Success. No rows returned"

5. **Verify Setup**
   - Click "Table Editor" in left sidebar
   - You should see 25+ tables including:
     - org_units
     - people
     - engagements
     - findings
     - recommendations
     - risk_profiles
     - And many more...

### Method 2: Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref yvnkyjnwvylrweyzvibs

# Push migrations
supabase db push
```

## After Migration

1. **Create Storage Buckets** (in Supabase Dashboard > Storage):
   - Create bucket: `compliance-evidence` (Private)
   - Create bucket: `compliance-reports` (Private)

2. **Enable Email Authentication** (in Authentication > Providers):
   - Enable "Email" provider
   - Add Site URL: `http://localhost:3000`

3. **Regenerate TypeScript Types** (Optional - fixes type errors):
   ```bash
   supabase gen types typescript --project-id yvnkyjnwvylrweyzvibs > src/lib/database.types.ts
   ```

## Next Steps

After migrations are applied:
- The app will connect to the database
- You can create your first user
- All 13 modules will be functional
