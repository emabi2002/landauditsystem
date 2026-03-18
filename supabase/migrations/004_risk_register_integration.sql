-- =============================================
-- RISK REGISTER INTEGRATION MIGRATION
-- Authoritative Shared Table - Spine of Audit System
-- =============================================
--
-- GOLDEN RULE: No audit object may exist without a Risk ID
-- This migration creates the risk register as the central,
-- immutable-by-design reference table for the entire ecosystem.
--
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- REFERENCE TABLES
-- =============================================

-- Legal Instruments (Acts, Regulations, Policies)
CREATE TABLE IF NOT EXISTS audit_legal_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    instrument_type TEXT NOT NULL CHECK (instrument_type IN (
        'Act', 'Regulation', 'Policy', 'Directive',
        'Circular', 'Standard', 'Guideline', 'Contract'
    )),
    jurisdiction TEXT DEFAULT 'PNG',
    enacted_date DATE,
    effective_date DATE,
    description TEXT,
    full_text_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Divisions (top-level organizational units)
CREATE TABLE IF NOT EXISTS audit_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    head_title TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sections (within audit_divisions)
CREATE TABLE IF NOT EXISTS audit_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES audit_divisions(id),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    head_title TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Business Processes
CREATE TABLE IF NOT EXISTS audit_business_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES audit_sections(id),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    process_type TEXT CHECK (process_type IN (
        'Core', 'Support', 'Management', 'Regulatory'
    )),
    owner_id UUID REFERENCES people(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- AUTHORITATIVE RISK REGISTER (The Spine)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity & Context
    risk_code TEXT UNIQUE NOT NULL,  -- e.g., DLPP-LT-001
    risk_title TEXT NOT NULL,
    risk_description TEXT NOT NULL,
    risk_category TEXT NOT NULL CHECK (risk_category IN (
        'Strategic', 'Operational', 'Financial', 'Compliance',
        'Reputational', 'Technology', 'Governance', 'External'
    )),
    risk_subcategory TEXT,

    -- Organizational Anchoring
    division_id UUID REFERENCES audit_divisions(id),
    section_id UUID REFERENCES audit_sections(id),
    process_id UUID REFERENCES audit_business_processes(id),

    -- Risk Scoring - Inherent (before controls)
    inherent_likelihood INTEGER NOT NULL CHECK (inherent_likelihood BETWEEN 1 AND 5),
    inherent_impact INTEGER NOT NULL CHECK (inherent_impact BETWEEN 1 AND 5),
    inherent_risk_score INTEGER GENERATED ALWAYS AS (inherent_likelihood * inherent_impact) STORED,
    inherent_risk_rating TEXT GENERATED ALWAYS AS (
        CASE
            WHEN inherent_likelihood * inherent_impact >= 20 THEN 'Extreme'
            WHEN inherent_likelihood * inherent_impact >= 12 THEN 'High'
            WHEN inherent_likelihood * inherent_impact >= 6 THEN 'Medium'
            ELSE 'Low'
        END
    ) STORED,

    -- Control Effectiveness
    control_effectiveness TEXT CHECK (control_effectiveness IN (
        'Effective', 'Partially Effective', 'Ineffective', 'Not Tested', 'No Controls'
    )),
    control_description TEXT,

    -- Risk Scoring - Residual (after controls)
    residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
    residual_risk_score INTEGER GENERATED ALWAYS AS (
        COALESCE(residual_likelihood, inherent_likelihood) * COALESCE(residual_impact, inherent_impact)
    ) STORED,
    residual_risk_rating TEXT GENERATED ALWAYS AS (
        CASE
            WHEN COALESCE(residual_likelihood, inherent_likelihood) * COALESCE(residual_impact, inherent_impact) >= 20 THEN 'Extreme'
            WHEN COALESCE(residual_likelihood, inherent_likelihood) * COALESCE(residual_impact, inherent_impact) >= 12 THEN 'High'
            WHEN COALESCE(residual_likelihood, inherent_likelihood) * COALESCE(residual_impact, inherent_impact) >= 6 THEN 'Medium'
            ELSE 'Low'
        END
    ) STORED,

    -- Ownership & Oversight
    risk_owner_role TEXT,
    risk_owner_id UUID REFERENCES people(id),
    oversight_body TEXT CHECK (oversight_body IN (
        'Audit Committee', 'Secretary', 'Executive Management',
        'Board', 'Division Head', 'Internal Audit'
    )),

    -- Lifecycle
    risk_status TEXT NOT NULL DEFAULT 'Active' CHECK (risk_status IN (
        'Active', 'Under Review', 'Mitigated', 'Accepted', 'Closed', 'Escalated'
    )),
    identified_date DATE DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMPTZ,
    next_review_due DATE,
    review_frequency TEXT CHECK (review_frequency IN (
        'Monthly', 'Quarterly', 'Bi-annually', 'Annually'
    )) DEFAULT 'Quarterly',

    -- Treatment
    risk_treatment TEXT CHECK (risk_treatment IN (
        'Mitigate', 'Transfer', 'Accept', 'Avoid'
    )),
    treatment_plan TEXT,
    target_risk_rating TEXT CHECK (target_risk_rating IN (
        'Extreme', 'High', 'Medium', 'Low'
    )),

    -- Metadata
    tags TEXT[],
    notes TEXT,
    is_system_risk BOOLEAN DEFAULT false,  -- System risks cannot be deleted
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RISK LEGAL REFERENCES (Join Table)
-- Critical: A risk cannot be created without legal reference
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_legal_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id) ON DELETE CASCADE,
    legal_instrument_id UUID NOT NULL REFERENCES audit_legal_instruments(id),
    section_reference TEXT,  -- e.g., "Section 45(2)(a)"
    compliance_type TEXT NOT NULL CHECK (compliance_type IN (
        'Mandatory', 'Advisory', 'Best Practice'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(risk_id, legal_instrument_id, section_reference)
);

-- =============================================
-- RISK AUDIT LOG (Immutability)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id),
    action_type TEXT NOT NULL CHECK (action_type IN (
        'Created', 'Updated', 'Rating Changed', 'Status Changed',
        'Escalated', 'Reviewed', 'Treatment Updated', 'Closed'
    )),
    field_changed TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES people(id),
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RISK TREATMENTS & MITIGATION ACTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id) ON DELETE CASCADE,
    treatment_type TEXT NOT NULL CHECK (treatment_type IN (
        'Control Enhancement', 'New Control', 'Process Change',
        'Training', 'Technology', 'Policy Update', 'Insurance', 'Other'
    )),
    description TEXT NOT NULL,
    owner_id UUID REFERENCES people(id),
    target_date DATE,
    actual_completion_date DATE,
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN (
        'Planned', 'In Progress', 'Completed', 'Overdue', 'Cancelled'
    )),
    effectiveness_rating TEXT CHECK (effectiveness_rating IN (
        'Effective', 'Partially Effective', 'Ineffective', 'Not Tested'
    )),
    evidence_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RISK INCIDENTS & EVENTS
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id),
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    impact_description TEXT,
    financial_impact DECIMAL(15, 2),
    response_actions TEXT,
    lessons_learned TEXT,
    reported_by UUID REFERENCES people(id),
    status TEXT DEFAULT 'Open' CHECK (status IN (
        'Open', 'Investigating', 'Resolved', 'Closed'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- KEY RISK INDICATORS (KRIs)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id) ON DELETE CASCADE,
    indicator_name TEXT NOT NULL,
    indicator_type TEXT CHECK (indicator_type IN (
        'Leading', 'Lagging', 'Predictive'
    )),
    measurement_unit TEXT,
    threshold_green DECIMAL(15, 4),  -- Acceptable
    threshold_amber DECIMAL(15, 4),  -- Warning
    threshold_red DECIMAL(15, 4),    -- Critical
    measurement_frequency TEXT CHECK (measurement_frequency IN (
        'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'
    )),
    data_source TEXT,
    owner_id UUID REFERENCES people(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_risk_indicator_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES audit_risk_indicators(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    status TEXT DEFAULT 'Green' CHECK (status IN ('Green', 'Amber', 'Red')),
    notes TEXT,
    recorded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to calculate KRI status based on thresholds
CREATE OR REPLACE FUNCTION calculate_kri_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
DECLARE
    t_green DECIMAL(15, 4);
    t_amber DECIMAL(15, 4);
    t_red DECIMAL(15, 4);
BEGIN
    SELECT threshold_green, threshold_amber, threshold_red
    INTO t_green, t_amber, t_red
    FROM audit_risk_indicators
    WHERE id = NEW.indicator_id;

    IF NEW.value <= COALESCE(t_green, NEW.value) THEN
        NEW.status := 'Green';
    ELSIF NEW.value <= COALESCE(t_amber, NEW.value) THEN
        NEW.status := 'Amber';
    ELSE
        NEW.status := 'Red';
    END IF;

    RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trigger_calculate_kri_status ON audit_risk_indicator_values;
CREATE TRIGGER trigger_calculate_kri_status
    BEFORE INSERT OR UPDATE OF value
    ON audit_risk_indicator_values
    FOR EACH ROW
    EXECUTE FUNCTION calculate_kri_status();

-- =============================================
-- MODIFICATIONS TO EXISTING AUDIT TABLES
-- Add risk_id foreign keys for system alignment
-- =============================================

-- Add risk_id to audit_engagements
ALTER TABLE audit_engagements
    ADD COLUMN IF NOT EXISTS risk_id UUID REFERENCES audit_risk_register(id);

-- Add risk_id to audit_findings
ALTER TABLE audit_findings
    ADD COLUMN IF NOT EXISTS risk_id UUID REFERENCES audit_risk_register(id);

-- Add legal_instrument_id to audit_findings (for compliance violations)
ALTER TABLE audit_findings
    ADD COLUMN IF NOT EXISTS legal_instrument_id UUID REFERENCES audit_legal_instruments(id);

-- Add risk_id to audit_recommendations
ALTER TABLE audit_recommendations
    ADD COLUMN IF NOT EXISTS risk_id UUID REFERENCES audit_risk_register(id);

-- Add risk_id to audit_action_plans
ALTER TABLE audit_action_plans
    ADD COLUMN IF NOT EXISTS risk_id UUID REFERENCES audit_risk_register(id);

-- Create view linking risks to engagements
CREATE OR REPLACE VIEW audit_risk_engagement_summary AS
SELECT
    r.id AS risk_id,
    r.risk_code,
    r.risk_title,
    r.residual_risk_rating,
    COUNT(DISTINCT e.id) AS engagement_count,
    COUNT(DISTINCT f.id) AS finding_count,
    MAX(e.start_date) AS last_audit_date
FROM audit_risk_register r
LEFT JOIN audit_engagements e ON e.risk_id = r.id
LEFT JOIN audit_findings f ON f.risk_id = r.id
GROUP BY r.id, r.risk_code, r.risk_title, r.residual_risk_rating;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_risk_register_code ON audit_risk_register(risk_code);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_status ON audit_risk_register(risk_status);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_rating ON audit_risk_register(residual_risk_rating);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_division ON audit_risk_register(division_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_section ON audit_risk_register(section_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_category ON audit_risk_register(risk_category);
CREATE INDEX IF NOT EXISTS idx_audit_risk_register_owner ON audit_risk_register(risk_owner_id);
CREATE INDEX IF NOT EXISTS idx_risk_legal_refs_risk ON audit_risk_legal_references(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_legal_refs_legal ON audit_risk_legal_references(legal_instrument_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_audit_log_risk ON audit_risk_audit_log(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_treatments_risk ON audit_risk_treatments(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_incidents_risk ON audit_risk_incidents(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_indicators_risk ON audit_risk_indicators(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_legal_instruments_code ON audit_legal_instruments(code);
CREATE INDEX IF NOT EXISTS idx_audit_divisions_code ON audit_divisions(code);
CREATE INDEX IF NOT EXISTS idx_audit_sections_division ON audit_sections(division_id);
CREATE INDEX IF NOT EXISTS idx_audit_business_processes_section ON audit_business_processes(section_id);

-- Add indexes for new FK columns
CREATE INDEX IF NOT EXISTS idx_audit_engagements_risk ON audit_engagements(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_risk ON audit_findings(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_legal ON audit_findings(legal_instrument_id);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_risk ON audit_recommendations(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_plans_risk ON audit_action_plans(risk_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE audit_legal_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_business_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_legal_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_indicator_values ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY audit_legal_instruments_all ON audit_legal_instruments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_divisions_all ON audit_divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_sections_all ON audit_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_business_processes_all ON audit_business_processes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_register_all ON audit_risk_register FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_legal_references_all ON audit_risk_legal_references FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_audit_log_select ON audit_risk_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_risk_audit_log_insert ON audit_risk_audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY audit_risk_treatments_all ON audit_risk_treatments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_incidents_all ON audit_risk_incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_indicators_all ON audit_risk_indicators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_indicator_values_all ON audit_risk_indicator_values FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR AUDIT LOG
-- =============================================

CREATE OR REPLACE FUNCTION log_risk_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_risk_audit_log (risk_id, action_type, new_value, changed_by)
        VALUES (NEW.id, 'Created', row_to_json(NEW)::text, NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log rating changes specifically
        IF OLD.residual_risk_rating IS DISTINCT FROM NEW.residual_risk_rating THEN
            INSERT INTO audit_risk_audit_log (risk_id, action_type, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.id, 'Rating Changed', 'residual_risk_rating',
                    OLD.residual_risk_rating, NEW.residual_risk_rating, NEW.risk_owner_id);
        END IF;

        -- Log status changes
        IF OLD.risk_status IS DISTINCT FROM NEW.risk_status THEN
            INSERT INTO audit_risk_audit_log (risk_id, action_type, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.id, 'Status Changed', 'risk_status',
                    OLD.risk_status, NEW.risk_status, NEW.risk_owner_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_risk_changes ON audit_risk_register;
CREATE TRIGGER trigger_log_risk_changes
    AFTER INSERT OR UPDATE ON audit_risk_register
    FOR EACH ROW
    EXECUTE FUNCTION log_risk_changes();

-- Prevent deletion of system risks
CREATE OR REPLACE FUNCTION prevent_system_risk_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.is_system_risk = true THEN
        RAISE EXCEPTION 'System risks cannot be deleted. Set status to Closed instead.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_system_risk_deletion ON audit_risk_register;
CREATE TRIGGER trigger_prevent_system_risk_deletion
    BEFORE DELETE ON audit_risk_register
    FOR EACH ROW
    EXECUTE FUNCTION prevent_system_risk_deletion();

-- =============================================
-- SEED DATA: DLPP DIVISIONS
-- =============================================

INSERT INTO audit_divisions (code, name, description, head_title) VALUES
('SEC', 'Secretary''s Office', 'Office of the Secretary for Lands and Physical Planning', 'Secretary'),
('LTR', 'Land Titles Registry', 'Responsible for registration and management of land titles', 'Registrar of Titles'),
('PHPL', 'Physical Planning', 'Urban and regional physical planning', 'Chief Physical Planner'),
('SRV', 'Survey & Mapping', 'Land surveying and mapping services', 'Surveyor General'),
('VAL', 'Valuation', 'Land valuation services', 'Valuer General'),
('LMD', 'Land Management', 'Management of state land and leases', 'Director Land Management'),
('CLU', 'Customary Land', 'ILG registration and customary land matters', 'Director Customary Land'),
('CS', 'Corporate Services', 'Finance, HR, IT, Procurement', 'Director Corporate Services'),
('LEG', 'Legal Services', 'Legal advice and litigation', 'Chief Legal Officer'),
('IAU', 'Internal Audit', 'Internal audit and compliance', 'Chief Internal Auditor')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED DATA: LEGAL INSTRUMENTS
-- =============================================

INSERT INTO audit_legal_instruments (code, title, instrument_type, jurisdiction, description) VALUES
('LA1996', 'Land Act 1996', 'Act', 'PNG', 'Primary legislation governing state land in Papua New Guinea'),
('LRA1981', 'Land Registration Act 1981', 'Act', 'PNG', 'Governs registration of land titles and interests'),
('LGILRA2009', 'Land Groups Incorporation (Amendment) Act 2009', 'Act', 'PNG', 'ILG registration and management'),
('PPA1989', 'Physical Planning Act 1989', 'Act', 'PNG', 'Urban and regional planning framework'),
('SM1969', 'Survey Act 1969', 'Act', 'PNG', 'Land surveying standards and registration'),
('VA1967', 'Valuation Act 1967', 'Act', 'PNG', 'Property valuation standards'),
('PFMA1995', 'Public Finances (Management) Act 1995', 'Act', 'PNG', 'Public financial management and accountability'),
('LRTPNG', 'Land Registration (Torrens) PNG', 'Regulation', 'PNG', 'Torrens title registration procedures'),
('NECS', 'National Executive Council Standing Orders', 'Directive', 'PNG', 'NEC decision-making procedures for land'),
('PPSM', 'Public Service Management Act 2014', 'Act', 'PNG', 'Public service employment and management'),
('AGA2015', 'Audit Act 2015', 'Act', 'PNG', 'Audit requirements for public bodies'),
('PROC2018', 'Procurement Act 2018', 'Act', 'PNG', 'Public procurement procedures'),
('CISM', 'Central Information Systems Management Act', 'Act', 'PNG', 'Government ICT standards')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED DATA: DLPP RISK REGISTER (System Risks)
-- =============================================

-- First, get division IDs
DO $$
DECLARE
    ltr_id UUID;
    phpl_id UUID;
    srv_id UUID;
    val_id UUID;
    lmd_id UUID;
    clu_id UUID;
    cs_id UUID;
    sec_id UUID;
    iau_id UUID;

    la1996_id UUID;
    lra1981_id UUID;
    lgilra_id UUID;
    ppa_id UUID;
    pfma_id UUID;
    ppsm_id UUID;
    aga_id UUID;
    proc_id UUID;
    cism_id UUID;
BEGIN
    -- Get division IDs
    SELECT id INTO ltr_id FROM audit_divisions WHERE code = 'LTR';
    SELECT id INTO phpl_id FROM audit_divisions WHERE code = 'PHPL';
    SELECT id INTO srv_id FROM audit_divisions WHERE code = 'SRV';
    SELECT id INTO val_id FROM audit_divisions WHERE code = 'VAL';
    SELECT id INTO lmd_id FROM audit_divisions WHERE code = 'LMD';
    SELECT id INTO clu_id FROM audit_divisions WHERE code = 'CLU';
    SELECT id INTO cs_id FROM audit_divisions WHERE code = 'CS';
    SELECT id INTO sec_id FROM audit_divisions WHERE code = 'SEC';
    SELECT id INTO iau_id FROM audit_divisions WHERE code = 'IAU';

    -- Get legal instrument IDs
    SELECT id INTO la1996_id FROM audit_legal_instruments WHERE code = 'LA1996';
    SELECT id INTO lra1981_id FROM audit_legal_instruments WHERE code = 'LRA1981';
    SELECT id INTO lgilra_id FROM audit_legal_instruments WHERE code = 'LGILRA2009';
    SELECT id INTO ppa_id FROM audit_legal_instruments WHERE code = 'PPA1989';
    SELECT id INTO pfma_id FROM audit_legal_instruments WHERE code = 'PFMA1995';
    SELECT id INTO ppsm_id FROM audit_legal_instruments WHERE code = 'PPSM';
    SELECT id INTO aga_id FROM audit_legal_instruments WHERE code = 'AGA2015';
    SELECT id INTO proc_id FROM audit_legal_instruments WHERE code = 'PROC2018';
    SELECT id INTO cism_id FROM audit_legal_instruments WHERE code = 'CISM';

    -- =========================================
    -- LAND TITLES REGISTRY RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-LT-001',
        'Duplicate Title Registration',
        'Risk of issuing multiple titles for the same parcel of land leading to ownership disputes, fraud, and legal liability',
        'Operational', 'Title Integrity',
        ltr_id, 4, 5,
        'Partially Effective', 3, 5,
        'Registrar of Titles', 'Audit Committee', 'Active', 'Quarterly',
        'Mitigate', 'Implement digital title verification system with cross-referencing',
        true
    ),
    (
        'DLPP-LT-002',
        'Fraudulent Title Registration',
        'Risk of fraudulent documentation being accepted for title registration, enabling land theft and corruption',
        'Compliance', 'Fraud Prevention',
        ltr_id, 4, 5,
        'Partially Effective', 3, 5,
        'Registrar of Titles', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Enhanced verification procedures, biometric identification, forensic document checks',
        true
    ),
    (
        'DLPP-LT-003',
        'Title Record Loss or Damage',
        'Risk of physical destruction or loss of title records due to fire, flood, or deterioration',
        'Operational', 'Records Management',
        ltr_id, 3, 5,
        'Partially Effective', 2, 5,
        'Registrar of Titles', 'Executive Management', 'Active', 'Quarterly',
        'Mitigate', 'Digital backup system, offsite storage, climate-controlled archives',
        true
    ),
    (
        'DLPP-LT-004',
        'Unauthorized Access to Title Records',
        'Risk of unauthorized persons accessing or modifying title records in the registry',
        'Technology', 'Access Control',
        ltr_id, 4, 4,
        'Ineffective', 3, 4,
        'Registrar of Titles', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Role-based access control, audit trails, encryption',
        true
    );

    -- =========================================
    -- CUSTOMARY LAND & ILG RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-CL-001',
        'Invalid ILG Registration',
        'Risk of registering ILGs without proper clan consensus or legitimate membership, leading to disputes',
        'Compliance', 'ILG Integrity',
        clu_id, 4, 4,
        'Partially Effective', 3, 4,
        'Director Customary Land', 'Secretary', 'Active', 'Quarterly',
        'Mitigate', 'Enhanced verification of clan membership and consent processes',
        true
    ),
    (
        'DLPP-CL-002',
        'Customary Land Boundary Disputes',
        'Risk of disputes arising from unclear or contested customary land boundaries during registration',
        'Operational', 'Boundary Definition',
        clu_id, 5, 4,
        'Partially Effective', 4, 4,
        'Director Customary Land', 'Secretary', 'Active', 'Quarterly',
        'Mitigate', 'Community mapping, GPS demarcation, dispute resolution mechanisms',
        true
    ),
    (
        'DLPP-CL-003',
        'Customary Land Alienation',
        'Risk of customary land being improperly alienated without proper consent of rightful owners',
        'Compliance', 'Land Rights',
        clu_id, 4, 5,
        'Partially Effective', 3, 5,
        'Director Customary Land', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Consent verification protocols, independent witness requirements',
        true
    );

    -- =========================================
    -- PHYSICAL PLANNING RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-PP-001',
        'Non-compliant Development Approvals',
        'Risk of approving developments that do not comply with physical planning schemes or zoning',
        'Compliance', 'Planning Compliance',
        phpl_id, 4, 4,
        'Partially Effective', 3, 4,
        'Chief Physical Planner', 'Audit Committee', 'Active', 'Quarterly',
        'Mitigate', 'Strengthened technical review processes, checklist enforcement',
        true
    ),
    (
        'DLPP-PP-002',
        'Outdated Physical Planning Schemes',
        'Risk of planning decisions based on outdated schemes that do not reflect current development needs',
        'Strategic', 'Planning Framework',
        phpl_id, 4, 3,
        'Ineffective', 4, 3,
        'Chief Physical Planner', 'Executive Management', 'Active', 'Annually',
        'Mitigate', 'Scheme review program, stakeholder consultation process',
        true
    ),
    (
        'DLPP-PP-003',
        'Illegal Structures and Settlements',
        'Risk of proliferation of unauthorized structures due to weak enforcement of planning regulations',
        'Operational', 'Enforcement',
        phpl_id, 5, 4,
        'Ineffective', 5, 4,
        'Chief Physical Planner', 'Secretary', 'Active', 'Quarterly',
        'Mitigate', 'Enforcement unit establishment, prosecution procedures',
        true
    );

    -- =========================================
    -- SURVEY & VALUATION RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-SV-001',
        'Inaccurate Survey Data',
        'Risk of survey errors leading to boundary disputes and title complications',
        'Operational', 'Survey Quality',
        srv_id, 3, 4,
        'Partially Effective', 2, 4,
        'Surveyor General', 'Executive Management', 'Active', 'Quarterly',
        'Mitigate', 'Quality assurance protocols, equipment calibration, peer review',
        true
    ),
    (
        'DLPP-SV-002',
        'Valuation Manipulation',
        'Risk of land valuations being manipulated for personal gain or to defraud the state',
        'Compliance', 'Valuation Integrity',
        val_id, 4, 5,
        'Partially Effective', 3, 5,
        'Valuer General', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Independent review panel, rotation of valuers, market data verification',
        true
    );

    -- =========================================
    -- REVENUE & FINANCIAL RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-FN-001',
        'Revenue Leakage - Land Rent',
        'Risk of state revenue loss due to unpaid land rents, incorrect billing, or fraud',
        'Financial', 'Revenue Collection',
        lmd_id, 5, 4,
        'Ineffective', 4, 4,
        'Director Land Management', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Lease database audit, automated billing, debt recovery program',
        true
    ),
    (
        'DLPP-FN-002',
        'Improper Fee Waivers',
        'Risk of unauthorized or improper waivers of land-related fees and charges',
        'Compliance', 'Fee Management',
        cs_id, 4, 4,
        'Partially Effective', 3, 4,
        'Director Corporate Services', 'Audit Committee', 'Active', 'Quarterly',
        'Mitigate', 'Waiver approval framework, documentation requirements, audit reviews',
        true
    ),
    (
        'DLPP-FN-003',
        'Procurement Irregularities',
        'Risk of non-compliance with procurement procedures leading to financial loss or fraud',
        'Compliance', 'Procurement',
        cs_id, 4, 4,
        'Partially Effective', 3, 4,
        'Director Corporate Services', 'Audit Committee', 'Active', 'Quarterly',
        'Mitigate', 'Procurement checklist, tender board oversight, supplier vetting',
        true
    );

    -- =========================================
    -- ICT & DATA RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-IT-001',
        'Critical System Downtime',
        'Risk of land information systems becoming unavailable, halting service delivery',
        'Technology', 'System Availability',
        cs_id, 4, 4,
        'Partially Effective', 3, 4,
        'Director Corporate Services', 'Executive Management', 'Active', 'Quarterly',
        'Mitigate', 'Disaster recovery plan, redundant systems, SLA with service providers',
        true
    ),
    (
        'DLPP-IT-002',
        'Cyber Security Breach',
        'Risk of unauthorized access to land information systems or data theft',
        'Technology', 'Cyber Security',
        cs_id, 4, 5,
        'Ineffective', 4, 5,
        'Director Corporate Services', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Security assessment, firewall upgrades, staff training, incident response plan',
        true
    ),
    (
        'DLPP-IT-003',
        'Data Integrity Compromise',
        'Risk of corruption or unauthorized modification of land data in databases',
        'Technology', 'Data Integrity',
        cs_id, 4, 5,
        'Partially Effective', 3, 5,
        'Director Corporate Services', 'Audit Committee', 'Active', 'Monthly',
        'Mitigate', 'Database audit logs, access controls, data validation rules',
        true
    );

    -- =========================================
    -- HR & GOVERNANCE RISKS
    -- =========================================

    INSERT INTO audit_risk_register (
        risk_code, risk_title, risk_description, risk_category, risk_subcategory,
        division_id, inherent_likelihood, inherent_impact,
        control_effectiveness, residual_likelihood, residual_impact,
        risk_owner_role, oversight_body, risk_status, review_frequency,
        risk_treatment, treatment_plan, is_system_risk
    ) VALUES
    (
        'DLPP-HR-001',
        'Staff Capacity Gaps',
        'Risk of inadequate staff skills or numbers to deliver core functions effectively',
        'Operational', 'Human Resources',
        cs_id, 5, 4,
        'Ineffective', 4, 4,
        'Director Corporate Services', 'Executive Management', 'Active', 'Annually',
        'Mitigate', 'Training program, succession planning, recruitment drive',
        true
    ),
    (
        'DLPP-HR-002',
        'Payroll Irregularities',
        'Risk of ghost employees, unauthorized allowances, or payroll fraud',
        'Compliance', 'Payroll',
        cs_id, 3, 4,
        'Partially Effective', 2, 4,
        'Director Corporate Services', 'Audit Committee', 'Active', 'Quarterly',
        'Mitigate', 'Payroll audit, biometric verification, separation of duties',
        true
    ),
    (
        'DLPP-GV-001',
        'Political Interference in Land Allocation',
        'Risk of land decisions being influenced by political considerations rather than policy',
        'Governance', 'Political Interference',
        sec_id, 5, 5,
        'Ineffective', 4, 5,
        'Secretary', 'Audit Committee', 'Active', 'Monthly',
        'Accept', 'Document decisions, escalation to Minister, transparency requirements',
        true
    ),
    (
        'DLPP-GV-002',
        'Conflict of Interest - Staff',
        'Risk of staff having undisclosed interests in land transactions they process',
        'Governance', 'Ethics',
        sec_id, 4, 4,
        'Partially Effective', 3, 4,
        'Secretary', 'Audit Committee', 'Active', 'Annually',
        'Mitigate', 'Declaration of interest register, rotation policy, code of conduct',
        true
    );

    -- =========================================
    -- Add Legal References for All Risks
    -- =========================================

    -- Land Title risks -> Land Registration Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, lra1981_id, 'Part II - Registration', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-LT-%'
    ON CONFLICT DO NOTHING;

    -- Add Land Act reference
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, la1996_id, 'General Provisions', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-LT-%'
    ON CONFLICT DO NOTHING;

    -- Customary Land risks -> ILG Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, lgilra_id, 'Part III - Registration', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-CL-%'
    ON CONFLICT DO NOTHING;

    -- Physical Planning risks -> Physical Planning Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, ppa_id, 'Part IV - Development Control', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-PP-%'
    ON CONFLICT DO NOTHING;

    -- Financial risks -> PFMA
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, pfma_id, 'Part IV - Revenue', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-FN-%'
    ON CONFLICT DO NOTHING;

    -- Procurement risks -> Procurement Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, proc_id, 'Part III - Procedures', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code = 'DLPP-FN-003'
    ON CONFLICT DO NOTHING;

    -- HR risks -> Public Service Management Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, ppsm_id, 'Part II - Employment', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-HR-%'
    ON CONFLICT DO NOTHING;

    -- IT risks -> CISM
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, cism_id, 'Information Security', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-IT-%'
    ON CONFLICT DO NOTHING;

    -- Governance risks -> Audit Act
    INSERT INTO audit_risk_legal_references (risk_id, legal_instrument_id, section_reference, compliance_type)
    SELECT r.id, aga_id, 'Part II - Internal Audit', 'Mandatory'
    FROM audit_risk_register r WHERE r.risk_code LIKE 'DLPP-GV-%'
    ON CONFLICT DO NOTHING;

END $$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
SELECT 'Risk Register Integration migration complete!' AS status,
       (SELECT COUNT(*) FROM audit_risk_register) AS risks_seeded,
       (SELECT COUNT(*) FROM audit_legal_instruments) AS audit_legal_instruments,
       (SELECT COUNT(*) FROM audit_divisions) AS audit_divisions,
       (SELECT COUNT(*) FROM audit_risk_legal_references) AS legal_references;
