-- ========================================
-- INCREMENTAL MIGRATION
-- Adds missing tables while preserving existing data
-- Safe to run - uses CREATE TABLE IF NOT EXISTS
-- ========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- MISSING TABLE 1: org_units
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_org_units_parent ON org_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_units_code ON org_units(code);

-- ========================================
-- MISSING TABLE 2: obligations
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_obligations_owner_unit ON obligations(owner_unit_id);

-- ========================================
-- MISSING TABLE 3: controls
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_controls_owner_unit ON controls(owner_unit_id);
CREATE INDEX IF NOT EXISTS idx_controls_obligation ON controls(obligation_id);

-- ========================================
-- MISSING TABLE 4: engagement_team
-- ========================================

CREATE TABLE IF NOT EXISTS engagement_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engagement_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_engagement_team_engagement ON engagement_team(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_team_person ON engagement_team(person_id);

-- ========================================
-- MISSING TABLE 5: workpapers
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_workpapers_engagement ON workpapers(engagement_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_created_by ON workpapers(created_by);

-- ========================================
-- MISSING TABLE 6: evidence
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_evidence_workpaper ON evidence(workpaper_id);

-- ========================================
-- MISSING TABLE 7: findings
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_findings_engagement ON findings(engagement_id);
CREATE INDEX IF NOT EXISTS idx_findings_org_unit ON findings(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_risk_rating ON findings(risk_rating);

-- ========================================
-- MISSING TABLE 8: recommendations
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_recommendations_finding ON recommendations(finding_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_region ON recommendations(region_code);

-- ========================================
-- MISSING TABLE 9: action_plans
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_action_plans_recommendation ON action_plans(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_owner ON action_plans(action_owner_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);

-- ========================================
-- MISSING TABLE 10: events (Audit Log)
-- ========================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES people(id),
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);

-- ========================================
-- MISSING TABLE 11: risk_profiles
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_risk_profiles_org_unit ON risk_profiles(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_date ON risk_profiles(profile_date);

-- ========================================
-- MISSING TABLE 12: risk_profile_items
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_risk_profile_items_profile ON risk_profile_items(risk_profile_id);
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_owner ON risk_profile_items(risk_owner_id);

-- ========================================
-- MISSING TABLE 13: psap_standards
-- ========================================

CREATE TABLE IF NOT EXISTS psap_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- MISSING TABLE 14: psap_rating_scales
-- ========================================

CREATE TABLE IF NOT EXISTS psap_rating_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    rating TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- MISSING TABLE 15: psap_assessments
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_psap_assessments_org_unit ON psap_assessments(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_psap_assessments_period ON psap_assessments(financial_year, quarter);

-- ========================================
-- MISSING TABLE 16: psap_assessment_scores
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_psap_scores_assessment ON psap_assessment_scores(psap_assessment_id);

-- ========================================
-- MISSING TABLE 17: strategic_kras
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_strategic_kras_org_unit ON strategic_kras(org_unit_id);

-- ========================================
-- MISSING TABLE 18: kra_activities
-- ========================================

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

CREATE INDEX IF NOT EXISTS idx_kra_activities_kra ON kra_activities(strategic_kra_id);

-- ========================================
-- MISSING TABLE 19: kra_activity_quarterly_status
-- ========================================

CREATE TABLE IF NOT EXISTS kra_activity_quarterly_status (
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

CREATE INDEX IF NOT EXISTS idx_kra_status_activity ON kra_activity_quarterly_status(kra_activity_id);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get current person ID
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
-- ENABLE RLS ON NEW TABLES
-- ========================================

ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profile_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activity_quarterly_status ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BASIC RLS POLICIES (Allow all authenticated)
-- ========================================

-- Simple policy - allow all authenticated users
-- You can customize these later based on roles

CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON org_units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON obligations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON controls FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON engagement_team FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON workpapers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON evidence FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON findings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON action_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "allow_insert_events" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON risk_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON risk_profile_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON psap_standards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON psap_rating_scales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON psap_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON psap_assessment_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON strategic_kras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON kra_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_authenticated" ON kra_activity_quarterly_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- SEED INITIAL DATA
-- ========================================

-- Default org unit
INSERT INTO org_units (name, code, description)
VALUES ('DLPP Head Office', 'DLPP-HQ', 'Main office')
ON CONFLICT (code) DO NOTHING;

-- 20 PSAP Standards
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

-- PSAP Rating Scales
INSERT INTO psap_rating_scales (min_score, max_score, rating, description) VALUES
(90.00, 100.00, 'Excellent', 'Exceptional performance'),
(75.00, 89.99, 'Good', 'Above average performance'),
(60.00, 74.99, 'Fair', 'Satisfactory performance'),
(0.00, 59.99, 'Poor', 'Below expectations')
ON CONFLICT DO NOTHING;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- All missing tables have been created!
-- Existing data in people, engagements, notifications is preserved.
-- ========================================
