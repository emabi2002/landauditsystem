# DLPP Internal Audit & Compliance System - Complete Analysis

## System Overview

This is a comprehensive internal audit management system with 13 integrated modules tracking the complete audit lifecycle from planning through follow-up, with additional risk and governance assessment capabilities.

---

## Business Workflow Analysis

### Core Audit Lifecycle

```
1. ENGAGEMENT PLANNING
   ↓
2. FIELDWORK EXECUTION (Workpapers + Evidence)
   ↓
3. FINDINGS DOCUMENTATION
   ↓
4. RECOMMENDATIONS CREATION
   ↓
5. ACTION PLAN DEVELOPMENT
   ↓
6. IMPLEMENTATION TRACKING
   ↓
7. VERIFICATION & CLOSURE
```

### Module Relationships

```
Organizations (org_units)
├── People (staff members)
├── Engagements (audits)
│   ├── Engagement Team (assignments)
│   ├── Workpapers (fieldwork)
│   │   └── Evidence (files)
│   ├── Findings
│   │   └── Recommendations
│   │       └── Action Plans
│   ├── Risk Profiles (linked)
│   └── PSAP Assessments (linked)
├── Risk Profiles
│   └── Risk Profile Items (matrix)
├── PSAP Assessments (quarterly)
│   └── PSAP Assessment Scores
├── Strategic KRAs
│   └── KRA Activities
│       └── Quarterly Status Updates
├── Obligations (compliance)
│   └── Controls
└── Notifications
```

---

## Data Model Analysis

### 1. **ORGANIZATIONAL STRUCTURE** (Foundation)

#### org_units
**Purpose**: Hierarchical organization structure
**Relationships**: Self-referential (parent-child), referenced by all modules
**Key Fields**:
- `id` (PK)
- `parent_id` (FK → org_units) - supports hierarchy
- `code` (UNIQUE) - business key
- `name`, `description`
- `active` - soft delete

**Indexes Required**:
- `idx_org_units_parent` on `parent_id` - for hierarchy queries
- `idx_org_units_code` on `code` - for lookups
- `idx_org_units_active` on `active` - for filtering

#### people
**Purpose**: Staff/user directory linked to auth
**Relationships**: References org_units, auth.users
**Key Fields**:
- `id` (PK)
- `user_id` (FK → auth.users) - Supabase auth link
- `org_unit_id` (FK → org_units)
- `role` (ENUM) - 'Audit Admin', 'Audit Manager', 'Auditor', 'Action Owner', 'Read-Only', 'System Integrator'
- `email` (UNIQUE)

**Indexes Required**:
- `idx_people_user` on `user_id` - for auth lookups
- `idx_people_email` on `email` - for searches
- `idx_people_role` on `role` - for permissions
- `idx_people_org_unit` on `org_unit_id` - for org queries

---

### 2. **AUDIT ENGAGEMENT MODULE** (Core Workflow)

#### engagements
**Purpose**: Audit engagement headers
**Relationships**: References org_units, people, risk_profiles, psap_assessments
**Workflow States**: Planning → Fieldwork → Reporting → Follow-up → Closed
**Key Fields**:
- `id` (PK)
- `org_unit_id` (FK → org_units)
- `lead_id` (FK → people) - engagement leader
- `created_by` (FK → people)
- `risk_profile_id` (FK → risk_profiles) - optional link
- `psap_assessment_id` (FK → psap_assessments) - optional link
- `status` (ENUM)
- `start_date`, `end_date`
- `metadata` (JSONB) - flexible data

**Indexes Required**:
- `idx_engagements_org_unit` on `org_unit_id`
- `idx_engagements_lead` on `lead_id`
- `idx_engagements_status` on `status`
- `idx_engagements_dates` on `(start_date, end_date)` - composite for date ranges

