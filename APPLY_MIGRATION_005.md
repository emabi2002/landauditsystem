# Apply Migration 005: Central Risk Event Repository

## Prerequisites

Before applying this migration, ensure you have:
1. Applied Migration 004 (Risk Register Integration)
2. Access to your Supabase project SQL Editor

## Quick Apply

Go to Supabase SQL Editor and run the file: `supabase/migrations/005_central_risk_event_repository.sql`

Or run it in 3 parts as shown below.

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Verify Prerequisites

Run this query first to check Migration 004 was applied:

```sql
SELECT COUNT(*) as risk_count FROM audit_risk_register;
SELECT COUNT(*) as division_count FROM audit_divisions;
```

If these tables don't exist, apply Migration 004 first.

### Step 3: Apply the Full Migration

Copy the contents of `supabase/migrations/005_central_risk_event_repository.sql` and paste into SQL Editor, then click Run.

### Step 4: Verify Success

Run this verification query:

```sql
SELECT 
    'audit_categories' AS table_name, COUNT(*) AS row_count FROM audit_categories
UNION ALL SELECT 'audit_risk_events', COUNT(*) FROM audit_risk_events
UNION ALL SELECT 'audit_tasks', COUNT(*) FROM audit_tasks;
```

Expected: audit_categories = 7 rows, others = 0 rows

## Tables Created

| Table | Purpose |
|-------|---------|
| audit_categories | 7 audit types |
| audit_risk_events | Central repository |
| audit_risk_event_risks | Event-to-risk links |
| audit_risk_event_documents | Attachments |
| audit_risk_event_milestones | Timeline |
| audit_risk_event_log | Audit trail |
| audit_information_requests | Data requests |
| audit_tasks | Task management |

## Next Steps

1. Navigate to `/risk-events` in your application
2. Create a test Risk Event
3. Test the approval workflow
