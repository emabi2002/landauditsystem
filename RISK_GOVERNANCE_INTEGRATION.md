# Risk & Governance Integration - Implementation Guide

## Overview

This document describes the integration of three new modules into the Lands Audit & Compliance System:

1. **Risk Profile Module** - Risk assessment matrix management
2. **PSAP Financial & Governance Scorecard** - 20 standards quarterly assessment
3. **KRA & Workplan Performance** - Key Result Areas tracking

These modules extend the existing Internal Audit workflow with operational templates from the Internal Audit Policy Manual.

---

## ✅ Phase 1: Database Schema (COMPLETED)

### Migration File
**Location**: `supabase/migrations/003_risk_governance_modules.sql`

### New Tables Created

#### 1. Risk Profile Module
- **risk_profiles** - Risk assessment headers
  - Links to org_units and people
  - Tracks overall risk level (Low/Moderate/High/Extreme)
  - Can be linked to audit engagements

- **risk_profile_items** - Individual risks in the matrix
  - Context categories: External Environment, Compliance, Organisational Culture, Business Processes, Education & Skills
  - Resource categories: Human Resources, Financial Resources, Information Resources, Infrastructure & Physical Assets
  - Auto-calculates risk score (Likelihood × Impact) and risk level
  - Tracks existing and additional controls

#### 2. PSAP Scorecard Module
- **psap_standards** - Master table of 20 PSAP standards
  - Seeded with official standards and weightings
  - Categories: Financial, Governance, or Both

- **psap_rating_scales** - Compliance rating interpretations
  - Full Compliance (18.0-20.0)
  - Substantial Compliance (15.0-17.9)
  - Partial Compliance (12.0-14.9)
  - Low Compliance (9.0-11.9)
  - Non-Compliance (0.0-8.9)

- **psap_assessments** - Quarterly assessment headers
  - Unique constraint: one assessment per org unit per quarter
  - Auto-calculates overall score and rating

- **psap_assessment_scores** - Individual standard scores
  - Auto-calculates weighted scores using triggers
  - Updates assessment totals automatically

#### 3. KRA/Workplan Module
- **strategic_kras** - Key Result Areas for org units
  - Multi-year tracking (start_year to end_year)
  - Links to organizational units

- **kra_activities** - Activities under each KRA
  - Activity code (a, b, c, etc.)
  - Measure/indicator and annual targets

- **kra_activity_quarterly_status** - Quarterly progress tracking
  - Status: Completed, Ongoing, Not Started, Not Measurable, Delayed
  - Narrative status, challenges, and revision notes
  - Unique constraint: one status per activity per quarter

### Auto-Calculation Features

#### Risk Score Trigger
```sql
CREATE TRIGGER trigger_calculate_risk_score
  BEFORE INSERT OR UPDATE OF likelihood_score, impact_score
  ON risk_profile_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_risk_score();
```
- Automatically calculates: risk_score = likelihood × impact
- Determines risk level: Extreme (15-25), High (10-14), Moderate (5-9), Low (1-4)

#### PSAP Weighted Score Trigger
```sql
CREATE TRIGGER trigger_calculate_psap_weighted_score
  BEFORE INSERT OR UPDATE OF raw_score
  ON psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_psap_weighted_score();
```
- Calculates: weighted_score = raw_score × standard_weighting

#### PSAP Assessment Totals
```sql
CREATE TRIGGER trigger_psap_score_change
  AFTER INSERT OR UPDATE OR DELETE
  ON psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_psap_totals();
```
- Updates overall_score (sum of weighted scores)
- Determines overall_rating using rating scales

### Reporting Views

#### v_current_risk_summary
Shows latest risk profile summary per org unit with counts by risk level.

#### v_latest_psap_ratings
Shows most recent PSAP assessment ratings per org unit.

#### v_kra_status_summary
Shows KRA activity completion statistics per quarter.

