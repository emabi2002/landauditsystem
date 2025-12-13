# Shared Database Setup Guide

## Using the Same Supabase Database for Both Systems

This guide shows you how to use the **same Supabase database** for both the Legal Case Management System and the DLPP Audit & Compliance System.

### ✅ Benefits of Shared Database

1. **Direct Integration** - Recommendations link directly to legal cases
2. **Shared Users** - One user account for both systems
3. **Cost Efficient** - Single Supabase project
4. **Data Consistency** - No data synchronization needed
5. **Simplified Management** - One database to maintain

---

## Prerequisites

You should have already set up the Legal Case Management System with Supabase.

**What You Need:**
- Supabase project URL from legal system
- Supabase anon key from legal system
- Access to the Supabase SQL Editor

---

## Step-by-Step Setup

### Step 1: Use Same Environment Variables (1 min)

Copy the Supabase credentials from your Legal Case System to this Audit System.

Edit `.env.local` in the audit system:

```env
# Use THE SAME credentials as your Legal Case System
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-legal-system
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

✅ **That's it for configuration!** Both systems now use the same database.

---

### Step 2: Run Audit System Migrations (3 min)

The migration files are **safe to run** even if tables already exist from the legal system.

**In Supabase Dashboard → SQL Editor:**

1. **Create a new query**

2. **Copy and paste** the content from:
   `supabase/migrations/001_initial_schema.sql`

3. **Click "Run"** - This will:
   - ✅ Create audit tables (engagements, findings, recommendations, etc.)
   - ✅ Keep existing legal tables (legal_cases, documents, etc.)
   - ✅ Update `people` table to support both system roles
   - ✅ Add sample data only if tables are empty

4. **Create another new query**

5. **Copy and paste** the content from:
   `supabase/migrations/002_rls_policies.sql`

6. **Click "Run"** - This will:
   - ✅ Add RLS policies for audit tables
   - ✅ Keep existing RLS policies for legal tables
   - ✅ Allow users to access data based on their role

---

### Step 3: Verify Integration (2 min)

**Check that both systems coexist:**

```sql
-- Check legal system tables still exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'legal%';

-- Check audit system tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('engagements', 'findings', 'recommendations', 'action_plans');

-- Check people table supports both roles
SELECT DISTINCT role FROM people;
```

---

### Step 4: Update User Roles (Optional - 2 min)

If you want existing legal system users to also use the audit system:

```sql
-- View current users
SELECT id, full_name, email, role FROM people;

-- Update a user to have audit access (example)
UPDATE people
SET role = 'Audit Manager'  -- or 'Audit Admin', 'Auditor', etc.
WHERE email = 'user@example.com';

-- Or create new audit-specific users
INSERT INTO people (user_id, full_name, email, role, org_unit_id, active)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'auditor@example.com'),
   'Internal Auditor',
   'auditor@example.com',
   'Auditor',
   (SELECT id FROM org_units WHERE code = 'CORP'),
   true);
```

**Supported Roles:**
- Legal System: `Admin`, `Case Manager`, `Lawyer`, `Paralegal`, `Client`, `Judge`, `Witness`
- Audit System: `Audit Admin`, `Audit Manager`, `Auditor`, `Action Owner`, `Read-Only`, `System Integrator`

---

### Step 5: Test the Integration (3 min)

**Test Legal → Audit Link:**

1. Start the audit system:
   ```bash
   cd dlpp-audit-compliance
   bun dev
   ```

2. Visit http://localhost:3000

3. Go to **Recommendations** page

4. The `legal_case_id` field can now reference actual legal cases!

**Test in SQL:**

```sql
-- Create a test recommendation linked to a legal case
INSERT INTO recommendations (
  finding_id,
  recommendation_text,
  priority,
  status,
  legal_case_linked,
  legal_case_id  -- This links to legal_cases table!
) VALUES (
  (SELECT id FROM findings LIMIT 1),
  'Test recommendation linked to legal case',
  'High',
  'Draft',
  true,
  (SELECT id FROM legal_cases LIMIT 1)  -- Links to actual legal case!
);

-- View recommendations with their linked legal cases
SELECT
  r.recommendation_text,
  r.legal_case_id,
  lc.case_number,  -- From legal_cases table
  lc.title         -- From legal_cases table
FROM recommendations r
LEFT JOIN legal_cases lc ON r.legal_case_id = lc.id
WHERE r.legal_case_linked = true;
```

---

## Database Structure

After migration, your shared database will have:

### Legal System Tables
- `legal_cases`
- `documents`
- `parties`
- `hearings`
- `tasks`
- (all existing legal tables)

### Audit System Tables
- `engagements`
- `findings`
- `recommendations` ← **Links to legal_cases!**
- `action_plans`
- `workpapers`
- `evidence`
- `obligations`
- `controls`

### Shared Tables
- `people` - Supports both legal and audit roles
- `org_units` - Used by both systems
- `events` - Audit log for both systems
- `notifications` - Notifications for both systems

---

## Integration Points

### 1. Recommendations → Legal Cases

Recommendations can be linked to legal cases:

```typescript
// In your audit system code
const { data } = await supabase
  .from('recommendations')
  .update({
    legal_case_linked: true,
    legal_case_id: 'legal-case-uuid-here'
  })
  .eq('id', recommendationId)