#### engagement_team
**Purpose**: Many-to-many link between engagements and people
**Relationships**: Junction table
**Key Fields**:
- `id` (PK)
- `engagement_id` (FK → engagements)
- `person_id` (FK → people)
- `role` - team role (not system role)
- UNIQUE constraint on `(engagement_id, person_id)`

**Indexes Required**:
- `idx_engagement_team_engagement` on `engagement_id`
- `idx_engagement_team_person` on `person_id`

#### workpapers
**Purpose**: Fieldwork documentation
**Relationships**: References engagements, people
**Key Fields**:
- `id` (PK)
- `engagement_id` (FK → engagements) - CASCADE DELETE
- `created_by` (FK → people)
- `title`, `procedure`, `sample_ref`
- `metadata` (JSONB)

**Indexes Required**:
- `idx_workpapers_engagement` on `engagement_id`
- `idx_workpapers_created_by` on `created_by`

#### evidence
**Purpose**: File attachments for workpapers
**Relationships**: References workpapers, people
**Storage**: Supabase Storage (compliance-evidence bucket)
**Key Fields**:
- `id` (PK)
- `workpaper_id` (FK → workpapers) - CASCADE DELETE
- `uploaded_by` (FK → people)
- `file_path`, `file_name`, `file_type`, `file_size`

**Indexes Required**:
- `idx_evidence_workpaper` on `workpaper_id`

---

### 3. **FINDINGS & RECOMMENDATIONS MODULE**

#### findings
**Purpose**: Audit findings documentation
**Relationships**: References engagements, org_units, people
**Workflow States**: Draft → Under Review → Verified → Closed
**Key Fields**:
- `id` (PK)
- `engagement_id` (FK → engagements) - CASCADE DELETE
- `org_unit_id` (FK → org_units)
- `created_by` (FK → people)
- `condition_found` - what was found
- `criteria` - what should be
- `cause` - why it happened
- `effect` - impact
- `risk_rating` (ENUM) - Critical, High, Medium, Low
- `status` (ENUM)

**Indexes Required**:
- `idx_findings_engagement` on `engagement_id`
- `idx_findings_org_unit` on `org_unit_id`
- `idx_findings_status` on `status`
- `idx_findings_risk_rating` on `risk_rating`

#### recommendations
**Purpose**: Actionable recommendations from findings
**Relationships**: References findings, people, kra_activities
**Workflow States**: Draft → Published → Accepted → In Progress → Completed → Overdue
**Integration**: Can link to Legal CMS via `legal_case_id`
**Key Fields**:
- `id` (PK)
- `finding_id` (FK → findings) - CASCADE DELETE
- `created_by` (FK → people)
- `kra_activity_id` (FK → kra_activities) - optional link
- `priority` (ENUM) - Critical, High, Medium, Low
- `status` (ENUM)
- `published_at` - timestamp
- `legal_case_linked` - boolean flag
- `legal_case_id` - external system reference
- `region_code`, `parcel_ref` - land-specific fields

**Indexes Required**:
- `idx_recommendations_finding` on `finding_id`
- `idx_recommendations_status` on `status`
- `idx_recommendations_region` on `region_code`
- `idx_recommendations_kra` on `kra_activity_id`

#### action_plans
**Purpose**: Implementation tracking for recommendations
**Relationships**: References recommendations, people
**Key Fields**:
- `id` (PK)
- `recommendation_id` (FK → recommendations) - CASCADE DELETE
- `action_owner_id` (FK → people)
- `planned_action`
- `progress_percentage` (0-100)
- `actual_completion_date`
- `evidence_url` - link to Supabase Storage
- `status` (ENUM) - Not Started, In Progress, Completed, Overdue

**Indexes Required**:
- `idx_action_plans_recommendation` on `recommendation_id`
- `idx_action_plans_owner` on `action_owner_id`
- `idx_action_plans_status` on `status`

---

### 4. **COMPLIANCE MODULE**