### Integration with Existing Tables

```sql
-- Link risk profiles and PSAP assessments to audits
ALTER TABLE engagements
  ADD COLUMN risk_profile_id uuid REFERENCES risk_profiles(id),
  ADD COLUMN psap_assessment_id uuid REFERENCES psap_assessments(id);

-- Link recommendations to KRA activities
ALTER TABLE recommendations
  ADD COLUMN kra_activity_id uuid REFERENCES kra_activities(id);
```

---

## ✅ Phase 2: Data Access Layer (COMPLETED)

### Custom Hooks

#### 1. useRiskProfiles (`src/lib/hooks/useRiskProfiles.ts`)
```typescript
const {
  riskProfiles,
  loading,
  error,
  fetchRiskProfiles,
  createRiskProfile,
  updateRiskProfile,
  deleteRiskProfile,
  fetchRiskProfileItems,
  createRiskProfileItem,
  updateRiskProfileItem,
  deleteRiskProfileItem
} = useRiskProfiles()
```

**Features:**
- Full CRUD for risk profiles and risk items
- Filters by org unit and year
- Joins with org_units and people for display names
- Auto-calculation handled by database triggers

#### 2. usePSAPAssessments (`src/lib/hooks/usePSAPAssessments.ts`)
```typescript
const {
  standards,
  ratingScales,
  assessments,
  loading,
  error,
  fetchStandards,
  fetchRatingScales,
  fetchAssessments,
  createAssessment,
  updateAssessment,
  fetchAssessmentScores,
  updateScore,
  deleteAssessment,
  getRatingForScore
} = usePSAPAssessments()
```

**Features:**
- Loads 20 PSAP standards and rating scales
- Creates assessments with batch score insertion
- Auto-calculation of weighted scores and ratings
- Filter by org unit, year, and quarter

#### 3. useKRAs (`src/lib/hooks/useKRAs.ts`)
```typescript
const {
  kras,
  loading,
  error,
  fetchKRAs,
  createKRA,
  updateKRA,
  deleteKRA,
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchQuarterlyStatus,
  createOrUpdateQuarterlyStatus,
  fetchKRAStatusSummary
} = useKRAs()
```

**Features:**
- Full KRA and activity management
- Quarterly status upsert (create or update)
- Status summary by org unit and quarter
- Multi-year KRA tracking

---

## ✅ Phase 3: User Interface (COMPLETED)

### Navigation Structure

**Sidebar Updated** (`src/components/layout/Sidebar.tsx`)
```
AUDIT WORKFLOW
├── Dashboard
├── Engagements
├── Fieldwork
├── Findings
├── Recommendations
└── Action Plans

RISK & GOVERNANCE ← NEW
├── Risk Profiles
├── PSAP Scorecard
└── KRA & Workplan

MANAGEMENT
├── Compliance
├── Risk Register
├── Reports
└── Admin
```

### 1. Risk Profiles Page (`/risk-profiles`)

**Features:**
- Statistics cards: Total profiles, Extreme/High/Low risk counts
- Filterable list by year
- Risk profile list table with:
  - Org unit, project name, profile date
  - Overall risk level badge (color-coded)
  - Prepared by and reviewed by
  - Action buttons (View, Edit, Delete)
- Risk matrix guide showing:
  - 5 context categories
  - 4 resource categories
  - Risk score calculation formula

**Next Steps:**
- [ ] Create Risk Profile form dialog
- [ ] Build matrix-style risk item editor
- [ ] Add "Create from Audit" functionality
- [ ] Link to engagement detail pages

### 2. PSAP Scorecard Page (`/psap-scorecard`)

**Features:**
- Statistics cards: Total assessments, average score, full compliance count
- Three tabs:
  1. **Assessments Tab**
     - Filter by year and quarter
     - Assessment history table with overall scores and ratings
     - Color-coded rating badges
  2. **Standards Reference Tab**
     - All 20 PSAP standards
     - Standard number, title, description, category, weighting
  3. **Rating Scales Tab**
     - 5 compliance levels with score ranges
     - Color-coded visualization