```

### 2. Shared Users

Users can access both systems with one account:

```sql
-- A user can have legal access
UPDATE people SET role = 'Case Manager' WHERE email = 'user@example.com';

-- The same user can also have audit access by using multiple roles
-- (You might want to add a roles array column for this)
```

### 3. Cross-System Queries

Query data from both systems:

```sql
-- Find all recommendations related to a specific legal case
SELECT
  r.recommendation_text,
  r.priority,
  r.status,
  f.title as finding_title,
  lc.case_number,
  lc.title as case_title
FROM recommendations r
JOIN findings f ON r.finding_id = f.id
LEFT JOIN legal_cases lc ON r.legal_case_id = lc.id
WHERE lc.case_number = 'CASE-2024-001';
```

---

## API Integration

The audit system's API can now return recommendations **with** legal case information:

```bash
# Get published recommendations with legal case details
curl -X GET \
  'https://your-project.supabase.co/rest/v1/published_recommendations_view?legal_case_linked=eq.true' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
```

---

## Deployment

When deploying to production:

1. **Use the same Supabase project** for both systems
2. **Deploy both apps** to different URLs:
   - Legal System: `https://legal.yourdomain.com`
   - Audit System: `https://audit.yourdomain.com`
3. **Both use same environment variables** (same Supabase URL and key)

### Netlify Deployment for Both Systems

```bash
# Deploy Legal System
cd legal-case-management
# Add same Supabase credentials to Netlify
# Deploy to legal.yourdomain.com

# Deploy Audit System
cd dlpp-audit-compliance
# Add SAME Supabase credentials to Netlify
# Deploy to audit.yourdomain.com
```

---

## Security Considerations

### RLS Policies

Both systems have their own RLS policies:
- Legal users can only see legal cases they're involved in
- Auditors can only see audit engagements they're assigned to
- Recommendations are visible to both when linked

### Shared Data

Be careful with:
- `org_units` - Both systems can modify
- `people` - Both systems can modify
- `events` - Both systems log here
- `notifications` - Both systems send here

### Best Practice

Create separate service accounts for each system:

```sql
-- Audit system service account
INSERT INTO people (full_name, email, role, active)
VALUES ('Audit System API', 'audit-api@system.internal', 'System Integrator', true);

-- Legal system service account
INSERT INTO people (full_name, email, role, active)
VALUES ('Legal System API', 'legal-api@system.internal', 'System Integrator', true);
```

---

## Troubleshooting

### "Table already exists" error

✅ **This is fine!** The migrations use `CREATE TABLE IF NOT EXISTS`, so they won't fail.

### "Constraint already exists" error

✅ **This is fine!** The migrations check for existing constraints before creating.

### RLS blocking access

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('recommendations', 'legal_cases', 'people');

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
-- Test your queries
-- Re-enable when done
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
```

### Users can't access audit system

```sql
-- Check user's role
SELECT id, email, role FROM people WHERE email = 'user@example.com';

-- Update to audit role
UPDATE people
SET role = 'Auditor'  -- or appropriate audit role
WHERE email = 'user@example.com';
```

---

## Rollback (If Needed)

If you need to remove audit tables:

```sql
-- Drop audit-specific tables (keeps legal tables intact)
DROP TABLE IF EXISTS action_evidence CASCADE;
DROP TABLE IF EXISTS action_plans CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS finding_evidence CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS workpapers CASCADE;
DROP TABLE IF EXISTS engagement_team CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS obligations CASCADE;

-- Drop audit functions
DROP FUNCTION IF EXISTS publish_recommendation CASCADE;
DROP FUNCTION IF EXISTS update_action_progress CASCADE;

-- Drop audit view
DROP VIEW IF EXISTS published_recommendations_view CASCADE;

-- Note: This keeps legal system tables and shared tables intact!
```

---

## Summary

✅ **Both systems now share one Supabase database**
✅ **Recommendations can link directly to legal cases**
✅ **Users can access both systems with one account**
✅ **Cost efficient - single Supabase project**
✅ **Easy to maintain - one database**

**Next Steps:**
1. Test creating recommendations
2. Link a recommendation to a legal case
3. Query cross-system data
4. Deploy both apps to production

---

## Need Help?

- Check **SUPABASE_SETUP.md** for general database help
- Check **DEPLOYMENT.md** for deployment instructions
- See **QUICKSTART.md** for quick setup
- Open GitHub issue for specific problems

**Database Status:** ✅ Shared between Legal and Audit systems
**Integration:** ✅ Recommendations can link to Legal Cases