#### obligations
**Purpose**: Legal/regulatory requirements tracking
**Relationships**: References org_units
**Key Fields**:
- `id` (PK)
- `owner_unit_id` (FK → org_units)
- `title`, `source`, `category`, `description`

**Indexes Required**:
- `idx_obligations_owner_unit` on `owner_unit_id`

#### controls
**Purpose**: Control framework
**Relationships**: References org_units, obligations
**Key Fields**:
- `id` (PK)
- `owner_unit_id` (FK → org_units)
- `obligation_id` (FK → obligations)
- `control_type` (ENUM) - Preventive, Detective, Corrective
- `effectiveness` (ENUM) - Effective, Partially Effective, Ineffective, Not Tested
- `frequency`

**Indexes Required**:
- `idx_controls_owner_unit` on `owner_unit_id`
- `idx_controls_obligation` on `obligation_id`

---

### 5. **RISK PROFILE MODULE** (Risk Assessment Matrix)

#### risk_profiles
**Purpose**: Risk assessment headers (per project/org unit)
**Relationships**: References org_units, people
**Linked From**: engagements
**Key Fields**:
- `id` (PK)
- `org_unit_id` (FK → org_units)
- `prepared_by` (FK → people)
- `reviewed_by` (FK → people)
- `project_name` - optional project identifier
- `profile_date`
- `overall_level` (ENUM) - Low, Moderate, High, Extreme

**Indexes Required**:
- `idx_risk_profiles_org_unit` on `org_unit_id`
- `idx_risk_profiles_date` on `profile_date`

#### risk_profile_items
**Purpose**: Individual risks in 5×4 matrix
**Relationships**: References risk_profiles, people
**Matrix Dimensions**:
- **Context Categories** (5): External Environment, Compliance, Organisational Culture, Business Processes, Education & Skills
- **Resource Categories** (4): Human Resources, Financial Resources, Information Resources, Infrastructure & Physical Assets
**Auto-Calculations**:
- `risk_score = likelihood_score × impact_score`
- Risk level derived from score: Extreme (15-25), High (10-14), Moderate (5-9), Low (1-4)
**Key Fields**:
- `id` (PK)
- `risk_profile_id` (FK → risk_profiles) - CASCADE DELETE
- `context_category`, `resource_category`
- `likelihood_score` (1-5)
- `impact_score` (1-5)
- `risk_score` (auto-calculated)
- `existing_controls`, `additional_controls`
- `risk_owner_id` (FK → people)
- `status` - Open, Mitigated, Closed

**Indexes Required**:
- `idx_risk_profile_items_profile` on `risk_profile_id`
- `idx_risk_profile_items_owner` on `risk_owner_id`
- `idx_risk_profile_items_status` on `status`

**Trigger**: `calculate_risk_score()` - auto-calculate on INSERT/UPDATE

---

### 6. **PSAP SCORECARD MODULE** (20 Financial & Governance Standards)

#### psap_standards
**Purpose**: Master list of 20 PSAP standards (reference data)
**Relationships**: None (reference table)
**Data**: Seeded with 20 standards, each weighted at 5.00
**Key Fields**:
- `id` (PK)
- `standard_number` (1-20, UNIQUE)
- `title`, `description`
- `weight` (DECIMAL) - always 5.00 for equal weighting

**Standards List**:
1. Budget Preparation
2. Budget Approval
3. Revenue Collection
4. Expenditure Control
5. Cash Management
6. Asset Management
7. Procurement Process
8. Contract Management
9. Debt Management
10. Accounting Records
11. Financial Reporting
12. Internal Audit
13. Risk Management
14. Compliance
15. Human Resource Management
16. Performance Management
17. Strategic Planning
18. Stakeholder Engagement
19. Transparency
20. Accountability

#### psap_rating_scales
**Purpose**: Rating interpretation (reference data)
**Relationships**: None (reference table)
**Rating Scales**:
- Excellent: 90.00-100.00
- Good: 75.00-89.99
- Fair: 60.00-74.99
- Poor: 0.00-59.99

