-- =====================================================
-- Migration 003: Risk Profile, PSAP Scorecard, and KRA/Workplan Modules
-- =====================================================
-- This migration extends the Lands Audit & Compliance system with:
-- 1. Risk Management (Risk Profile Matrix)
-- 2. PSAP Financial & Governance Scorecard
-- 3. KRA / Workplan Performance Tracking
-- =====================================================

-- =====================================================
-- 1. RISK PROFILE MODULE
-- =====================================================

-- Risk profile header
CREATE TABLE IF NOT EXISTS risk_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_unit_id   uuid NOT NULL REFERENCES org_units(id),
  project_name  text,
  profile_date  date NOT NULL,
  prepared_by   uuid NOT NULL REFERENCES people(id),
  reviewed_by   uuid REFERENCES people(id),
  overall_level text CHECK (overall_level IN ('Low', 'Moderate', 'High', 'Extreme')),
  remarks       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Risk profile matrix items (cells in the risk matrix)
CREATE TABLE IF NOT EXISTS risk_profile_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_profile_id      uuid NOT NULL REFERENCES risk_profiles(id) ON DELETE CASCADE,
  context_category     text NOT NULL,  -- 'External Environment', 'Compliance', 'Organisational Culture', etc.
  resource_category    text NOT NULL,  -- 'Human Resources', 'Financial Resources', 'Information Resources', etc.
  risk_description     text NOT NULL,
  likelihood_score     integer CHECK (likelihood_score BETWEEN 1 AND 5),
  impact_score         integer CHECK (impact_score BETWEEN 1 AND 5),
  risk_score           integer,        -- likelihood * impact (1-25)
  risk_level           text CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Extreme')),
  existing_controls    text,
  additional_controls  text,
  risk_owner_id        uuid REFERENCES org_units(id),
  target_date          date,
  status               text DEFAULT 'Open' CHECK (status IN ('Open', 'Mitigating', 'Closed')),
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- Trigger to auto-calculate risk score and level
CREATE OR REPLACE FUNCTION calculate_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate risk score
  NEW.risk_score := NEW.likelihood_score * NEW.impact_score;

  -- Determine risk level based on score
  NEW.risk_level := CASE
    WHEN NEW.risk_score >= 15 THEN 'Extreme'
    WHEN NEW.risk_score >= 10 THEN 'High'
    WHEN NEW.risk_score >= 5 THEN 'Moderate'
    ELSE 'Low'
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_risk_score
  BEFORE INSERT OR UPDATE OF likelihood_score, impact_score
  ON risk_profile_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_risk_score();

-- =====================================================
-- 2. PSAP FINANCIAL & GOVERNANCE SCORECARD MODULE
-- =====================================================

-- PSAP standards master (20 standards)
CREATE TABLE IF NOT EXISTS psap_standards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_no integer NOT NULL UNIQUE,
  title       text NOT NULL,
  description text NOT NULL,
  weighting   numeric(4,2) NOT NULL,
  category    text CHECK (category IN ('Financial', 'Governance', 'Both')),
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- PSAP rating scale (interpretation of overall scores)
CREATE TABLE IF NOT EXISTS psap_rating_scales (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_score     numeric(5,2) NOT NULL,
  max_score     numeric(5,2) NOT NULL,
  rating_label  text NOT NULL,
  description   text,
  color_code    text,  -- For UI display (e.g., 'green', 'yellow', 'red')
  created_at    timestamptz DEFAULT now()
);

-- PSAP assessment header (quarterly assessments)
CREATE TABLE IF NOT EXISTS psap_assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_unit_id     uuid NOT NULL REFERENCES org_units(id),
  financial_year  integer NOT NULL,
  quarter         integer NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  assessment_date date NOT NULL,
  completed_by    uuid NOT NULL REFERENCES people(id),
  reviewed_by     uuid REFERENCES people(id),
  overall_score   numeric(6,2),
  overall_rating  text,
  comments        text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(org_unit_id, financial_year, quarter)
);

-- PSAP assessment scores (one record per standard per assessment)
CREATE TABLE IF NOT EXISTS psap_assessment_scores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psap_assessment_id uuid NOT NULL REFERENCES psap_assessments(id) ON DELETE CASCADE,
  psap_standard_id  uuid NOT NULL REFERENCES psap_standards(id),
  raw_score         numeric(4,1) NOT NULL CHECK (raw_score BETWEEN 0 AND 10),
  weighted_score    numeric(6,2),
  comments          text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(psap_assessment_id, psap_standard_id)
);

