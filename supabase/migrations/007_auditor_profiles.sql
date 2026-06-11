-- =============================================
-- AUDITOR PROFILES MODULE
-- Migration 007: Create auditor profiles table
-- =============================================

-- =============================================
-- AUDITOR PROFILES TABLE
-- Extended profile information for auditors
-- =============================================
CREATE TABLE IF NOT EXISTS audit_auditor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES audit_users(id) ON DELETE CASCADE,

    -- Employee Information
    employee_id VARCHAR(50) UNIQUE,
    position VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20),
    department VARCHAR(100) DEFAULT 'Internal Audit Unit',

    -- Professional Qualifications
    highest_qualification VARCHAR(100),
    qualification_field VARCHAR(100),
    university VARCHAR(200),
    graduation_year INTEGER,

    -- Professional Certifications (JSON array)
    certifications JSONB DEFAULT '[]',
    -- Example: [{"name": "CIA", "issuer": "IIA", "year": 2020, "expiry": "2025-12-31"}]

    -- Specializations (JSON array)
    specializations JSONB DEFAULT '[]',
    -- Example: ["IT Audit", "Financial Audit", "Compliance"]

    -- Experience
    years_of_experience INTEGER DEFAULT 0,
    previous_employers JSONB DEFAULT '[]',
    -- Example: [{"company": "ABC Ltd", "position": "Auditor", "from": "2018", "to": "2020"}]

    -- Training & Development
    training_records JSONB DEFAULT '[]',
    -- Example: [{"course": "Advanced Audit Techniques", "provider": "IIA", "date": "2023-06-15", "hours": 40}]

    -- Audit Capacity
    max_concurrent_engagements INTEGER DEFAULT 2,
    current_workload INTEGER DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'Available',
    -- Options: Available, Partially Available, On Leave, Unavailable

    -- Performance Metrics
    total_audits_completed INTEGER DEFAULT 0,
    total_findings_identified INTEGER DEFAULT 0,
    average_audit_rating DECIMAL(3,2),

    -- Administrative
    date_joined DATE,
    probation_end_date DATE,
    last_performance_review DATE,
    next_performance_review DATE,

    -- Notes
    skills_summary TEXT,
    notes TEXT,

    -- Status
    profile_status VARCHAR(20) DEFAULT 'Active',
    -- Options: Active, Inactive, On Leave, Terminated

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_auditor_profiles_user ON audit_auditor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_auditor_profiles_employee_id ON audit_auditor_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_auditor_profiles_status ON audit_auditor_profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_auditor_profiles_availability ON audit_auditor_profiles(availability_status);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE audit_auditor_profiles ENABLE ROW LEVEL SECURITY;

-- Anonymous read for development
DROP POLICY IF EXISTS auditor_profiles_anon_read ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_anon_read ON audit_auditor_profiles
  FOR SELECT TO anon USING (true);

-- Anonymous write for development
DROP POLICY IF EXISTS auditor_profiles_anon_insert ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_anon_insert ON audit_auditor_profiles
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS auditor_profiles_anon_update ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_anon_update ON audit_auditor_profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auditor_profiles_anon_delete ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_anon_delete ON audit_auditor_profiles
  FOR DELETE TO anon USING (true);

-- Authenticated user policies
DROP POLICY IF EXISTS auditor_profiles_auth_read ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_auth_read ON audit_auditor_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auditor_profiles_auth_all ON audit_auditor_profiles;
CREATE POLICY auditor_profiles_auth_all ON audit_auditor_profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- CERTIFICATION TYPES REFERENCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_certification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    issuing_body VARCHAR(100),
    description TEXT,
    validity_years INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_certification_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cert_types_anon_read ON audit_certification_types;