**Next Steps:**
- [ ] Create PSAP Assessment form
- [ ] Build score entry interface for 20 standards
- [ ] Add trend charts (score over time)
- [ ] Link to engagement detail pages
- [ ] Export to Excel/PDF

### 3. KRA & Workplan Page (`/kra-workplan`)

**Features:**
- Statistics cards: Total activities, completed, ongoing, delayed
- Two tabs:
  1. **Quarterly Status Tab**
     - Filter by year and quarter
     - Status summary table showing:
       - Org unit, KRA code and title
       - Count by status (Completed, Ongoing, Delayed, Not Started)
       - Color-coded badges
  2. **KRA Management Tab**
     - List of strategic KRAs
     - KRA code, title, purpose, period
- Sample KRA activities from Governance & Compliance Unit

**Next Steps:**
- [ ] Create KRA form dialog
- [ ] Build activity management interface
- [ ] Create quarterly status entry form
- [ ] Link recommendations to KRA activities
- [ ] Show linked audit recommendations on KRA activities

---

## 🔄 Phase 4: Dashboard Integration (TODO)

### Main Dashboard Updates Needed

1. **Risk Profile Summary Card**
   - Show extreme/high risk count across all units
   - Recent risk profiles with trend
   - Link to Risk Profiles page

2. **PSAP Ratings Widget**
   - Show latest ratings by org unit
   - Compliance level distribution chart
   - Average score trend line

3. **KRA Performance Widget**
   - Current quarter completion rate
   - Activities by status (pie chart)
   - Overdue/delayed activities alert

4. **Combined Risk & Governance Dashboard**
   - Dedicated page at `/risk-governance-dashboard`
   - Integrated view of all three modules
   - Executive summary for Secretary/EMC

### Chart Components Needed
- Risk heat map (context × resource matrix)
- PSAP score trend line (quarterly)
- KRA completion funnel
- Compliance level distribution

---

## 🔄 Phase 5: Forms & Dialogs (TODO)

### 1. Risk Profile Forms

#### Create/Edit Risk Profile Dialog
```typescript
// Fields needed:
- Org Unit (dropdown from org_units)
- Project Name (optional text)
- Profile Date (date picker)
- Prepared By (people dropdown)
- Reviewed By (optional people dropdown)
- Overall Level (auto-calculated or manual override)
- Remarks (textarea)
```

#### Risk Item Matrix Editor
```typescript
// Matrix-style interface:
// Rows: Context categories (External Environment, Compliance, etc.)
// Columns: Resource categories (Human Resources, Financial, etc.)
// Each cell opens a panel with:
- Risk Description (textarea)
- Likelihood Score (1-5 slider)
- Impact Score (1-5 slider)
- Risk Score (auto-calculated display)
- Risk Level (auto-calculated badge)
- Existing Controls (textarea)
- Additional Controls (textarea)
- Risk Owner (org unit dropdown)
- Target Date (date picker)
- Status (dropdown: Open/Mitigating/Closed)
```

### 2. PSAP Assessment Form

#### Create Assessment Dialog
```typescript
// Step 1: Assessment Header
- Org Unit (dropdown)
- Financial Year (year picker)
- Quarter (1-4 dropdown)
- Assessment Date (date picker)
- Completed By (people dropdown)
- Reviewed By (optional people dropdown)

// Step 2: Score Entry (20 standards)
- For each standard:
  - Standard # and Title (read-only)
  - Weighting (read-only)
  - Raw Score (0-10 input/slider)
  - Weighted Score (auto-calculated display)
  - Comments (optional textarea)
- Overall Score (auto-calculated display)
- Overall Rating (auto-calculated badge)
```

### 3. KRA & Activity Forms