-- Trigger to auto-calculate weighted score
CREATE OR REPLACE FUNCTION calculate_psap_weighted_score()
RETURNS TRIGGER AS $$
DECLARE
  standard_weighting numeric(4,2);
BEGIN
  -- Get the weighting for this standard
  SELECT weighting INTO standard_weighting
  FROM psap_standards
  WHERE id = NEW.psap_standard_id;

  -- Calculate weighted score
  NEW.weighted_score := NEW.raw_score * standard_weighting;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_psap_weighted_score
  BEFORE INSERT OR UPDATE OF raw_score
  ON psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_psap_weighted_score();

-- Function to calculate overall PSAP assessment score and rating
CREATE OR REPLACE FUNCTION update_psap_assessment_totals(assessment_id uuid)
RETURNS void AS $$
DECLARE
  total_score numeric(6,2);
  rating_label text;
BEGIN
  -- Calculate overall score (sum of all weighted scores)
  SELECT COALESCE(SUM(weighted_score), 0)
  INTO total_score
  FROM psap_assessment_scores
  WHERE psap_assessment_id = assessment_id;

  -- Determine rating based on score
  SELECT r.rating_label
  INTO rating_label
  FROM psap_rating_scales r
  WHERE total_score >= r.min_score AND total_score <= r.max_score
  LIMIT 1;

  -- Update assessment
  UPDATE psap_assessments
  SET overall_score = total_score,
      overall_rating = rating_label,
      updated_at = now()
  WHERE id = assessment_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update assessment totals when scores change
