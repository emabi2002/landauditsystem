-- ========================================
-- DLPP Internal Audit & Compliance System
-- Fresh Database Setup (Complete Schema)
-- ========================================

-- Clean up existing policies first (if any)
DROP POLICY IF EXISTS "engagements_select" ON engagements;
DROP POLICY IF EXISTS "engagements_update" ON engagements;
DROP POLICY IF EXISTS "findings_select" ON findings;
DROP POLICY IF EXISTS "workpapers_select" ON workpapers;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- STEP 1: CORE REFERENCE TABLES
-- ========================================

-- Organization Units
CREATE TABLE IF NOT EXISTS org_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES org_units(id),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- People
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    org_unit_id UUID REFERENCES org_units(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check role constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'people_role_check'
    ) THEN
        ALTER TABLE people ADD CONSTRAINT people_role_check
        CHECK (role IN ('Audit Admin', 'Audit Manager', 'Auditor', 'Action Owner', 'Read-Only', 'System Integrator'));
    END IF;
END $$;

-- ========================================
-- STEP 2: AUDIT CORE TABLES
-- ========================================

-- Engagements
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    scope TEXT,
    objectives TEXT,
    lead_id UUID REFERENCES people(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed')),
    org_unit_id UUID REFERENCES org_units(id),
    risk_universe_ref TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement Team
CREATE TABLE IF NOT EXISTS engagement_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engagement_id, person_id)
);

-- Workpapers
CREATE TABLE IF NOT EXISTS workpapers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    procedure TEXT,
    sample_ref TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workpaper_id UUID REFERENCES workpapers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Findings
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    condition_found TEXT NOT NULL,
    criteria TEXT,
    cause TEXT,
    effect TEXT,
    risk_rating TEXT CHECK (risk_rating IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Under Review', 'Verified', 'Closed')),
    org_unit_id UUID REFERENCES org_units(id),
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Accepted', 'In Progress', 'Completed', 'Overdue')),
    region_code TEXT,
    created_by UUID REFERENCES people(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Plans
CREATE TABLE IF NOT EXISTS action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    action_owner_id UUID REFERENCES people(id),
    planned_action TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    actual_completion_date DATE,
    notes TEXT,
    evidence_url TEXT,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 3: COMPLIANCE TABLES
-- ========================================

-- Obligations
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT,
    description TEXT,
    owner_unit_id UUID REFERENCES org_units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controls
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    control_type TEXT CHECK (control_type IN ('Preventive', 'Detective', 'Corrective')),
    description TEXT,
    owner_unit_id UUID REFERENCES org_units(id),
    obligation_id UUID REFERENCES obligations(id),
    frequency TEXT,
    effectiveness TEXT CHECK (effectiveness IN ('Effective', 'Partially Effective', 'Ineffective', 'Not Tested')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 4: RISK & GOVERNANCE TABLES
-- ========================================

-- Risk Profiles
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID REFERENCES org_units(id) NOT NULL,
    project_name TEXT,
    profile_date DATE NOT NULL,
    prepared_by UUID REFERENCES people(id) NOT NULL,
    reviewed_by UUID REFERENCES people(id),
    overall_level TEXT CHECK (overall_level IN ('Low', 'Moderate', 'High', 'Extreme')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Profile Items
CREATE TABLE IF NOT EXISTS risk_profile_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_profile_id UUID REFERENCES risk_profiles(id) ON DELETE CASCADE NOT NULL,
    context_category TEXT NOT NULL,
    resource_category TEXT NOT NULL,
    risk_description TEXT NOT NULL,
    likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
    risk_score INTEGER,
    existing_controls TEXT,
    additional_controls TEXT,
    risk_owner_id UUID REFERENCES people(id),
    target_date DATE,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Mitigated', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSAP Standards (20 Financial & Governance Standards)
CREATE TABLE IF NOT EXISTS psap_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PSAP Assessments
CREATE TABLE IF NOT EXISTS psap_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID REFERENCES org_units(id) NOT NULL,
    financial_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    assessment_date DATE NOT NULL,
    completed_by UUID REFERENCES people(id) NOT NULL,
    reviewed_by UUID REFERENCES people(id),
    overall_score DECIMAL(5,2),
    overall_rating TEXT CHECK (overall_rating IN ('Excellent', 'Good', 'Fair', 'Poor')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_unit_id, financial_year, quarter)
);

-- PSAP Assessment Scores
CREATE TABLE IF NOT EXISTS psap_assessment_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psap_assessment_id UUID REFERENCES psap_assessments(id) ON DELETE CASCADE NOT NULL,
    psap_standard_id UUID REFERENCES psap_standards(id) NOT NULL,
    raw_score DECIMAL(5,2) NOT NULL CHECK (raw_score BETWEEN 0 AND 100),
    weighted_score DECIMAL(5,2),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(psap_assessment_id, psap_standard_id)
);

-- Strategic KRAs
CREATE TABLE IF NOT EXISTS strategic_kras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID REFERENCES org_units(id) NOT NULL,
    kra_code TEXT NOT NULL,
    kra_title TEXT NOT NULL,
    purpose TEXT,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KRA Activities
CREATE TABLE IF NOT EXISTS kra_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_kra_id UUID REFERENCES strategic_kras(id) ON DELETE CASCADE NOT NULL,
    activity_code TEXT,
    description TEXT NOT NULL,
    measure TEXT,
    baseline TEXT,
    annual_target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KRA Activity Status Updates
CREATE TABLE IF NOT EXISTS kra_activity_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kra_activity_id UUID REFERENCES kra_activities(id) ON DELETE CASCADE NOT NULL,
    financial_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Ongoing', 'Not Started', 'Delayed', 'Not Measurable')),
    narrative_status TEXT,
    challenges TEXT,
    revision_next_year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kra_activity_id, financial_year, quarter)
);