#### psap_assessments
**Purpose**: Quarterly PSAP assessment headers
**Relationships**: References org_units, people
**Linked From**: engagements
**Constraint**: UNIQUE (org_unit_id, financial_year, quarter) - one per quarter
**Auto-Calculations**:
- `overall_score` - sum of weighted scores from psap_assessment_scores
- `overall_rating` - derived from overall_score using rating_scales
**Key Fields**:
- `id` (PK)
- `org_unit_id` (FK → org_units)
- `financial_year`, `quarter` (1-4)
- `assessment_date`
- `completed_by` (FK → people)
- `reviewed_by` (FK → people)
- `overall_score` (auto-calculated)
- `overall_rating` (auto-calculated)

**Indexes Required**:
- `idx_psap_assessments_org_unit` on `org_unit_id`
- `idx_psap_assessments_period` on `(financial_year, quarter)` - composite

#### psap_assessment_scores
**Purpose**: Scores for each of 20 standards
**Relationships**: References psap_assessments, psap_standards
**Constraint**: UNIQUE (psap_assessment_id, psap_standard_id) - one score per standard
**Auto-Calculations**:
- `weighted_score = raw_score × (standard_weight / 100)`
**Key Fields**:
- `id` (PK)
- `psap_assessment_id` (FK → psap_assessments) - CASCADE DELETE
- `psap_standard_id` (FK → psap_standards)
- `raw_score` (0-100)
- `weighted_score` (auto-calculated)
- `comments`

**Indexes Required**:
- `idx_psap_scores_assessment` on `psap_assessment_id`

**Triggers**:
- `calculate_psap_weighted_score()` - auto-calculate weighted score
- `trigger_update_psap_totals()` - update assessment overall_score

---

### 7. **KRA & WORKPLAN MODULE** (Performance Tracking)

#### strategic_kras
**Purpose**: Key Result Areas per org unit
**Relationships**: References org_units
**Multi-Year**: start_year to end_year (e.g., 2024-2028)
**Key Fields**:
- `id` (PK)
- `org_unit_id` (FK → org_units)
- `kra_code` - business identifier
- `kra_title`, `purpose`
- `start_year`, `end_year`

**Indexes Required**:
- `idx_strategic_kras_org_unit` on `org_unit_id`

#### kra_activities
**Purpose**: Activities under each KRA
**Relationships**: References strategic_kras
**Linked From**: recommendations
**Key Fields**:
- `id` (PK)
- `strategic_kra_id` (FK → strategic_kras) - CASCADE DELETE
- `activity_code` - a, b, c, etc.
- `description`
- `measure` - performance indicator
- `baseline`, `annual_target`

**Indexes Required**:
- `idx_kra_activities_kra` on `strategic_kra_id`

#### kra_activity_quarterly_status
**Purpose**: Quarterly status updates for activities
**Relationships**: References kra_activities
**Constraint**: UNIQUE (kra_activity_id, financial_year, quarter)
**Key Fields**:
- `id` (PK)
- `kra_activity_id` (FK → kra_activities) - CASCADE DELETE
- `financial_year`, `quarter` (1-4)
- `status` (ENUM) - Completed, Ongoing, Not Started, Delayed, Not Measurable
- `narrative_status`, `challenges`, `revision_next_year`

**Indexes Required**:
- `idx_kra_status_activity` on `kra_activity_id`
- `idx_kra_status_period` on `(financial_year, quarter)` - composite

---

### 8. **AUDIT LOG & NOTIFICATIONS**

#### events
**Purpose**: Immutable audit log
**Relationships**: References people
**Immutability**: INSERT-only, no updates/deletes
**Key Fields**:
- `id` (PK)
- `event_type`, `entity_type`, `entity_id`
- `actor_id` (FK → people)
- `changes` (JSONB)
- `timestamp`