CREATE OR REPLACE FUNCTION trigger_update_psap_totals()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_psap_assessment_totals(
    COALESCE(NEW.psap_assessment_id, OLD.psap_assessment_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_psap_score_change
  AFTER INSERT OR UPDATE OR DELETE
  ON psap_assessment_scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_psap_totals();

-- =====================================================
-- 3. KRA / WORKPLAN PERFORMANCE MODULE
-- =====================================================

-- Strategic KRA header
CREATE TABLE IF NOT EXISTS strategic_kras (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_unit_id    uuid NOT NULL REFERENCES org_units(id),
  kra_code       text NOT NULL,
  kra_title      text NOT NULL,
  purpose        text,
  start_year     integer NOT NULL,
  end_year       integer,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE(org_unit_id, kra_code, start_year)
);

-- Activities under each KRA
CREATE TABLE IF NOT EXISTS kra_activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_kra_id uuid NOT NULL REFERENCES strategic_kras(id) ON DELETE CASCADE,
  activity_code   text,
  description     text NOT NULL,
  measure         text,
  baseline        text,
  annual_target   text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Quarterly status tracking
CREATE TABLE IF NOT EXISTS kra_activity_quarterly_status (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kra_activity_id    uuid NOT NULL REFERENCES kra_activities(id) ON DELETE CASCADE,
  financial_year     integer NOT NULL,
  quarter            integer NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  status             text NOT NULL CHECK (status IN ('Completed', 'Ongoing', 'Not Started', 'Not Measurable', 'Delayed')),
  narrative_status   text,
  challenges         text,
  revision_next_year text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  UNIQUE(kra_activity_id, financial_year, quarter)
);

-- =====================================================
-- 4. INTEGRATION WITH EXISTING AUDIT TABLES
-- =====================================================

-- Add foreign keys to engagements table
ALTER TABLE engagements
  ADD COLUMN IF NOT EXISTS risk_profile_id uuid REFERENCES risk_profiles(id),
  ADD COLUMN IF NOT EXISTS psap_assessment_id uuid REFERENCES psap_assessments(id);

-- Add foreign key to recommendations table
ALTER TABLE recommendations
  ADD COLUMN IF NOT EXISTS kra_activity_id uuid REFERENCES kra_activities(id);

-- =====================================================
-- 5. SEED DATA
-- =====================================================

-- Seed PSAP Standards (20 standards)
INSERT INTO psap_standards (standard_no, title, description, weighting, category) VALUES
(1, 'Annual Budget Preparation', 'Organization prepares comprehensive annual budget aligned with strategic plans', 1.0, 'Financial'),
(2, 'Budget Approval Process', 'Budget is reviewed and approved by appropriate governance bodies', 0.8, 'Governance'),
(3, 'Financial Reporting', 'Monthly and quarterly financial reports are prepared and reviewed', 1.0, 'Financial'),
(4, 'Variance Analysis', 'Budget vs actual variances are analyzed and explained', 0.9, 'Financial'),
(5, 'Internal Controls', 'Documented internal controls for financial transactions', 1.0, 'Both'),
(6, 'Segregation of Duties', 'Clear segregation of duties in financial processes', 0.9, 'Both'),
(7, 'Authorization Limits', 'Defined and documented authorization limits for expenditures', 0.8, 'Governance'),
(8, 'Procurement Compliance', 'Adherence to procurement policies and procedures', 1.0, 'Both'),
(9, 'Asset Management', 'Asset register maintained and reconciled regularly', 0.9, 'Financial'),
(10, 'Cash Management', 'Effective cash flow management and forecasting', 0.8, 'Financial'),
(11, 'Revenue Management', 'Revenue collection and tracking mechanisms', 0.9, 'Financial'),
(12, 'Payroll Controls', 'Robust payroll processing and verification controls', 1.0, 'Both'),
(13, 'Board/Committee Effectiveness', 'Active and effective governance committees', 0.8, 'Governance'),
(14, 'Risk Management Framework', 'Documented risk management policies and procedures', 0.9, 'Governance'),
(15, 'Compliance Monitoring', 'Regular monitoring of legal and regulatory compliance', 1.0, 'Both'),
(16, 'Audit Function', 'Effective internal and external audit processes', 1.0, 'Governance'),
(17, 'Financial Policies', 'Comprehensive and up-to-date financial policies', 0.8, 'Governance'),
(18, 'Transparency & Disclosure', 'Transparent financial reporting and stakeholder communication', 0.9, 'Governance'),
(19, 'Performance Management', 'KPI tracking and performance review systems', 0.8, 'Governance'),
(20, 'Document Management', 'Organized financial record keeping and archiving', 0.7, 'Both');

-- Seed PSAP Rating Scales
INSERT INTO psap_rating_scales (min_score, max_score, rating_label, description, color_code) VALUES
(18.0, 20.0, 'Full Compliance', 'Organization demonstrates full compliance with all standards', 'green'),
(15.0, 17.9, 'Substantial Compliance', 'Organization meets most standards with minor gaps', 'lime'),
(12.0, 14.9, 'Partial Compliance', 'Organization meets some standards but has significant gaps', 'yellow'),
(9.0, 11.9, 'Low Compliance', 'Organization has major deficiencies in meeting standards', 'orange'),
(0.0, 8.9, 'Non-Compliance', 'Organization fails to meet minimum standards', 'red');

-- Seed sample KRA structure for Governance & Compliance Unit
DO $
DECLARE
  v_org_unit_id uuid;
  v_kra_id uuid;
  v_activity_id uuid;
BEGIN
  -- Get or create Governance & Compliance Unit
  INSERT INTO org_units (code, name, description, parent_id)
  VALUES ('GCU', 'Governance & Compliance Unit', 'Division responsible for governance and compliance oversight', NULL)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_org_unit_id;

  -- Create KRA 1: Management of Governance and Compliance Unit
  INSERT INTO strategic_kras (org_unit_id, kra_code, kra_title, purpose, start_year, end_year)
  VALUES (v_org_unit_id, '1', 'Management of Governance and Compliance Unit',
          'Ensure effective oversight and management of governance and compliance functions', 2025, 2030)
  RETURNING id INTO v_kra_id;

  -- Add activities for KRA 1
  INSERT INTO kra_activities (strategic_kra_id, activity_code, description, measure, annual_target) VALUES
  (v_kra_id, 'a)', 'Conduct DLPP audits and investigations', 'Number of audits completed', '6 routine audits + ad-hoc'),
  (v_kra_id, 'b)', 'Validate the reliability and integrity of information being reported', 'Compliance rate', '100%'),
  (v_kra_id, 'c)', 'Monitor corporate compliance with policies, procedures, laws, and regulations', 'Compliance monitoring reports', 'Quarterly'),
  (v_kra_id, 'd)', 'Safeguard intellectual and physical assets', 'Asset verification audits', 'Annual'),
  (v_kra_id, 'e)', 'Assess the economy, efficiency, and effectiveness of DLPP programs and operations', 'Performance audit reports', '2 per year'),
  (v_kra_id, 'f)', 'Advise management on risk management, internal control, and governance', 'Advisory notes issued', 'As needed');
END $$;

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_risk_profiles_org_unit ON risk_profiles(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_date ON risk_profiles(profile_date);
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_profile ON risk_profile_items(risk_profile_id);
CREATE INDEX IF NOT EXISTS idx_risk_profile_items_level ON risk_profile_items(risk_level);

CREATE INDEX IF NOT EXISTS idx_psap_assessments_org_unit ON psap_assessments(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_psap_assessments_year_quarter ON psap_assessments(financial_year, quarter);
CREATE INDEX IF NOT EXISTS idx_psap_scores_assessment ON psap_assessment_scores(psap_assessment_id);

CREATE INDEX IF NOT EXISTS idx_strategic_kras_org_unit ON strategic_kras(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_kra_activities_kra ON kra_activities(strategic_kra_id);
CREATE INDEX IF NOT EXISTS idx_kra_status_activity ON kra_activity_quarterly_status(kra_activity_id);
CREATE INDEX IF NOT EXISTS idx_kra_status_year_quarter ON kra_activity_quarterly_status(financial_year, quarter);

-- =====================================================
-- 7. VIEWS FOR REPORTING
-- =====================================================

-- View: Current Risk Profile Summary by Org Unit
CREATE OR REPLACE VIEW v_current_risk_summary AS
SELECT
  ou.code AS org_unit_code,
  ou.name AS org_unit_name,
  rp.profile_date,
  rp.overall_level,
  COUNT(rpi.id) AS total_risks,
  COUNT(CASE WHEN rpi.risk_level = 'Extreme' THEN 1 END) AS extreme_risks,
  COUNT(CASE WHEN rpi.risk_level = 'High' THEN 1 END) AS high_risks,
  COUNT(CASE WHEN rpi.risk_level = 'Moderate' THEN 1 END) AS moderate_risks,
  COUNT(CASE WHEN rpi.risk_level = 'Low' THEN 1 END) AS low_risks,
  COUNT(CASE WHEN rpi.status = 'Open' THEN 1 END) AS open_risks
FROM risk_profiles rp
JOIN org_units ou ON rp.org_unit_id = ou.id
LEFT JOIN risk_profile_items rpi ON rp.id = rpi.risk_profile_id
WHERE rp.profile_date = (
  SELECT MAX(profile_date)
  FROM risk_profiles
  WHERE org_unit_id = rp.org_unit_id
)
GROUP BY ou.code, ou.name, rp.profile_date, rp.overall_level;

-- View: Latest PSAP Assessments by Org Unit
CREATE OR REPLACE VIEW v_latest_psap_ratings AS
SELECT
  ou.code AS org_unit_code,
  ou.name AS org_unit_name,
  pa.financial_year,
  pa.quarter,
  pa.assessment_date,
  pa.overall_score,
  pa.overall_rating,
  p.full_name AS completed_by
FROM psap_assessments pa
JOIN org_units ou ON pa.org_unit_id = ou.id
JOIN people p ON pa.completed_by = p.id
WHERE (pa.org_unit_id, pa.financial_year, pa.quarter) IN (
  SELECT org_unit_id, financial_year, MAX(quarter)
  FROM psap_assessments
  WHERE financial_year = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY org_unit_id, financial_year
);

-- View: KRA Activity Status Summary
CREATE OR REPLACE VIEW v_kra_status_summary AS
SELECT
  ou.code AS org_unit_code,
  ou.name AS org_unit_name,
  sk.kra_code,
  sk.kra_title,
  kaqs.financial_year,
  kaqs.quarter,
  COUNT(ka.id) AS total_activities,
  COUNT(CASE WHEN kaqs.status = 'Completed' THEN 1 END) AS completed,
  COUNT(CASE WHEN kaqs.status = 'Ongoing' THEN 1 END) AS ongoing,
  COUNT(CASE WHEN kaqs.status = 'Delayed' THEN 1 END) AS delayed,
  COUNT(CASE WHEN kaqs.status = 'Not Started' THEN 1 END) AS not_started
FROM strategic_kras sk
JOIN org_units ou ON sk.org_unit_id = ou.id
JOIN kra_activities ka ON sk.id = ka.strategic_kra_id
LEFT JOIN kra_activity_quarterly_status kaqs ON ka.id = kaqs.kra_activity_id
GROUP BY ou.code, ou.name, sk.kra_code, sk.kra_title, kaqs.financial_year, kaqs.quarter;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