-- ========================================
-- STEP 5: AUDIT LOG & NOTIFICATIONS
-- ========================================

-- Events (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES people(id),
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 6: CREATE INDEXES
-- ========================================

-- Org Units
CREATE INDEX IF NOT EXISTS idx_org_units_parent ON org_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_units_code ON org_units(code);

-- People
CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_role ON people(role);
CREATE INDEX IF NOT EXISTS idx_people_org_unit ON people(org_unit_id);

-- Engagements
CREATE INDEX IF NOT EXISTS idx_engagements_lead ON engagements(lead_id);
CREATE INDEX IF NOT EXISTS idx_engagements_org_unit ON engagements(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON engagements(status);
CREATE INDEX IF NOT EXISTS idx_engagements_dates ON engagements(start_date, end_date);

-- Engagement Team
CREATE INDEX IF NOT EXISTS idx_engagement_team_engagement ON engagement_team(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_team_person ON engagement_team(person_id);

-- Workpapers
CREATE INDEX IF NOT EXISTS idx_workpapers_engagement ON workpapers(engagement_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_created_by ON workpapers(created_by);

-- Evidence
CREATE INDEX IF NOT EXISTS idx_evidence_workpaper ON evidence(workpaper_id);

-- Findings
CREATE INDEX IF NOT EXISTS idx_findings_engagement ON findings(engagement_id);
CREATE INDEX IF NOT EXISTS idx_findings_org_unit ON findings(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_risk_rating ON findings(risk_rating);

-- Recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_finding ON recommendations(finding_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_region ON recommendations(region_code);

-- Action Plans
CREATE INDEX IF NOT EXISTS idx_action_plans_recommendation ON action_plans(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_owner ON action_plans(action_owner_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);

-- Risk Profiles
CREATE INDEX IF NOT EXISTS idx_risk_profiles_org_unit ON risk_profiles(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_date ON risk_profiles(profile_date);

-- Risk Profile Items
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_profile ON risk_profile_items(risk_profile_id);
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_owner ON risk_profile_items(risk_owner_id);

-- PSAP
CREATE INDEX IF NOT EXISTS idx_psap_assessments_org_unit ON psap_assessments(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_psap_assessments_period ON psap_assessments(financial_year, quarter);
CREATE INDEX IF NOT EXISTS idx_psap_scores_assessment ON psap_assessment_scores(psap_assessment_id);

-- KRAs
CREATE INDEX IF NOT EXISTS idx_strategic_kras_org_unit ON strategic_kras(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_kra_activities_kra ON kra_activities(strategic_kra_id);
CREATE INDEX IF NOT EXISTS idx_kra_status_activity ON kra_activity_status(kra_activity_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_person ON notifications(person_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ========================================
-- STEP 7: HELPER FUNCTIONS
-- ========================================

-- Get current person ID from auth
CREATE OR REPLACE FUNCTION current_person()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM people WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current person role
CREATE OR REPLACE FUNCTION current_person_role()
RETURNS TEXT AS $$
DECLARE
  person RECORD;
BEGIN
  SELECT * INTO person FROM people WHERE user_id = auth.uid() LIMIT 1;
  IF person IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN person.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profile_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activity_status ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 9: RLS POLICIES (Basic - All Authenticated Users)
-- ========================================

-- For now, allow all authenticated users to read/write
-- You can customize these policies based on roles later

-- Org Units
CREATE POLICY "org_units_all" ON org_units FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- People
CREATE POLICY "people_select" ON people FOR SELECT TO authenticated USING (true);
CREATE POLICY "people_update" ON people FOR UPDATE TO authenticated USING (id = current_person());

-- Engagements
CREATE POLICY "engagements_all" ON engagements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Engagement Team
CREATE POLICY "engagement_team_all" ON engagement_team FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Workpapers
CREATE POLICY "workpapers_all" ON workpapers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Evidence
CREATE POLICY "evidence_all" ON evidence FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Findings
CREATE POLICY "findings_all" ON findings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Recommendations
CREATE POLICY "recommendations_all" ON recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Action Plans
CREATE POLICY "action_plans_all" ON action_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Obligations
CREATE POLICY "obligations_all" ON obligations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Controls
CREATE POLICY "controls_all" ON controls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Risk Profiles
CREATE POLICY "risk_profiles_all" ON risk_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Risk Profile Items
CREATE POLICY "risk_profile_items_all" ON risk_profile_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PSAP Standards
CREATE POLICY "psap_standards_all" ON psap_standards FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PSAP Assessments
CREATE POLICY "psap_assessments_all" ON psap_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PSAP Scores
CREATE POLICY "psap_scores_all" ON psap_assessment_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Strategic KRAs
CREATE POLICY "strategic_kras_all" ON strategic_kras FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- KRA Activities
CREATE POLICY "kra_activities_all" ON kra_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- KRA Status
CREATE POLICY "kra_status_all" ON kra_activity_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Events
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated USING (person_id = current_person());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated USING (person_id = current_person());

-- ========================================
-- STEP 10: INSERT INITIAL DATA
-- ========================================

-- Create default org unit
INSERT INTO org_units (name, code, description)
VALUES ('DLPP Head Office', 'DLPP-HQ', 'Main office')
ON CONFLICT (code) DO NOTHING;

-- Insert 20 PSAP Standards
INSERT INTO psap_standards (standard_number, title, weight, description) VALUES
(1, 'Budget Preparation', 5.00, 'Quality and timeliness of budget preparation'),
(2, 'Budget Approval', 5.00, 'Proper approval process for budgets'),
(3, 'Revenue Collection', 5.00, 'Effectiveness of revenue collection'),
(4, 'Expenditure Control', 5.00, 'Controls over expenditure'),
(5, 'Cash Management', 5.00, 'Proper management of cash resources'),
(6, 'Asset Management', 5.00, 'Management of assets and inventory'),
(7, 'Procurement Process', 5.00, 'Compliance with procurement procedures'),
(8, 'Contract Management', 5.00, 'Management of contracts'),
(9, 'Debt Management', 5.00, 'Management of debt obligations'),
(10, 'Accounting Records', 5.00, 'Maintenance of proper accounting records'),
(11, 'Financial Reporting', 5.00, 'Quality of financial reporting'),
(12, 'Internal Audit', 5.00, 'Effectiveness of internal audit function'),
(13, 'Risk Management', 5.00, 'Risk management framework'),
(14, 'Compliance', 5.00, 'Compliance with laws and regulations'),
(15, 'Human Resource Management', 5.00, 'HR policies and practices'),
(16, 'Performance Management', 5.00, 'Performance monitoring and evaluation'),
(17, 'Strategic Planning', 5.00, 'Strategic planning processes'),
(18, 'Stakeholder Engagement', 5.00, 'Engagement with stakeholders'),
(19, 'Transparency', 5.00, 'Transparency in operations'),
(20, 'Accountability', 5.00, 'Accountability mechanisms')
ON CONFLICT (standard_number) DO NOTHING;

-- ========================================
-- SUCCESS!
-- ========================================
-- All tables, indexes, RLS policies, and initial data have been created.
-- Next steps:
-- 1. Create storage buckets: compliance-evidence, compliance-reports
-- 2. Enable email authentication
-- 3. Create your first admin user
-- ========================================