**Indexes Required**:
- `idx_events_entity` on `(entity_type, entity_id)` - composite
- `idx_events_actor` on `actor_id`
- `idx_events_timestamp` on `timestamp DESC` - for recent events

#### notifications
**Purpose**: User notifications
**Relationships**: References people
**Key Fields**:
- `id` (PK)
- `person_id` (FK → people) - CASCADE DELETE
- `title`, `message`, `link`
- `read` (boolean)

**Indexes Required**:
- `idx_notifications_person` on `person_id`
- `idx_notifications_read` on `read`

---

## Database Views (Reporting)

### v_current_risk_summary
**Purpose**: Latest risk profile summary per org unit
**Aggregates**: Total risks, counts by level (extreme, high, moderate, low)
**Query Pattern**: Used by dashboard Risk Profile widget

### v_latest_psap_ratings
**Purpose**: Most recent PSAP assessment per org unit
**Shows**: Latest assessment with overall score and rating
**Query Pattern**: Used by dashboard PSAP Ratings widget

### v_kra_status_summary
**Purpose**: KRA activity completion statistics
**Aggregates**: Total activities, completed, ongoing, delayed per quarter
**Query Pattern**: Used by dashboard KRA Completion widget

### published_recommendations_view
**Purpose**: Published recommendations for Legal CMS API
**Filter**: status = 'Published'
**Exposes**: Read-only API endpoint for external system integration

---

## Database Functions (Business Logic)

### Helper Functions

#### current_person() → UUID
**Purpose**: Get current user's person record ID
**Used By**: RLS policies, audit logging
**Logic**: `SELECT id FROM people WHERE user_id = auth.uid()`

#### current_person_role() → TEXT
**Purpose**: Get current user's role
**Used By**: RLS policies for role-based access
**Logic**: `SELECT role FROM people WHERE user_id = auth.uid()`

### Workflow Functions

#### publish_recommendation(rec_id UUID)
**Purpose**: Transition recommendation to Published status
**Logic**:
- Update status to 'Published'
- Set published_at timestamp
- Create audit event
- Send notifications

#### link_to_legal(rec_id UUID, case_id TEXT)
**Purpose**: Link recommendation to Legal CMS case
**Logic**:
- Update legal_case_linked = true
- Set legal_case_id
- Create audit event

#### update_action_progress(plan_id UUID, progress INT, note TEXT)
**Purpose**: Update action plan progress
**Logic**:
- Update progress_percentage
- Add note
- Auto-update status based on progress
- Create audit event

### Calculation Triggers

#### calculate_risk_score()
**Trigger**: BEFORE INSERT/UPDATE on risk_profile_items
**Logic**:
```sql
NEW.risk_score := NEW.likelihood_score * NEW.impact_score;
NEW.risk_level := CASE
  WHEN NEW.risk_score >= 15 THEN 'Extreme'
  WHEN NEW.risk_score >= 10 THEN 'High'
  WHEN NEW.risk_score >= 5 THEN 'Moderate'
  ELSE 'Low'
END;
```

#### calculate_psap_weighted_score()
**Trigger**: BEFORE INSERT/UPDATE on psap_assessment_scores
**Logic**:
```sql
NEW.weighted_score := NEW.raw_score * (standard.weight / 100);
```

#### trigger_update_psap_totals()
**Trigger**: AFTER INSERT/UPDATE/DELETE on psap_assessment_scores
**Logic**:
```sql
UPDATE psap_assessments SET
  overall_score = (SELECT SUM(weighted_score) FROM psap_assessment_scores WHERE ...),
  overall_rating = determine_rating(overall_score);
```

---

## Data Normalization Analysis

### Current Normalization: **3NF (Third Normal Form)**

✅ **1NF**: All columns are atomic (no repeating groups)
✅ **2NF**: No partial dependencies (all non-key columns depend on entire PK)
✅ **3NF**: No transitive dependencies

### Denormalization Decisions (Performance Optimizations)

