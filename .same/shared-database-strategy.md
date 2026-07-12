# Shared Database Strategy

## ⚠️ CRITICAL CONSTRAINT

**This Supabase database is SHARED with other departments/sub-units!**

This means:
- ❌ NEVER drop entire schema (`DROP SCHEMA public CASCADE`)
- ❌ NEVER drop tables without knowing their ownership
- ❌ NEVER use `DROP TABLE ... CASCADE` on unknown tables
- ✅ Only create/modify audit-specific tables
- ✅ Be careful with RLS policies
- ✅ Coordinate with other departments on shared tables

## Current Shared Tables (Assumed)

Based on code, these tables are likely shared:
- **org_units** - Organization hierarchy (shared by all departments)
- **people** - Staff directory (shared by all departments)
- **notifications** - User notifications (may be shared)

## Audit-Specific Tables (Safe to manage)

These are ONLY for the audit system:
- engagements
- engagement_team
- workpapers
- evidence
- findings
- recommendations
- action_plans
- obligations
- controls
- risk_profiles
- risk_profile_items
- psap_standards
- psap_rating_scales
- psap_assessments
- psap_assessment_scores
- strategic_kras
- kra_activities
- kra_activity_quarterly_status
- events (audit events only?)

## Safe Migration Approach

### 1. Check What Exists First
```sql
-- See ALL tables in database
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 2. Only Drop Audit Tables
```sql
-- Drop ONLY audit-specific tables
DROP TABLE IF EXISTS psap_assessment_scores CASCADE;
DROP TABLE IF EXISTS psap_assessments CASCADE;
DROP TABLE IF EXISTS psap_rating_scales CASCADE;
DROP TABLE IF EXISTS psap_standards CASCADE;
DROP TABLE IF EXISTS kra_activity_quarterly_status CASCADE;
DROP TABLE IF EXISTS kra_activities CASCADE;
DROP TABLE IF EXISTS strategic_kras CASCADE;
DROP TABLE IF EXISTS action_plans CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS workpapers CASCADE;
DROP TABLE IF EXISTS engagement_team CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS risk_profile_items CASCADE;
DROP TABLE IF EXISTS risk_profiles CASCADE;
DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS obligations CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- DO NOT DROP: org_units, people, notifications (may be shared!)
```

### 3. Create Tables with IF NOT EXISTS
Always use `CREATE TABLE IF NOT EXISTS` to avoid conflicts.

### 4. Coordinate on Shared Tables

**org_units**:
- Likely shared by all departments
- Add columns carefully
- Coordinate schema changes

**people**:
- Shared user directory
- The `role` field might need to support multiple roles
- Consider adding audit-specific columns only if needed

**notifications**:
- May be shared notification system
- Or could be department-specific

## Naming Conventions

Consider prefixing audit-specific tables:
- `audit_engagements` instead of `engagements`
- `audit_findings` instead of `findings`
- `audit_events` instead of `events`

This makes ownership crystal clear.

## Questions to Ask Other Departments

1. Which tables are shared vs. department-specific?
2. Can we modify `org_units` and `people` schemas?
3. Is there a table naming convention?
4. Are there shared RLS policies we should follow?
5. Who manages the database schema changes?

## Current Status

Based on our migrations, we may have:
- ✅ Created audit-specific tables
- ⚠️ Possibly affected shared tables unknowingly
- ⚠️ May have conflicting RLS policies

## Recommended Next Steps

1. **Audit the database** - Check what tables exist now
2. **Identify shared vs. audit-only** tables
3. **Rename if needed** - Add prefixes to avoid conflicts
4. **Document ownership** - Create a table ownership matrix
5. **Coordinate with other teams** - Especially for org_units and people