#### Create/Edit KRA Dialog
```typescript
- Org Unit (dropdown)
- KRA Code (text)
- KRA Title (text)
- Purpose (textarea)
- Start Year (year picker)
- End Year (optional year picker)
```

#### Create/Edit Activity Dialog
```typescript
- Strategic KRA (dropdown)
- Activity Code (text, e.g., "a)", "b)")
- Description (textarea)
- Measure/Indicator (text)
- Baseline (text)
- Annual Target (text)
```

#### Quarterly Status Entry Form
```typescript
// For selected year/quarter, show all activities with:
- Activity Code & Description (read-only)
- Status (dropdown: Completed/Ongoing/Not Started/Not Measurable/Delayed)
- Narrative Status (textarea)
- Challenges (textarea)
- Revision for Next Year (textarea)
```

---

## 🔄 Phase 6: Audit Workflow Integration (TODO)

### 1. Engagement Planning

When creating/editing an audit engagement:

```typescript
// Add fields to engagement form:
- Link to Risk Profile (dropdown of risk profiles for selected org unit)
- Link to PSAP Assessment (dropdown of recent assessments for org unit)

// On engagement detail page, show:
- Risk Profile Summary (if linked)
  - Overall risk level
  - Top 5 risks by score
  - Link to full profile
- Latest PSAP Rating (if linked)
  - Overall score and rating
  - Standards with low scores
  - Link to full assessment
```

### 2. Recommendations to KRA Linking

When creating/editing a recommendation:

```typescript
// Add field:
- Link to KRA Activity (dropdown of activities for owner's org unit)

// On recommendation detail:
- Show linked KRA activity
- Show activity's current quarterly status
- Highlight if recommendation addresses KRA gap
```

### 3. Finding to Risk Profile Linking

When creating findings:

```typescript
// Suggest risk profile items for the audited org unit
// Allow linking finding to specific risk item
// Update risk item status when finding is addressed
```

---

## 🔄 Phase 7: RLS Policies (TODO)

### Row Level Security

Add RLS policies to migration `004_rls_risk_governance.sql`:

```sql
-- Risk Profiles: Internal Audit and Managers can CRUD
CREATE POLICY risk_profiles_select ON risk_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM people
      WHERE role IN ('Audit Admin', 'Audit Manager', 'Auditor')
    )
  );

-- PSAP Assessments: Audit Admin and Managers can create/edit
CREATE POLICY psap_assessments_insert ON psap_assessments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM people
      WHERE role IN ('Audit Admin', 'Audit Manager')
    )
  );

-- KRA Status: Activity owners and Internal Audit can update
CREATE POLICY kra_status_update ON kra_activity_quarterly_status
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM people
      WHERE role IN ('Audit Admin', 'Audit Manager', 'Action Owner')
    )
  );
```

---

## 🔄 Phase 8: Testing & Validation (TODO)

### Test Data Creation

Create test data in Supabase:

1. **Risk Profiles**
   - Create 2-3 risk profiles for different org units
   - Add 10-15 risk items across different matrix cells
   - Mix of risk levels (Low/Moderate/High/Extreme)

2. **PSAP Assessments**
   - Create quarterly assessments for 2024 (Q1-Q4)
   - Vary scores to show different compliance levels
   - Test score trends over time

3. **KRA Activities**
   - Seed complete KRA structure for Governance & Compliance Unit
   - Add quarterly status for 2024 Q1-Q4
   - Mix of status types (Completed/Ongoing/Delayed)

### Integration Testing

- [ ] Create risk profile and link to audit engagement
- [ ] Create PSAP assessment and link to audit
- [ ] Link recommendation to KRA activity
- [ ] Test auto-calculations for risk scores
- [ ] Test auto-calculations for PSAP weighted scores
- [ ] Test quarterly status tracking
- [ ] Test views and summary queries
- [ ] Test filters and search

---

## 📊 Seed Data Included