1. **metadata JSONB columns** - Intentional flexibility for changing requirements
2. **Cached aggregates** (overall_score, risk_score) - Calculated via triggers for performance
3. **Region/parcel codes in recommendations** - Duplicated from external system for query efficiency

---

## Index Strategy

### Query Patterns Analysis

1. **Foreign Key Lookups** - Index all FK columns
2. **Status Filtering** - Index all status/state columns
3. **Date Range Queries** - Composite indexes on date pairs
4. **Full-Text Search** (future) - pg_trgm extension enabled
5. **Aggregate Queries** - Covered by views

### Index Types
- **B-Tree** (default) - All standard lookups
- **GIN** - JSONB columns (metadata)
- **Composite** - Multi-column queries (date ranges, unique constraints)

---

## Row Level Security (RLS) Strategy

### Current Implementation: **Simplified (Allow All Authenticated)**

```sql
CREATE POLICY "allow_all_authenticated" ON table_name
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
```

### Recommended Production RLS (Role-Based)

**Example for engagements:**
```sql
-- SELECT: Anyone in their org or assigned to engagement
CREATE POLICY "engagements_select" ON engagements
  FOR SELECT TO authenticated
  USING (
    current_person_role() IN ('Audit Admin', 'Read-Only') OR
    lead_id = current_person() OR
    org_unit_id IN (SELECT org_unit_id FROM people WHERE id = current_person()) OR
    id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person())
  );

-- UPDATE: Admin or engagement lead
CREATE POLICY "engagements_update" ON engagements
  FOR UPDATE TO authenticated
  USING (
    current_person_role() = 'Audit Admin' OR
    lead_id = current_person()
  );
```

---

## Storage Strategy

### Supabase Storage Buckets

1. **compliance-evidence** (Private)
   - Evidence files attached to workpapers
   - Access: Authenticated users only
   - RLS: Check workpaper access

2. **compliance-reports** (Private)
   - Generated audit reports (PDF/Excel)
   - Access: Authenticated users only
   - Retention: 7 years (audit requirements)

---

## API Integration Points

### External System: Legal Case Management System

**Integration Method**: Read-only API
**Endpoint**: `/rest/v1/published_recommendations_view`
**Authentication**: Supabase API key
**Use Case**: Legal team consumes published audit recommendations

**Query Examples**:
```http
GET /rest/v1/published_recommendations_view?status=eq.Published
GET /rest/v1/published_recommendations_view?region_code=eq.REG-001
GET /rest/v1/published_recommendations_view?priority=eq.Critical
```

---

## Performance Considerations

### Query Optimization
1. **Indexes on FKs** - Fast joins
2. **Composite indexes** - Multi-column filters
3. **Views for aggregates** - Pre-computed summaries
4. **Triggers for calculations** - No runtime computation

### Scalability
- **Partitioning** (future): events table by timestamp
- **Archiving** (future): Closed engagements after 2 years
- **Caching** (future): Redis for dashboard KPIs

---

## Missing from Current Code vs Database

Based on code analysis, these tables are referenced but may not exist:

✅ **Already Exist**: people, engagements, notifications
❌ **Missing** (need to create):
- org_units
- engagement_team
- workpapers
- evidence
- findings
- recommendations
- action_plans
- obligations
- controls
- events
- risk_profiles
- risk_profile_items
- psap_standards
- psap_rating_scales
- psap_assessments
- psap_assessment_scores
- strategic_kras
- kra_activities
- kra_activity_quarterly_status

---

## Conclusion

This system implements a **comprehensive audit management workflow** with:
- ✅ Proper normalization (3NF)
- ✅ Strategic denormalization for performance
- ✅ Clear relationships and cascading deletes
- ✅ Audit logging and notifications
- ✅ Role-based access control
- ✅ External system integration
- ✅ Auto-calculations via triggers
- ✅ Reporting views for dashboards

**Next Step**: Create missing tables with proper relationships, indexes, and triggers.
