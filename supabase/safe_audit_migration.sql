-- =============================================
-- SAFE AUDIT SYSTEM MIGRATION
-- Adds audit tables WITHOUT dropping ANYTHING
-- Safe to run on database with existing case management tables
-- =============================================

-- Extensions (safe - won't affect existing)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- SHARED TABLES (might already exist from case mgmt)
-- Use CREATE IF NOT EXISTS and ALTER TABLE ADD COLUMN
-- =============================================

-- org_units (might exist from case management)
CREATE TABLE IF NOT EXISTS org_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES org_units(id),
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add audit-specific columns if needed (safe if already exists)
DO $$
BEGIN
    -- Example: Add audit_enabled column if case mgmt doesn't have it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'org_units' AND column_name = 'audit_enabled'
    ) THEN
        ALTER TABLE org_units ADD COLUMN audit_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- people (might exist from case management)
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- Note: case mgmt might use this differently
    org_unit_id UUID REFERENCES org_units(id),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- notifications (might exist)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- events (might be shared audit log)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES people(id),
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- AUDIT-SPECIFIC TABLES (safe to create)
-- =============================================

-- Compliance Module
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT,
    description TEXT,
    owner_unit_id UUID REFERENCES org_units(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    control_type TEXT CHECK (control_type IN ('Preventive', 'Detective', 'Corrective')),
    description TEXT,
    owner_unit_id UUID REFERENCES org_units(id),
    obligation_id UUID REFERENCES obligations(id),
    frequency TEXT,
    effectiveness TEXT CHECK (effectiveness IN ('Effective', 'Partially Effective', 'Ineffective', 'Not Tested')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Engagement Module
CREATE TABLE IF NOT EXISTS engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    scope TEXT,
    objectives TEXT,
    lead_id UUID REFERENCES people(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'Planning' NOT NULL CHECK (status IN ('Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed')),
    org_unit_id UUID REFERENCES org_units(id),
    risk_universe_ref TEXT,
    risk_profile_id UUID, -- FK added later
    psap_assessment_id UUID, -- FK added later
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS engagement_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(engagement_id, person_id)
);

CREATE TABLE IF NOT EXISTS workpapers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    procedure TEXT,
    sample_ref TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    condition_found TEXT NOT NULL,
    criteria TEXT,
    cause TEXT,
    effect TEXT,
    risk_rating TEXT CHECK (risk_rating IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Under Review', 'Verified', 'Closed')),
    org_unit_id UUID REFERENCES org_units(id),
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    target_date DATE,
    status TEXT DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Published', 'Accepted', 'In Progress', 'Completed', 'Overdue')),
    region_code TEXT,
    kra_activity_id UUID, -- FK added later
    legal_case_linked BOOLEAN DEFAULT false NOT NULL,
    legal_case_id TEXT,
    created_by UUID REFERENCES people(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    action_owner_id UUID REFERENCES people(id),
    planned_action TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 NOT NULL CHECK (progress_percentage BETWEEN 0 AND 100),
    actual_completion_date DATE,
    notes TEXT,
    evidence_url TEXT,
    status TEXT DEFAULT 'Not Started' NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Module
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID NOT NULL REFERENCES org_units(id),
    project_name TEXT,
    profile_date DATE NOT NULL,
    prepared_by UUID NOT NULL REFERENCES people(id),
    reviewed_by UUID REFERENCES people(id),
    overall_level TEXT CHECK (overall_level IN ('Low', 'Moderate', 'High', 'Extreme')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_profile_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_profile_id UUID NOT NULL REFERENCES risk_profiles(id) ON DELETE CASCADE,
    context_category TEXT NOT NULL CHECK (context_category IN ('External Environment', 'Compliance', 'Organisational Culture', 'Business Processes', 'Education & Skills')),
    resource_category TEXT NOT NULL CHECK (resource_category IN ('Human Resources', 'Financial Resources', 'Information Resources', 'Infrastructure & Physical Assets')),
    risk_description TEXT NOT NULL,
    likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
    risk_score INTEGER,
    existing_controls TEXT,
    additional_controls TEXT,
    risk_owner_id UUID REFERENCES people(id),
    target_date DATE,
    status TEXT DEFAULT 'Open' NOT NULL CHECK (status IN ('Open', 'Mitigated', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PSAP Module
CREATE TABLE IF NOT EXISTS psap_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_number INTEGER UNIQUE NOT NULL CHECK (standard_number BETWEEN 1 AND 20),
    title TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS psap_rating_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    rating TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS psap_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID NOT NULL REFERENCES org_units(id),
    financial_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    assessment_date DATE NOT NULL,
    completed_by UUID NOT NULL REFERENCES people(id),
    reviewed_by UUID REFERENCES people(id),
    overall_score DECIMAL(5,2),
    overall_rating TEXT CHECK (overall_rating IN ('Excellent', 'Good', 'Fair', 'Poor')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(org_unit_id, financial_year, quarter)
);

CREATE TABLE IF NOT EXISTS psap_assessment_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psap_assessment_id UUID NOT NULL REFERENCES psap_assessments(id) ON DELETE CASCADE,
    psap_standard_id UUID NOT NULL REFERENCES psap_standards(id),
    raw_score DECIMAL(5,2) NOT NULL CHECK (raw_score BETWEEN 0 AND 100),
    weighted_score DECIMAL(5,2),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(psap_assessment_id, psap_standard_id)
);

-- KRA Module
CREATE TABLE IF NOT EXISTS strategic_kras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID NOT NULL REFERENCES org_units(id),
    kra_code TEXT NOT NULL,
    kra_title TEXT NOT NULL,
    purpose TEXT,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS kra_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_kra_id UUID NOT NULL REFERENCES strategic_kras(id) ON DELETE CASCADE,
    activity_code TEXT,
    description TEXT NOT NULL,
    measure TEXT,
    baseline TEXT,
    annual_target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS kra_activity_quarterly_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kra_activity_id UUID NOT NULL REFERENCES kra_activities(id) ON DELETE CASCADE,
    financial_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Ongoing', 'Not Started', 'Delayed', 'Not Measurable')),
    narrative_status TEXT,
    challenges TEXT,
    revision_next_year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(kra_activity_id, financial_year, quarter)
);

-- Add foreign key constraints that reference tables created above
ALTER TABLE engagements
    DROP CONSTRAINT IF EXISTS engagements_risk_profile_id_fkey,
    ADD CONSTRAINT engagements_risk_profile_id_fkey
    FOREIGN KEY (risk_profile_id) REFERENCES risk_profiles(id);

ALTER TABLE engagements
    DROP CONSTRAINT IF EXISTS engagements_psap_assessment_id_fkey,
    ADD CONSTRAINT engagements_psap_assessment_id_fkey
    FOREIGN KEY (psap_assessment_id) REFERENCES psap_assessments(id);

ALTER TABLE recommendations
    DROP CONSTRAINT IF EXISTS recommendations_kra_activity_id_fkey,
    ADD CONSTRAINT recommendations_kra_activity_id_fkey
    FOREIGN KEY (kra_activity_id) REFERENCES kra_activities(id);

-- =============================================
-- INDEXES (only if don't exist)
-- =============================================
-- Note: CREATE INDEX IF NOT EXISTS is supported

CREATE INDEX IF NOT EXISTS idx_org_units_parent ON org_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_units_code ON org_units(code);
CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_org_unit ON people(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_engagements_org_unit ON engagements(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_engagements_lead ON engagements(lead_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON engagements(status);
CREATE INDEX IF NOT EXISTS idx_findings_engagement ON findings(engagement_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_finding ON recommendations(finding_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_recommendation ON action_plans(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_org_unit ON risk_profiles(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_profile ON risk_profile_items(risk_profile_id);
CREATE INDEX IF NOT EXISTS idx_psap_assessments_org_unit ON psap_assessments(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_strategic_kras_org_unit ON strategic_kras(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_kra_activities_kra ON kra_activities(strategic_kra_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION current_person()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT id FROM people WHERE user_id = auth.uid() LIMIT 1);
END;
$$;

CREATE OR REPLACE FUNCTION current_person_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT role FROM people WHERE user_id = auth.uid() LIMIT 1);
END;
$$;

CREATE OR REPLACE FUNCTION calculate_risk_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.likelihood_score IS NOT NULL AND NEW.impact_score IS NOT NULL THEN
    NEW.risk_score := NEW.likelihood_score * NEW.impact_score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_calculate_risk_score ON risk_profile_items;
CREATE TRIGGER trigger_calculate_risk_score
  BEFORE INSERT OR UPDATE OF likelihood_score, impact_score
  ON risk_profile_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_risk_score();

-- =============================================
-- RLS (only for audit tables, don't touch case mgmt)
-- =============================================

ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profile_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE psap_assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kra_activity_quarterly_status ENABLE ROW LEVEL SECURITY;

-- Drop existing audit policies (safe - won't affect case mgmt)
DO $$
DECLARE
  pol RECORD;
  audit_tables TEXT[] := ARRAY[
    'obligations', 'controls', 'engagements', 'engagement_team',
    'workpapers', 'evidence', 'findings', 'recommendations', 'action_plans',
    'risk_profiles', 'risk_profile_items',
    'psap_standards', 'psap_rating_scales', 'psap_assessments', 'psap_assessment_scores',
    'strategic_kras', 'kra_activities', 'kra_activity_quarterly_status'
  ];
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = ANY(audit_tables)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Create simple audit policies
DO $$
DECLARE
  tbl TEXT;
  audit_tables TEXT[] := ARRAY[
    'obligations', 'controls', 'engagements', 'engagement_team',
    'workpapers', 'evidence', 'findings', 'recommendations', 'action_plans',
    'risk_profiles', 'risk_profile_items',
    'psap_standards', 'psap_rating_scales', 'psap_assessments', 'psap_assessment_scores',
    'strategic_kras', 'kra_activities', 'kra_activity_quarterly_status'
  ];
BEGIN
  FOREACH tbl IN ARRAY audit_tables
  LOOP
    EXECUTE format('
      CREATE POLICY %I_authenticated_all
      ON %I
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)
    ', tbl, tbl);
  END LOOP;
END $$;

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO org_units (name, code, description)
VALUES ('DLPP Head Office', 'DLPP-HQ', 'Department of Lands and Physical Planning - Main Office')
ON CONFLICT (code) DO NOTHING;

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

INSERT INTO psap_rating_scales (min_score, max_score, rating, description) VALUES
(90.00, 100.00, 'Excellent', 'Exceptional performance - full compliance'),
(75.00, 89.99, 'Good', 'Above average performance - substantial compliance'),
(60.00, 74.99, 'Fair', 'Satisfactory performance - partial compliance'),
(0.00, 59.99, 'Poor', 'Below expectations - low/non-compliance')
ON CONFLICT DO NOTHING;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
SELECT 'Audit system migration complete - safe for shared database' AS status;