The migration automatically seeds:

### 1. PSAP Standards (20 Standards)
Example standards:
1. Annual Budget Preparation (weighting: 1.0, Financial)
2. Budget Approval Process (weighting: 0.8, Governance)
3. Financial Reporting (weighting: 1.0, Financial)
...
20. Document Management (weighting: 0.7, Both)

### 2. PSAP Rating Scales (5 Levels)
- Full Compliance: 18.0-20.0 (green)
- Substantial Compliance: 15.0-17.9 (lime)
- Partial Compliance: 12.0-14.9 (yellow)
- Low Compliance: 9.0-11.9 (orange)
- Non-Compliance: 0.0-8.9 (red)

### 3. Sample KRA Structure
**Governance & Compliance Unit - KRA 1:**
- a) Conduct DLPP audits and investigations
- b) Validate reliability and integrity of information
- c) Monitor corporate compliance
- d) Safeguard intellectual and physical assets
- e) Assess economy, efficiency, effectiveness of programs
- f) Advise on risk management and governance

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run migration `003_risk_governance_modules.sql` in Supabase
- [ ] Verify all seed data loaded correctly
- [ ] Test all hooks and CRUD operations
- [ ] Add RLS policies for security
- [ ] Create test data for each module
- [ ] Update main dashboard with new widgets
- [ ] Complete form dialogs for data entry
- [ ] Document user workflows
- [ ] Train Internal Audit staff
- [ ] Train action owners on KRA status entry

---

## 📖 User Workflows

### Risk Profile Creation Workflow
1. Internal Audit creates new risk profile for an org unit
2. Fills in header (date, prepared by, project name)
3. Uses matrix editor to add risks across categories
4. Sets likelihood and impact (auto-calculates score and level)
5. Documents existing and additional controls
6. Assigns risk owners and target dates
7. Reviews and finalizes profile
8. Links profile to audit engagement (optional)

### PSAP Assessment Workflow
1. Audit Admin creates quarterly assessment
2. Selects org unit, year, quarter
3. Scores each of 20 standards (0-10)
4. System auto-calculates weighted scores
5. System determines overall rating
6. Adds comments for low-scoring standards
7. Reviewer approves assessment
8. Links to audit engagement (optional)
9. Trends are visible in dashboard

### KRA Quarterly Status Workflow
1. Division managers review KRA activities for their unit
2. For current quarter, update each activity status
3. Provide narrative (e.g., "6 audits completed")
4. Document challenges and delays
5. Note revisions for next year
6. Internal Audit reviews and validates
7. Data feeds into performance reports
8. Links to audit recommendations

---

## 🔗 Policy Alignment

This implementation aligns with the **Internal Audit Policy Manual** by:

1. **Risk-Based Audit Planning**
   - Risk profiles inform audit universe
   - High-risk areas prioritized for fieldwork

2. **Compliance Monitoring**
   - PSAP scorecard tracks financial and governance compliance
   - Quarterly assessments provide objective evidence

3. **Performance Measurement**
   - KRA tracking links Internal Audit to organizational goals
   - Shows contribution to strategic objectives

4. **Management Reporting**
   - Integrated dashboard for Secretary/EMC
   - Clear linkage from risk → audit → finding → recommendation → action → KRA

5. **Follow-Up Process**
   - Recommendations linked to KRA activities
   - Quarterly status shows implementation progress
   - PSAP scores show improvement over time

---

## 📞 Support

For questions or issues:
- **System Admin**: Sarah Johnson
- **Email**: audit-support@dlpp.org
- **Documentation**: `/api-docs`

---

## Version History

- **v3.0.0** (2024-12-13) - Risk & Governance Integration Phase 1
  - Database schema and migrations
  - Custom hooks for data access
  - UI pages for Risk Profiles, PSAP Scorecard, KRA & Workplan
  - Navigation updates
  - Auto-calculation triggers
