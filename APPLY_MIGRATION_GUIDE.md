# Apply Risk & Governance Migration - Step-by-Step Guide

## Current Status

✅ **Database Connection:** Working
✅ **Core Audit Tables:** Deployed (Migration 001 & 002)
❌ **Risk & Governance Tables:** Not yet deployed

## What You Need to Do

Apply **Migration 003** to create the Risk & Governance modules (Risk Profiles, PSAP Scorecard, KRA & Workplan).

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. **Go to:** https://supabase.com/dashboard/project/xelptlfgpxdzrstiwcti/sql
2. **Sign in** with your Supabase account if not already logged in
3. You should see your **"ilms"** project dashboard

### Step 2: Create a New Query

1. Click the **"New Query"** button (top right or in the SQL Editor section)
2. You'll see an empty SQL editor window

### Step 3: Copy the Migration SQL

**Option A: Copy from File**
1. Open the file: `landauditsystem/supabase/migrations/003_risk_governance_modules.sql`
2. Select all content (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)

**Option B: Use the command below**

In your terminal:
```bash
cd landauditsystem
cat supabase/migrations/003_risk_governance_modules.sql | pbcopy  # Mac
cat supabase/migrations/003_risk_governance_modules.sql | xclip   # Linux
```

### Step 4: Paste and Run

1. **Paste** the SQL into the Supabase SQL Editor
2. **Review** - you should see SQL commands starting with:
   ```sql
   -- =====================================================
   -- Migration 003: Risk Profile, PSAP Scorecard, and KRA/Workplan Modules
   -- =====================================================
   ```
3. Click the **"Run"** button (bottom right corner)
4. **Wait** for execution (30-60 seconds)

### Step 5: Verify Success

You should see:
- ✅ "Success. No rows returned" (this is correct for DDL statements)
- OR a green success message

If you see any **errors**, copy the error message and let me know.

### Step 6: Verify Migration Applied

Run this command in your terminal:

```bash
cd landauditsystem
bun run scripts/check-db-status.ts
```

You should now see:
```
Risk & Governance Tables:
  ✅ risk_profiles
  ✅ risk_profile_items
  ✅ psap_standards
  ✅ psap_rating_scales
  ✅ psap_assessments
  ✅ psap_assessment_scores
  ✅ strategic_kras
  ✅ kra_activities
  ✅ kra_activity_quarterly_status

📋 Migration Status:
  ✅ Migration 001 (Core Schema): APPLIED
  ✅ Migration 003 (Risk & Governance): APPLIED

📊 Seed Data Status:
  PSAP Standards: 20 (expected: 20)
  PSAP Rating Scales: 5 (expected: 5)
  Strategic KRAs: 1+ (expected: 1+)
```

### Step 7: Restart Your Dev Server

```bash
cd landauditsystem
# Stop the current server (Ctrl+C)
bun run dev
```

Visit: http://localhost:3000

---

## What This Migration Creates

### 🗄️ New Tables (9 total)

**Risk Profile Module:**
- `risk_profiles` - Risk assessment headers
- `risk_profile_items` - Individual risks in the matrix

**PSAP Scorecard Module:**
- `psap_standards` - 20 PSAP standards (seeded automatically)
- `psap_rating_scales` - 5 compliance levels (seeded automatically)
- `psap_assessments` - Quarterly assessment records
- `psap_assessment_scores` - Individual standard scores

**KRA/Workplan Module:**
- `strategic_kras` - Key Result Areas
- `kra_activities` - Activities under each KRA
- `kra_activity_quarterly_status` - Quarterly progress tracking

### ⚙️ Auto-Calculation Features

1. **Risk Score Calculation**
   - Automatically calculates: `risk_score = likelihood × impact`
   - Determines risk level: Extreme/High/Moderate/Low

2. **PSAP Weighted Score Calculation**
   - Automatically calculates: `weighted_score = raw_score × weighting`
   - Updates overall assessment score and rating

### 📊 Reporting Views (3 total)

- `v_current_risk_summary` - Latest risk profiles by org unit
- `v_latest_psap_ratings` - Most recent PSAP ratings
- `v_kra_status_summary` - KRA completion statistics

### 🌱 Seed Data

**20 PSAP Standards** including:
1. Annual Budget Preparation
2. Budget Approval Process
3. Financial Reporting
4. Variance Analysis
5. Internal Controls
... (15 more)

**5 PSAP Rating Scales:**
- Full Compliance (18.0-20.0)
- Substantial Compliance (15.0-17.9)
- Partial Compliance (12.0-14.9)
- Low Compliance (9.0-11.9)
- Non-Compliance (0.0-8.9)

**Sample KRA Structure:**
- Governance & Compliance Unit
- 6 sample activities (audits, compliance monitoring, risk management, etc.)

### 🔗 Integration Updates

**Existing Tables Extended:**
- `engagements` - Added `risk_profile_id` and `psap_assessment_id`
- `recommendations` - Added `kra_activity_id`

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Tables were already created. Run verification script to confirm:
```bash
bun run scripts/check-db-status.ts
```

### Error: "permission denied"
**Solution:** Make sure you're signed in to Supabase with the correct account that owns the "ilms" project.

### Error: "column does not exist"
**Solution:** Make sure Migration 001 and 002 were applied first. Check core tables exist.

### Query takes too long
**Solution:** This is normal for large migrations. Wait up to 2 minutes. If it times out, try running the migration in smaller chunks.

---

## After Migration Success

### Next Steps:

1. **Navigate to Risk & Governance Modules**
   - Open http://localhost:3000
   - Click on sidebar: **RISK & GOVERNANCE** section
   - Explore: Risk Profiles, PSAP Scorecard, KRA & Workplan

2. **Create Test Data**
   - Create your first Risk Profile
   - Complete a PSAP Assessment
   - Add KRA quarterly status

3. **Integrate with Audits**
   - Link risk profiles to audit engagements
   - Link recommendations to KRA activities
   - Track compliance improvements

---

## Quick Command Reference

```bash
# Check database status
bun run scripts/check-db-status.ts

# Start dev server
bun run dev

# Run linter
bun run lint

# View migration file
cat supabase/migrations/003_risk_governance_modules.sql
```

---

## Need Help?

If you encounter any issues:
1. Copy the error message
2. Run: `bun run scripts/check-db-status.ts`
3. Share the output with your developer

---

## Success Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Created new query
- [ ] Copied migration SQL
- [ ] Ran migration successfully
- [ ] Verified with check-db-status.ts
- [ ] Restarted dev server
- [ ] Navigated to Risk & Governance pages
- [ ] Confirmed 20 PSAP standards visible
- [ ] Confirmed 5 rating scales visible
- [ ] Ready to create first risk profile

---

**Project:** ILMS (ilms)
**Migration:** 003_risk_governance_modules.sql
**Date:** December 13, 2024
**Version:** 3.0.0
