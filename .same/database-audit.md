# Database Schema Audit Report

## Database Connection
- **URL**: https://yvnkyjnwvylrweyzvibs.supabase.co
- **Status**: ✅ Connected
- **Date**: December 25, 2025

## Current Status

### ✅ EXISTING Tables (3 confirmed)
Based on our API check, these tables exist:

1. **people** - User/staff records
2. **engagements** - Audit engagement records
3. **notifications** - User notifications

### ❌ MISSING Tables (13+ required)

The application code expects these tables but they're not in the database:

#### Core Audit Tables
- [ ] **org_units** - Organization structure
- [ ] **findings** - Audit findings
- [ ] **recommendations** - Recommendations from findings
- [ ] **action_plans** - Implementation tracking
- [ ] **workpapers** - Fieldwork documentation
- [ ] **evidence** - File attachments
- [ ] **engagement_team** - Team assignments
- [ ] **events** - Audit log

#### Compliance Tables
- [ ] **obligations** - Legal/regulatory requirements
- [ ] **controls** - Control framework

#### Risk & Governance Tables
- [ ] **risk_profiles** - Risk assessment profiles
- [ ] **risk_profile_items** - Individual risk items
- [ ] **psap_standards** - 20 PSAP standards (reference data)
- [ ] **psap_assessments** - PSAP quarterly assessments
- [ ] **psap_assessment_scores** - Scores for each standard
- [ ] **psap_rating_scales** - Rating scale definitions
- [ ] **strategic_kras** - Key Result Areas
- [ ] **kra_activities** - KRA activities
- [ ] **kra_activity_quarterly_status** - Quarterly status updates

### ❌ MISSING Views (4 required)
- [ ] **published_recommendations_view** - For Legal CMS API
- [ ] **v_current_risk_summary** - Risk summary view
- [ ] **v_kra_status_summary** - KRA status aggregation
- [ ] **v_latest_psap_ratings** - Latest PSAP ratings

### ❌ MISSING Functions (3+ required)
- [ ] **current_person()** - Get current user's person record
- [ ] **current_person_role()** - Get current user's role
- [ ] **publish_recommendation()** - Publish recommendation workflow
- [ ] **link_to_legal()** - Link recommendation to legal case
- [ ] **update_action_progress()** - Update action plan progress
- [ ] **update_psap_assessment_totals()** - Calculate PSAP totals

## Expected Schema from Code

The TypeScript types in `src/lib/database.types.ts` define:
- **18 core tables**
- **4 views**
- **6+ database functions**

## What Happened?

It appears the database has only **partial data** - likely from an incomplete or failed migration. The existing tables (people, engagements, notifications) suggest someone started creating tables but didn't finish.

## Next Steps

### Option 1: Complete Migration (Recommended)
Run the migration to create ALL missing tables, views, and functions.

### Option 2: Drop & Recreate (Clean Slate)
If the existing data isn't important:
1. Drop all existing tables
2. Run fresh migration
3. Start with clean database

### Option 3: Incremental Migration
Create only the missing tables while preserving existing data.

## Recommendations

**I recommend Option 1** - Complete the migration by creating missing tables. This will:
- ✅ Preserve existing people/engagements/notifications data
- ✅ Add all missing tables
- ✅ Set up proper relationships
- ✅ Enable all 13 modules to work

## To Check Your Database

Run this SQL in **Supabase SQL Editor** (copy from `scripts/direct-db-check.sql`):

```sql
-- Quick check - what tables exist?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

This will show you exactly what's in your database right now.