CREATE POLICY cert_types_anon_read ON audit_certification_types
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS cert_types_anon_all ON audit_certification_types;
CREATE POLICY cert_types_anon_all ON audit_certification_types
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- =============================================
-- SEED COMMON CERTIFICATIONS
-- =============================================
INSERT INTO audit_certification_types (code, name, issuing_body, description, validity_years) VALUES
('CIA', 'Certified Internal Auditor', 'Institute of Internal Auditors (IIA)', 'Global certification for internal auditors', NULL),
('CISA', 'Certified Information Systems Auditor', 'ISACA', 'Certification for IS audit, control, and security', 3),
('CPA', 'Certified Public Accountant', 'AICPA/Local Board', 'Accounting and auditing certification', NULL),
('ACCA', 'Association of Chartered Certified Accountants', 'ACCA', 'Global accounting qualification', NULL),
('CFE', 'Certified Fraud Examiner', 'ACFE', 'Anti-fraud and forensic accounting certification', NULL),
('CRMA', 'Certification in Risk Management Assurance', 'IIA', 'Risk management certification', NULL),
('CGAP', 'Certified Government Auditing Professional', 'IIA', 'Government auditing certification', NULL),
('CRISC', 'Certified in Risk and Information Systems Control', 'ISACA', 'IT risk management certification', 3),
('CISM', 'Certified Information Security Manager', 'ISACA', 'Information security management', 3),
('PMP', 'Project Management Professional', 'PMI', 'Project management certification', 3)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SPECIALIZATION AREAS REFERENCE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_specialization_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_specialization_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spec_areas_anon_read ON audit_specialization_areas;
CREATE POLICY spec_areas_anon_read ON audit_specialization_areas
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS spec_areas_anon_all ON audit_specialization_areas;
CREATE POLICY spec_areas_anon_all ON audit_specialization_areas
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed specialization areas
INSERT INTO audit_specialization_areas (code, name, category, description) VALUES
('FIN_AUDIT', 'Financial Audit', 'Audit Type', 'Financial statements and accounting audits'),
('COMP_AUDIT', 'Compliance Audit', 'Audit Type', 'Regulatory and policy compliance audits'),
('PERF_AUDIT', 'Performance Audit', 'Audit Type', 'Efficiency and effectiveness audits'),
('IT_AUDIT', 'IT/IS Audit', 'Audit Type', 'Information technology and systems audits'),
('FORENSIC', 'Forensic Audit', 'Audit Type', 'Fraud investigation and forensic audits'),
('ENVIRO', 'Environmental Audit', 'Audit Type', 'Environmental compliance and sustainability'),
('PROC_AUDIT', 'Procurement Audit', 'Subject Matter', 'Procurement and contract audits'),
('HR_AUDIT', 'HR Audit', 'Subject Matter', 'Human resources and payroll audits'),
('ASSET_MGMT', 'Asset Management', 'Subject Matter', 'Fixed assets and inventory audits'),
('LAND_ADMIN', 'Land Administration', 'Subject Matter', 'Land titles and registration audits'),
('VALUATION', 'Valuation', 'Subject Matter', 'Property valuation audits'),
('SURVEY', 'Survey & Mapping', 'Subject Matter', 'Survey and geospatial audits'),
('RISK_MGMT', 'Risk Management', 'Skills', 'Risk assessment and management'),
('DATA_ANALYTICS', 'Data Analytics', 'Skills', 'Audit data analytics and CAAT'),
('REPORT_WRITING', 'Report Writing', 'Skills', 'Audit report writing and communication')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- UPDATE MODULES TABLE
-- =============================================
INSERT INTO modules (module_name, module_key, category, description) VALUES
('Auditor Profiles', 'auditor_profiles', 'administration', 'Manage auditor profiles, certifications, and specializations')
ON CONFLICT (module_key) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Auditor profiles module created successfully!' AS status;

SELECT 'Certification types seeded:' AS info, COUNT(*) AS count FROM audit_certification_types;
SELECT 'Specialization areas seeded:' AS info, COUNT(*) AS count FROM audit_specialization_areas;
