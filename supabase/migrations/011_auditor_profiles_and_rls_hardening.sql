-- =============================================================================
-- Migration 011: Auditor Profiles module + RLS hardening for the authenticated role
-- Target Supabase project: yvnkyjnwvylrweyzvibs
--
-- WHY THIS EXISTS (found during the post-fix click-through review):
--   1. The Auditors admin page (/admin/auditors) is non-functional because
--      THREE tables are MISSING from the live project (REST returns HTTP 404):
--         - public.audit_auditor_profiles
--         - public.audit_certification_types
--         - public.audit_specialization_areas
--      (Migration 007 defined them but was never applied to this project.)
--
--   2. groups / modules / group_module_permissions only have `anon` RLS policies
--      (from migration 006). The app signs users in with real Supabase auth, so
--      after login every query runs as the `authenticated` role — which those
--      anon-only policies do NOT cover, so the data can come back EMPTY once
--      logged in (empty Groups/Modules admin pages, empty group dropdowns).
--      This adds matching `authenticated` policies. Fully idempotent.
--
-- The audit_users table already exists (created in migration 010), so the FK
-- audit_auditor_profiles.user_id -> audit_users(id) resolves, and PostgREST can
-- embed audit_users(...) in the auditors query.
--
-- Safe to run more than once.
-- =============================================================================

-- ===========================================================================
-- 1) AUDITOR PROFILES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.audit_auditor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.audit_users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    position VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20),
    department VARCHAR(100) DEFAULT 'Internal Audit Unit',
    highest_qualification VARCHAR(100),
    qualification_field VARCHAR(100),
    university VARCHAR(200),
    graduation_year INTEGER,
    certifications JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    years_of_experience INTEGER DEFAULT 0,
    previous_employers JSONB DEFAULT '[]',
    training_records JSONB DEFAULT '[]',
    max_concurrent_engagements INTEGER DEFAULT 2,
    current_workload INTEGER DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'Available',
    total_audits_completed INTEGER DEFAULT 0,
    total_findings_identified INTEGER DEFAULT 0,
    average_audit_rating DECIMAL(3,2),
    date_joined DATE,
    probation_end_date DATE,
    last_performance_review DATE,
    next_performance_review DATE,
    skills_summary TEXT,
    notes TEXT,
    profile_status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee the FK exists even if the table pre-existed without it (needed for
-- the audit_users(...) embed in the /admin/auditors query).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'audit_auditor_profiles'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'audit_auditor_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.audit_auditor_profiles
            ADD CONSTRAINT audit_auditor_profiles_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.audit_users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auditor_profiles_user ON public.audit_auditor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_auditor_profiles_status ON public.audit_auditor_profiles(profile_status);

ALTER TABLE public.audit_auditor_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auditor_profiles_all ON public.audit_auditor_profiles;
CREATE POLICY auditor_profiles_all ON public.audit_auditor_profiles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ===========================================================================
-- 2) CERTIFICATION TYPES (reference/lookup) + seed
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.audit_certification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    issuing_body VARCHAR(100),
    description TEXT,
    validity_years INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_certification_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cert_types_all ON public.audit_certification_types;
CREATE POLICY cert_types_all ON public.audit_certification_types
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.audit_certification_types (code, name, issuing_body, description, validity_years) VALUES
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

-- ===========================================================================
-- 3) SPECIALIZATION AREAS (reference/lookup) + seed
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.audit_specialization_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_specialization_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS spec_areas_all ON public.audit_specialization_areas;
CREATE POLICY spec_areas_all ON public.audit_specialization_areas
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.audit_specialization_areas (code, name, category, description) VALUES
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

-- Register the module (drives the admin hub tile / permissions)
INSERT INTO public.modules (module_name, module_key, category, description) VALUES
('Auditor Profiles', 'auditor_profiles', 'administration', 'Manage auditor profiles, certifications, and specializations')
ON CONFLICT (module_key) DO NOTHING;

-- ===========================================================================
-- 4) RLS HARDENING: allow the authenticated role to read/write RBAC tables
--    (they previously had anon-only policies, so logged-in users saw nothing).
--    Idempotent: safe even if the live DB already grants authenticated access.
-- ===========================================================================
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS groups_auth_all ON public.groups;
CREATE POLICY groups_auth_all ON public.groups
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS modules_auth_all ON public.modules;
CREATE POLICY modules_auth_all ON public.modules
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.group_module_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS group_permissions_auth_all ON public.group_module_permissions;
CREATE POLICY group_permissions_auth_all ON public.group_module_permissions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===========================================================================
-- 5) Reload PostgREST schema cache so the new tables + FKs resolve immediately.
-- ===========================================================================
NOTIFY pgrst, 'reload schema';
