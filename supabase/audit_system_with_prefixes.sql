-- =============================================
-- AUDIT SYSTEM MIGRATION - WITH TABLE PREFIXES
-- Safe for shared database with 86+ existing tables
-- All audit tables prefixed with "audit_"
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- AUDIT SYSTEM TABLES (All prefixed with audit_)
-- =============================================

-- Audit Engagements (renamed from engagements to avoid conflict)
CREATE TABLE IF NOT EXISTS audit_engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    scope TEXT,
    objectives TEXT,
    lead_id UUID REFERENCES people(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'Planning' NOT NULL CHECK (status IN ('Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed')),
    org_unit_id UUID, -- Will reference after creating audit_org_units
    risk_universe_ref TEXT,
    risk_profile_id UUID,
    psap_assessment_id UUID,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_engagement_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(engagement_id, person_id)
);

CREATE TABLE IF NOT EXISTS audit_workpapers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    procedure TEXT,
    sample_ref TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workpaper_id UUID NOT NULL REFERENCES audit_workpapers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    condition_found TEXT NOT NULL,
    criteria TEXT,
    cause TEXT,
    effect TEXT,
    risk_rating TEXT CHECK (risk_rating IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Under Review', 'Verified', 'Closed')),
    org_unit_id UUID,
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    target_date DATE,
    status TEXT DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Published', 'Accepted', 'In Progress', 'Completed', 'Overdue')),
    region_code TEXT,
    kra_activity_id UUID,
    legal_case_linked BOOLEAN DEFAULT false NOT NULL,
    legal_case_id UUID REFERENCES cases(id), -- Link to existing cases table
    created_by UUID REFERENCES people(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES audit_recommendations(id) ON DELETE CASCADE,
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

-- Compliance Module
CREATE TABLE IF NOT EXISTS audit_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT,
    description TEXT,
    owner_unit_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    control_type TEXT CHECK (control_type IN ('Preventive', 'Detective', 'Corrective')),
    description TEXT,
    owner_unit_id UUID,
    obligation_id UUID REFERENCES audit_obligations(id),
    frequency TEXT,
    effectiveness TEXT CHECK (effectiveness IN ('Effective', 'Partially Effective', 'Ineffective', 'Not Tested')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Module
CREATE TABLE IF NOT EXISTS audit_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID,
    project_name TEXT,
    profile_date DATE NOT NULL,
    prepared_by UUID NOT NULL REFERENCES people(id),
    reviewed_by UUID REFERENCES people(id),
    overall_level TEXT CHECK (overall_level IN ('Low', 'Moderate', 'High', 'Extreme')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_risk_profile_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_profile_id UUID NOT NULL REFERENCES audit_risk_profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS audit_psap_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_number INTEGER UNIQUE NOT NULL CHECK (standard_number BETWEEN 1 AND 20),
    title TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_psap_rating_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    rating TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_psap_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID,
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

CREATE TABLE IF NOT EXISTS audit_psap_assessment_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psap_assessment_id UUID NOT NULL REFERENCES audit_psap_assessments(id) ON DELETE CASCADE,
    psap_standard_id UUID NOT NULL REFERENCES audit_psap_standards(id),
    raw_score DECIMAL(5,2) NOT NULL CHECK (raw_score BETWEEN 0 AND 100),
    weighted_score DECIMAL(5,2),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(psap_assessment_id, psap_standard_id)
);

-- KRA Module
CREATE TABLE IF NOT EXISTS audit_strategic_kras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_unit_id UUID,
    kra_code TEXT NOT NULL,
    kra_title TEXT NOT NULL,
    purpose TEXT,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_kra_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_kra_id UUID NOT NULL REFERENCES audit_strategic_kras(id) ON DELETE CASCADE,
    activity_code TEXT,
    description TEXT NOT NULL,
    measure TEXT,
    baseline TEXT,
    annual_target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_kra_activity_quarterly_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kra_activity_id UUID NOT NULL REFERENCES audit_kra_activities(id) ON DELETE CASCADE,
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

-- Audit Events (separate from existing events table)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES people(id),
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE audit_engagements
    DROP CONSTRAINT IF EXISTS audit_engagements_risk_profile_id_fkey,
    ADD CONSTRAINT audit_engagements_risk_profile_id_fkey
    FOREIGN KEY (risk_profile_id) REFERENCES audit_risk_profiles(id);

ALTER TABLE audit_engagements
    DROP CONSTRAINT IF EXISTS audit_engagements_psap_assessment_id_fkey,
    ADD CONSTRAINT audit_engagements_psap_assessment_id_fkey
    FOREIGN KEY (psap_assessment_id) REFERENCES audit_psap_assessments(id);

ALTER TABLE audit_recommendations
    DROP CONSTRAINT IF EXISTS audit_recommendations_kra_activity_id_fkey,
    ADD CONSTRAINT audit_recommendations_kra_activity_id_fkey
    FOREIGN KEY (kra_activity_id) REFERENCES audit_kra_activities(id);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_engagements_lead ON audit_engagements(lead_id);
CREATE INDEX IF NOT EXISTS idx_audit_engagements_status ON audit_engagements(status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_engagement ON audit_findings(engagement_id);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_finding ON audit_recommendations(finding_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_plans_recommendation ON audit_action_plans(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_profiles_prepared_by ON audit_risk_profiles(prepared_by);
CREATE INDEX IF NOT EXISTS idx_audit_risk_profile_items_profile ON audit_risk_profile_items(risk_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_psap_assessments_period ON audit_psap_assessments(financial_year, quarter);
CREATE INDEX IF NOT EXISTS idx_audit_kra_activities_kra ON audit_kra_activities(strategic_kra_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION audit_calculate_risk_score()
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

DROP TRIGGER IF EXISTS trigger_audit_calculate_risk_score ON audit_risk_profile_items;
CREATE TRIGGER trigger_audit_calculate_risk_score
  BEFORE INSERT OR UPDATE OF likelihood_score, impact_score
  ON audit_risk_profile_items
  FOR EACH ROW
  EXECUTE FUNCTION audit_calculate_risk_score();

CREATE OR REPLACE FUNCTION audit_calculate_psap_weighted_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  standard_weight DECIMAL(5,2);
BEGIN
  SELECT weight INTO standard_weight
  FROM audit_psap_standards
  WHERE id = NEW.psap_standard_id;

  IF standard_weight IS NOT NULL THEN
    NEW.weighted_score := ROUND((NEW.raw_score * standard_weight / 100), 2);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_calculate_psap_weighted_score ON audit_psap_assessment_scores;
CREATE TRIGGER trigger_audit_calculate_psap_weighted_score
  BEFORE INSERT OR UPDATE OF raw_score
  ON audit_psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION audit_calculate_psap_weighted_score();

CREATE OR REPLACE FUNCTION audit_update_psap_assessment_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  assessment_id UUID;
  total_score DECIMAL(5,2);
  rating TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    assessment_id := OLD.psap_assessment_id;
  ELSE
    assessment_id := NEW.psap_assessment_id;
  END IF;

  SELECT COALESCE(SUM(weighted_score), 0) INTO total_score
  FROM audit_psap_assessment_scores
  WHERE psap_assessment_id = assessment_id;

  SELECT audit_psap_rating_scales.rating INTO rating
  FROM audit_psap_rating_scales
  WHERE total_score >= min_score AND total_score <= max_score
  LIMIT 1;

  UPDATE audit_psap_assessments
  SET overall_score = total_score,
      overall_rating = COALESCE(rating, 'Poor'),
      updated_at = NOW()
  WHERE id = assessment_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_update_psap_totals ON audit_psap_assessment_scores;
CREATE TRIGGER trigger_audit_update_psap_totals
  AFTER INSERT OR UPDATE OF weighted_score OR DELETE
  ON audit_psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION audit_update_psap_assessment_totals();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE audit_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_engagement_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_profile_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_psap_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_psap_rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_psap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_psap_assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_strategic_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_kra_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_kra_activity_quarterly_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Drop existing audit policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename LIKE 'audit_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Create simple policies (allow all authenticated)
DO $$
DECLARE
  tbl TEXT;
  audit_tables TEXT[] := ARRAY[
    'audit_engagements', 'audit_engagement_team', 'audit_workpapers', 'audit_evidence',
    'audit_findings', 'audit_recommendations', 'audit_action_plans',
    'audit_obligations', 'audit_controls',
    'audit_risk_profiles', 'audit_risk_profile_items',
    'audit_psap_standards', 'audit_psap_rating_scales', 'audit_psap_assessments', 'audit_psap_assessment_scores',
    'audit_strategic_kras', 'audit_kra_activities', 'audit_kra_activity_quarterly_status'
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

-- Special policies for audit_events
CREATE POLICY audit_events_select ON audit_events FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_events_insert ON audit_events FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO audit_psap_standards (standard_number, title, weight, description) VALUES
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

INSERT INTO audit_psap_rating_scales (min_score, max_score, rating, description) VALUES
(90.00, 100.00, 'Excellent', 'Exceptional performance - full compliance'),
(75.00, 89.99, 'Good', 'Above average performance - substantial compliance'),
(60.00, 74.99, 'Fair', 'Satisfactory performance - partial compliance'),
(0.00, 59.99, 'Poor', 'Below expectations - low/non-compliance')
ON CONFLICT DO NOTHING;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
SELECT 'Audit system with table prefixes deployed successfully!' AS status,
       'All audit tables prefixed with audit_ to avoid conflicts' AS note,
       'Safe for shared database with 86+ existing tables' AS safety_note;
