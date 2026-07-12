-- =============================================================================
-- DLPP Internal Audit System — COMPLETE DATABASE SETUP (fresh provision)
-- =============================================================================
-- Run this ONCE against a brand-new Supabase project's SQL Editor to build the
-- entire schema the app needs, then load sample data with the seed script (see
-- supabase/SETUP.md). It is assembled, in dependency order, from the project's
-- migration history:
--
--   001_initial_schema ............ base shared tables (people, org units, etc.)
--   002_rls_policies .............. RLS for the base tables
--   003_risk_governance_modules ... (legacy unprefixed governance tables)
--   004_risk_register_integration . audit_divisions / audit_sections /
--                                   audit_risk_register + risk sub-tables
--   005_central_risk_event_repo ... audit_risk_events / audit_categories + subs
--   006_rbac_system ............... groups / modules / group_module_permissions /
--                                   user_groups / audit_users / audit_log (+seed)
--   007_auditor_profiles .......... audit_auditor_profiles + cert/spec lookups
--   008_shared_auth_integration ... shared-auth helpers
--   009_fieldwork_workpapers ...... audit_workpapers + evidence + storage
--   audit_system_with_prefixes .... audit_engagements / audit_findings /
--                                   audit_recommendations / audit_workpapers /
--                                   PSAP / KRA / risk-profile tables (prefixed)
--   010_create_audit_users_and_user_groups
--   011_auditor_profiles_and_rls_hardening
--   012_org_units_self_contained .. org_units + FKs for the governance embeds
--   013_governance_rls_policies ... permissive RLS on the 9 governance tables
--
-- Everything below is idempotent where possible (CREATE ... IF NOT EXISTS,
-- DROP POLICY IF EXISTS, ON CONFLICT DO NOTHING), so re-running is safe.
--
-- AUTHORITATIVE ALTERNATIVE: the most reliable way to clone this database is
-- `supabase db dump` (schema + data) from the live project — see supabase/SETUP.md.
-- =============================================================================

-- ============================================================
-- >>> migrations/001_initial_schema.sql
-- ============================================================
-- ========================================
-- DLPP Internal Audit & Compliance System
-- Database Schema (Compatible with Legal Case System)
-- ========================================

-- Enable required extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- REFERENCE TABLES
-- ========================================

-- Organization Units (may already exist from legal system - create if not exists)
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

-- Only create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_org_units_parent') THEN
        CREATE INDEX idx_org_units_parent ON org_units(parent_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_org_units_code') THEN
        CREATE INDEX idx_org_units_code ON org_units(code);
    END IF;
END $$;

-- People (may already exist - create if not exists)
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

-- Add audit-specific role check if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'people_role_check'
        AND conrelid = 'people'::regclass
    ) THEN
        -- Drop existing constraint if it has different values
        ALTER TABLE people DROP CONSTRAINT IF EXISTS people_role_check;

        -- Add new constraint with both legal and audit roles
        ALTER TABLE people ADD CONSTRAINT people_role_check
        CHECK (role IN (
            'Audit Admin', 'Audit Manager', 'Auditor', 'Action Owner', 'Read-Only', 'System Integrator',
            'Admin', 'Case Manager', 'Lawyer', 'Paralegal', 'Client', 'Judge', 'Witness'
        ));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_user_id') THEN
        CREATE INDEX idx_people_user_id ON people(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_email') THEN
        CREATE INDEX idx_people_email ON people(email);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_role') THEN
        CREATE INDEX idx_people_role ON people(role);
    END IF;
END $$;

-- Compliance Obligations (new table for audit system)
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    ref_code TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL, -- e.g., "Act", "Regulation", "Policy", "Standard"
    description TEXT,
    level TEXT, -- e.g., "National", "Regional", "Internal"
    effective_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_obligations_ref_code ON obligations(ref_code);
CREATE INDEX IF NOT EXISTS idx_obligations_source ON obligations(source);

-- Controls (new table for audit system)
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    control_type TEXT, -- e.g., "Preventive", "Detective", "Corrective"
    owner_unit_id UUID REFERENCES org_units(id),
    obligation_id UUID REFERENCES obligations(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_controls_owner_unit ON controls(owner_unit_id);
CREATE INDEX IF NOT EXISTS idx_controls_obligation ON controls(obligation_id);

-- ========================================
-- AUDIT CORE TABLES (New for Audit System)
-- ========================================

-- Audit Engagements
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

CREATE INDEX IF NOT EXISTS idx_engagements_lead ON engagements(lead_id);
CREATE INDEX IF NOT EXISTS idx_engagements_org_unit ON engagements(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON engagements(status);
CREATE INDEX IF NOT EXISTS idx_engagements_dates ON engagements(start_date, end_date);

-- Engagement Team
CREATE TABLE IF NOT EXISTS engagement_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id),
    role TEXT NOT NULL, -- e.g., "Lead", "Auditor", "Specialist"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engagement_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_engagement_team_engagement ON engagement_team(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_team_person ON engagement_team(person_id);

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

CREATE INDEX IF NOT EXISTS idx_workpapers_engagement ON workpapers(engagement_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_created_by ON workpapers(created_by);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workpaper_id UUID REFERENCES workpapers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES people(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_workpaper ON evidence(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by ON evidence(uploaded_by);

-- ========================================
-- FINDINGS & RECOMMENDATIONS
-- ========================================

-- Findings
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    cause TEXT,
    effect TEXT,
    criteria TEXT, -- Reference to policy/law/standard
    risk_rating TEXT CHECK (risk_rating IN ('Critical', 'High', 'Medium', 'Low')),
    severity TEXT CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    likelihood TEXT CHECK (likelihood IN ('Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare')),
    impact_area TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Approved', 'Closed')),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_findings_engagement ON findings(engagement_id);
CREATE INDEX IF NOT EXISTS idx_findings_risk_rating ON findings(risk_rating);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_created_by ON findings(created_by);

-- Finding Evidence (link findings to evidence)
CREATE TABLE IF NOT EXISTS finding_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(finding_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_finding_evidence_finding ON finding_evidence(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_evidence_evidence ON finding_evidence(evidence_id);

-- Recommendations (links to legal cases if legal_case table exists)
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    owner_unit_id UUID REFERENCES org_units(id),
    owner_person_id UUID REFERENCES people(id),
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Manager Review', 'Approved', 'Published', 'Implementing', 'Verified', 'Closed')),
    approved_by UUID REFERENCES people(id),
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    legal_case_linked BOOLEAN DEFAULT false,
    legal_case_id UUID, -- Will reference legal_cases if it exists
    region_code TEXT,
    parcel_ref TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_finding ON recommendations(finding_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_owner_unit ON recommendations(owner_unit_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_owner_person ON recommendations(owner_person_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_target_date ON recommendations(target_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_legal_case ON recommendations(legal_case_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_tags ON recommendations USING gin(tags);

-- Action Plans
CREATE TABLE IF NOT EXISTS action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    owner_person_id UUID REFERENCES people(id),
    start_date DATE,
    target_date DATE NOT NULL,
    progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Overdue', 'Verified')),
    notes TEXT,
    last_update_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_plans_recommendation ON action_plans(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_owner ON action_plans(owner_person_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_target_date ON action_plans(target_date);

-- Action Evidence
CREATE TABLE IF NOT EXISTS action_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_plan_id UUID REFERENCES action_plans(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    note TEXT,
    uploaded_by UUID REFERENCES people(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_evidence_action_plan ON action_evidence(action_plan_id);

-- ========================================
-- EVENTS & NOTIFICATIONS (may already exist)
-- ========================================

-- Events (Audit Log)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID REFERENCES people(id),
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES people(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);

-- ========================================
-- VIEWS
-- ========================================

-- Drop and recreate view to ensure it's up to date
DROP VIEW IF EXISTS published_recommendations_view;

CREATE VIEW published_recommendations_view AS
SELECT
    r.id as recommendation_id,
    r.finding_id,
    f.engagement_id,
    f.title as finding_title,
    r.recommendation_text,
    f.risk_rating,
    r.priority,
    ou.name as owner_unit,
    ou.code as owner_unit_code,
    p.full_name as owner_person,
    r.target_date,
    r.published_at,
    r.legal_case_linked,
    r.legal_case_id,
    r.region_code,
    r.parcel_ref,
    r.tags,
    e.title as engagement_title,
    e.org_unit_id,
    ou2.name as engagement_org_unit,
    r.status
FROM recommendations r
JOIN findings f ON r.finding_id = f.id
JOIN engagements e ON f.engagement_id = e.id
LEFT JOIN org_units ou ON r.owner_unit_id = ou.id
LEFT JOIN org_units ou2 ON e.org_unit_id = ou2.id
LEFT JOIN people p ON r.owner_person_id = p.id
WHERE r.status IN ('Published', 'Implementing', 'Verified', 'Closed');

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to publish a recommendation
CREATE OR REPLACE FUNCTION publish_recommendation(rec_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_status TEXT;
BEGIN
    -- Get current status
    SELECT status INTO current_status FROM recommendations WHERE id = rec_id;

    -- Check if already published
    IF current_status IN ('Published', 'Implementing', 'Verified', 'Closed') THEN
        RAISE EXCEPTION 'Recommendation already published or in later stage';
    END IF;

    -- Update status to Published
    UPDATE recommendations
    SET status = 'Published',
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = rec_id AND status = 'Approved';

    -- Log event
    INSERT INTO events (type, entity, entity_id, payload)
    VALUES ('publish', 'recommendation', rec_id, jsonb_build_object('timestamp', NOW()));

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link recommendation to legal case
CREATE OR REPLACE FUNCTION link_to_legal(rec_id UUID, case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE recommendations
    SET legal_case_linked = true,
        legal_case_id = case_id,
        updated_at = NOW()
    WHERE id = rec_id;

    -- Log event
    INSERT INTO events (type, entity, entity_id, payload)
    VALUES ('link_legal', 'recommendation', rec_id, jsonb_build_object('legal_case_id', case_id, 'timestamp', NOW()));

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update action plan progress
CREATE OR REPLACE FUNCTION update_action_progress(plan_id UUID, progress INTEGER, note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE action_plans
    SET progress_pct = progress,
        status = CASE
            WHEN progress = 100 THEN 'Completed'
            WHEN progress > 0 THEN 'In Progress'
            ELSE 'Not Started'
        END,
        notes = COALESCE(note, notes),
        last_update_at = NOW()
    WHERE id = plan_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_org_units_updated_at ON org_units;
DROP TRIGGER IF EXISTS update_people_updated_at ON people;
DROP TRIGGER IF EXISTS update_obligations_updated_at ON obligations;
DROP TRIGGER IF EXISTS update_controls_updated_at ON controls;
DROP TRIGGER IF EXISTS update_engagements_updated_at ON engagements;
DROP TRIGGER IF EXISTS update_workpapers_updated_at ON workpapers;
DROP TRIGGER IF EXISTS update_findings_updated_at ON findings;
DROP TRIGGER IF EXISTS update_recommendations_updated_at ON recommendations;

-- Create triggers
CREATE TRIGGER update_org_units_updated_at BEFORE UPDATE ON org_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obligations_updated_at BEFORE UPDATE ON obligations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at BEFORE UPDATE ON engagements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workpapers_updated_at BEFORE UPDATE ON workpapers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SEED DATA (Only if tables are empty)
-- ========================================

-- Insert sample org units only if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM org_units LIMIT 1) THEN
        INSERT INTO org_units (name, code, description) VALUES
            ('Corporate Office', 'CORP', 'Main corporate office'),
            ('Legal Department', 'LEGAL', 'Legal and compliance department'),
            ('Finance Department', 'FIN', 'Finance and accounting'),
            ('Operations', 'OPS', 'Operations department'),
            ('IT Department', 'IT', 'Information Technology');
    END IF;
END $$;

-- Insert sample obligations only if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM obligations LIMIT 1) THEN
        INSERT INTO obligations (title, ref_code, source, description, level) VALUES
            ('Data Protection Act', 'DPA-2023', 'Act', 'National data protection legislation', 'National'),
            ('Financial Reporting Standards', 'FRS-101', 'Standard', 'Financial reporting requirements', 'National'),
            ('Internal Audit Policy', 'IAP-001', 'Policy', 'Internal audit framework and procedures', 'Internal');
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE engagements IS 'Audit engagements - planning and execution';
COMMENT ON TABLE findings IS 'Audit findings from fieldwork';
COMMENT ON TABLE recommendations IS 'Recommendations based on findings - can link to legal cases';
COMMENT ON TABLE action_plans IS 'Action plans to address recommendations';
COMMENT ON VIEW published_recommendations_view IS 'Published recommendations for Legal CMS integration';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'DLPP Audit & Compliance System schema created successfully!';
    RAISE NOTICE 'Compatible with existing Legal Case Management System.';
    RAISE NOTICE 'Recommendations can now link to legal_cases table if it exists.';
END $$;

-- ============================================================
-- >>> migrations/002_rls_policies.sql
-- ============================================================
-- ========================================
-- Row Level Security Policies
-- DLPP Internal Audit & Compliance System
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
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Helper function to get current user's person record
-- ========================================
CREATE OR REPLACE FUNCTION current_person()
RETURNS UUID AS $$
    SELECT id FROM people WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_person_role()
RETURNS TEXT AS $$
    SELECT role FROM people WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ========================================
-- ORG_UNITS POLICIES
-- ========================================

-- All authenticated users can view org units
CREATE POLICY "org_units_select" ON org_units
    FOR SELECT
    TO authenticated
    USING (true);

-- Only Audit Admins can insert/update/delete
CREATE POLICY "org_units_insert" ON org_units
    FOR INSERT
    TO authenticated
    WITH CHECK (current_person_role() = 'Audit Admin');

CREATE POLICY "org_units_update" ON org_units
    FOR UPDATE
    TO authenticated
    USING (current_person_role() = 'Audit Admin');

CREATE POLICY "org_units_delete" ON org_units
    FOR DELETE
    TO authenticated
    USING (current_person_role() = 'Audit Admin');

-- ========================================
-- PEOPLE POLICIES
-- ========================================

-- Users can view all people in the system
CREATE POLICY "people_select" ON people
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own record
CREATE POLICY "people_update_own" ON people
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Only Audit Admins can insert/delete people
CREATE POLICY "people_insert" ON people
    FOR INSERT
    TO authenticated
    WITH CHECK (current_person_role() = 'Audit Admin');

CREATE POLICY "people_delete" ON people
    FOR DELETE
    TO authenticated
    USING (current_person_role() = 'Audit Admin');

-- ========================================
-- OBLIGATIONS POLICIES
-- ========================================

-- All authenticated users can view obligations
CREATE POLICY "obligations_select" ON obligations
    FOR SELECT
    TO authenticated
    USING (true);

-- Audit Admins and Audit Managers can manage obligations
CREATE POLICY "obligations_insert" ON obligations
    FOR INSERT
    TO authenticated
    WITH CHECK (current_person_role() IN ('Audit Admin', 'Audit Manager'));

CREATE POLICY "obligations_update" ON obligations
    FOR UPDATE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

CREATE POLICY "obligations_delete" ON obligations
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- CONTROLS POLICIES
-- ========================================

-- All authenticated users can view controls
CREATE POLICY "controls_select" ON controls
    FOR SELECT
    TO authenticated
    USING (true);

-- Audit Admins, Managers, and Auditors can manage controls
CREATE POLICY "controls_insert" ON controls
    FOR INSERT
    TO authenticated
    WITH CHECK (current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor'));

CREATE POLICY "controls_update" ON controls
    FOR UPDATE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor'));

CREATE POLICY "controls_delete" ON controls
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- ENGAGEMENTS POLICIES
-- ========================================

-- Users can view engagements they're involved in or all if admin/manager
CREATE POLICY "engagements_select" ON engagements
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        lead_id = current_person() OR
        created_by = current_person() OR
        id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person())
    );

-- Managers can create engagements
CREATE POLICY "engagements_insert" ON engagements
    FOR INSERT
    TO authenticated
    WITH CHECK (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- Managers and leads can update engagements
CREATE POLICY "engagements_update" ON engagements
    FOR UPDATE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        lead_id = current_person()
    );

-- Only Admins can delete engagements
CREATE POLICY "engagements_delete" ON engagements
    FOR DELETE
    TO authenticated
    USING (current_person_role() = 'Audit Admin');

-- ========================================
-- ENGAGEMENT_TEAM POLICIES
-- ========================================

CREATE POLICY "engagement_team_select" ON engagement_team
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        person_id = current_person() OR
        engagement_id IN (SELECT id FROM engagements WHERE lead_id = current_person())
    );

CREATE POLICY "engagement_team_insert" ON engagement_team
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        engagement_id IN (SELECT id FROM engagements WHERE lead_id = current_person())
    );

CREATE POLICY "engagement_team_delete" ON engagement_team
    FOR DELETE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        engagement_id IN (SELECT id FROM engagements WHERE lead_id = current_person())
    );

-- ========================================
-- WORKPAPERS POLICIES
-- ========================================

CREATE POLICY "workpapers_select" ON workpapers
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        created_by = current_person() OR
        engagement_id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person())
    );

CREATE POLICY "workpapers_insert" ON workpapers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor') AND
        (engagement_id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person()) OR
         current_person_role() IN ('Audit Admin', 'Audit Manager'))
    );

CREATE POLICY "workpapers_update" ON workpapers
    FOR UPDATE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        created_by = current_person()
    );

CREATE POLICY "workpapers_delete" ON workpapers
    FOR DELETE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        created_by = current_person()
    );

-- ========================================
-- EVIDENCE POLICIES
-- ========================================

CREATE POLICY "evidence_select" ON evidence
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        uploaded_by = current_person() OR
        workpaper_id IN (
            SELECT id FROM workpapers WHERE
            engagement_id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person())
        )
    );

CREATE POLICY "evidence_insert" ON evidence
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor')
    );

CREATE POLICY "evidence_delete" ON evidence
    FOR DELETE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        uploaded_by = current_person()
    );

-- ========================================
-- FINDINGS POLICIES
-- ========================================

CREATE POLICY "findings_select" ON findings
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        created_by = current_person() OR
        engagement_id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person())
    );

CREATE POLICY "findings_insert" ON findings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor') AND
        (engagement_id IN (SELECT engagement_id FROM engagement_team WHERE person_id = current_person()) OR
         current_person_role() IN ('Audit Admin', 'Audit Manager'))
    );

CREATE POLICY "findings_update" ON findings
    FOR UPDATE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        created_by = current_person()
    );

CREATE POLICY "findings_delete" ON findings
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- FINDING_EVIDENCE POLICIES
-- ========================================

CREATE POLICY "finding_evidence_select" ON finding_evidence
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        finding_id IN (SELECT id FROM findings WHERE created_by = current_person())
    );

CREATE POLICY "finding_evidence_insert" ON finding_evidence
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor')
    );

CREATE POLICY "finding_evidence_delete" ON finding_evidence
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- RECOMMENDATIONS POLICIES
-- ========================================

CREATE POLICY "recommendations_select" ON recommendations
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only', 'System Integrator') OR
        owner_person_id = current_person() OR
        finding_id IN (SELECT id FROM findings WHERE created_by = current_person())
    );

CREATE POLICY "recommendations_insert" ON recommendations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Auditor')
    );

-- Only Managers can approve/publish recommendations
CREATE POLICY "recommendations_update" ON recommendations
    FOR UPDATE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        (owner_person_id = current_person() AND status NOT IN ('Draft', 'Manager Review'))
    )
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        (owner_person_id = current_person() AND status NOT IN ('Approved', 'Published'))
    );

CREATE POLICY "recommendations_delete" ON recommendations
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- ACTION_PLANS POLICIES
-- ========================================

CREATE POLICY "action_plans_select" ON action_plans
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        owner_person_id = current_person() OR
        recommendation_id IN (SELECT id FROM recommendations WHERE owner_person_id = current_person())
    );

CREATE POLICY "action_plans_insert" ON action_plans
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Action Owner')
    );

-- Action owners can update their own action plans
CREATE POLICY "action_plans_update" ON action_plans
    FOR UPDATE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        owner_person_id = current_person()
    );

CREATE POLICY "action_plans_delete" ON action_plans
    FOR DELETE
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager'));

-- ========================================
-- ACTION_EVIDENCE POLICIES
-- ========================================

CREATE POLICY "action_evidence_select" ON action_evidence
    FOR SELECT
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        uploaded_by = current_person() OR
        action_plan_id IN (SELECT id FROM action_plans WHERE owner_person_id = current_person())
    );

CREATE POLICY "action_evidence_insert" ON action_evidence
    FOR INSERT
    TO authenticated
    WITH CHECK (
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Action Owner')
    );

CREATE POLICY "action_evidence_delete" ON action_evidence
    FOR DELETE
    TO authenticated
    USING (
        current_person_role() IN ('Audit Admin', 'Audit Manager') OR
        uploaded_by = current_person()
    );

-- ========================================
-- EVENTS POLICIES (Audit Log)
-- ========================================

-- All authenticated users can view events
CREATE POLICY "events_select" ON events
    FOR SELECT
    TO authenticated
    USING (current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only'));

-- System can insert events (handled by triggers/functions)
CREATE POLICY "events_insert" ON events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- No updates or deletes on audit log
-- Events are immutable

-- ========================================
-- NOTIFICATIONS POLICIES
-- ========================================

-- Users can view their own notifications
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT
    TO authenticated
    USING (recipient_id = current_person());

-- System can create notifications
CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update (mark as read) their own notifications
CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE
    TO authenticated
    USING (recipient_id = current_person())
    WITH CHECK (recipient_id = current_person());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete" ON notifications
    FOR DELETE
    TO authenticated
    USING (recipient_id = current_person());

-- ========================================
-- PUBLISHED_RECOMMENDATIONS_VIEW POLICY
-- ========================================

-- Note: RLS on views requires underlying table policies
-- System Integrator role can access published recommendations
CREATE POLICY "published_recommendations_view_access" ON recommendations
    FOR SELECT
    TO authenticated
    USING (
        (current_person_role() = 'System Integrator' AND status IN ('Published', 'Implementing', 'Verified', 'Closed')) OR
        current_person_role() IN ('Audit Admin', 'Audit Manager', 'Read-Only') OR
        owner_person_id = current_person()
    );

-- ============================================================
-- >>> migrations/003_risk_governance_modules.sql
-- ============================================================
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

-- ============================================================
-- >>> migrations/004_risk_register_integration.sql
-- ============================================================
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

-- ============================================================
-- >>> migrations/005_central_risk_event_repository.sql
-- ============================================================
-- =============================================
-- CENTRAL RISK EVENT REPOSITORY MIGRATION
-- The mandatory gateway between Risk Register and Audit Activities
-- =============================================
--
-- GOLDEN RULE: All audit activities must originate from a Risk Event,
-- which must be anchored to the Risk Register.
--
-- Traceability Chain:
-- Risk Register → Risk Event → Audit Engagement → Tasks → Findings → Actions → Closure
--
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LOOKUP TABLES
-- =============================================

-- Audit Categories
CREATE TABLE IF NOT EXISTS audit_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    workflow_type TEXT CHECK (workflow_type IN (
        'Standard', 'Expedited', 'Investigation', 'Follow-up'
    )) DEFAULT 'Standard',
    requires_fieldwork BOOLEAN DEFAULT true,
    requires_management_response BOOLEAN DEFAULT true,
    typical_duration_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Audit Categories
INSERT INTO audit_categories (code, name, description, workflow_type, requires_fieldwork, requires_management_response, typical_duration_days) VALUES
('FIN', 'Financial Audit', 'Audit of financial statements, transactions, and controls', 'Standard', true, true, 45),
('CMP', 'Compliance Audit', 'Review of compliance with laws, regulations, and policies', 'Standard', true, true, 30),
('OPS', 'Operational Audit', 'Assessment of operational efficiency and effectiveness', 'Standard', true, true, 30),
('ICT', 'ICT / Systems Audit', 'Audit of information systems, security, and IT controls', 'Standard', true, true, 30),
('VFM', 'Performance / Value-for-Money Audit', 'Assessment of economy, efficiency, and effectiveness', 'Standard', true, true, 60),
('INV', 'Special Investigation', 'Investigation of fraud, misconduct, or irregularities', 'Investigation', true, true, 45),
('FUP', 'Follow-up Audit', 'Verification of implementation of prior recommendations', 'Follow-up', false, true, 14)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- CENTRAL RISK EVENT REPOSITORY
-- =============================================

CREATE TABLE IF NOT EXISTS audit_risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event Identity
    event_code TEXT UNIQUE NOT NULL,  -- System generated: RE-2024-001
    event_title TEXT NOT NULL,
    event_description TEXT NOT NULL,

    -- Source Classification
    source_type TEXT NOT NULL CHECK (source_type IN (
        'AAAP',              -- Annual Audit Activity Planning
        'Secretary',         -- Secretary Directive (overrides priority)
        'External',          -- External request (Auditor-General, etc.)
        'Internal'           -- Internal request from divisions
    )),

    -- Secretary Directive Details (if source_type = 'Secretary')
    directive_reference TEXT,         -- Formal reference number
    directive_date DATE,              -- Date of directive
    directive_issuer TEXT,            -- Name/title of issuer
    is_priority_override BOOLEAN DEFAULT false,  -- Overrides normal planning

    -- Linked Risks (MANDATORY - at least one required)
    primary_risk_id UUID NOT NULL REFERENCES audit_risk_register(id),

    -- Event Classification
    audit_category_id UUID REFERENCES audit_categories(id),
    response_type TEXT NOT NULL CHECK (response_type IN (
        'Audit',
        'Review',
        'Investigation',
        'Information Request'
    )) DEFAULT 'Audit',

    -- Priority & Scheduling
    priority TEXT NOT NULL CHECK (priority IN (
        'Critical',   -- Immediate action required
        'High',       -- Urgent, within 2 weeks
        'Medium',     -- Normal priority
        'Low'         -- When resources available
    )) DEFAULT 'Medium',

    requested_start_date DATE,
    requested_completion_date DATE,

    -- Organizational Context
    target_division_id UUID REFERENCES audit_divisions(id),
    target_section_id UUID REFERENCES audit_sections(id),
    requesting_division_id UUID REFERENCES audit_divisions(id),
    requesting_officer_id UUID REFERENCES people(id),

    -- Event Lifecycle
    event_status TEXT NOT NULL DEFAULT 'Pending' CHECK (event_status IN (
        'Pending',           -- Awaiting Audit Manager review
        'Under Review',      -- Being assessed by Audit Manager
        'Approved',          -- Approved, awaiting resource allocation
        'Allocated',         -- Resources assigned, ready to start
        'In Progress',       -- Audit/review underway
        'On Hold',           -- Temporarily suspended
        'Completed',         -- All activities complete
        'Cancelled',         -- Event cancelled
        'Rejected'           -- Not approved for action
    )),

    -- Audit Manager Actions
    reviewed_by UUID REFERENCES people(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,

    -- Allocation
    allocated_by UUID REFERENCES people(id),
    allocated_at TIMESTAMPTZ,
    lead_auditor_id UUID REFERENCES people(id),

    -- Financial Year Context
    financial_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),

    -- Metadata
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Event to Multiple Risks Junction Table
CREATE TABLE IF NOT EXISTS audit_risk_event_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_event_id UUID NOT NULL REFERENCES audit_risk_events(id) ON DELETE CASCADE,
    risk_id UUID NOT NULL REFERENCES audit_risk_register(id),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(risk_event_id, risk_id)
);

-- Risk Event Documents (Secretary Notes, Directives, etc.)
CREATE TABLE IF NOT EXISTS audit_risk_event_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_event_id UUID NOT NULL REFERENCES audit_risk_events(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'Secretary Directive',
        'Formal Request',
        'Supporting Document',
        'Risk Assessment',
        'Approval Memo',
        'Other'
    )),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Event Timeline/Milestones
CREATE TABLE IF NOT EXISTS audit_risk_event_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_event_id UUID NOT NULL REFERENCES audit_risk_events(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    planned_date DATE NOT NULL,
    actual_date DATE,
    status TEXT DEFAULT 'Pending' CHECK (status IN (
        'Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Event Activity Log (Immutable)
CREATE TABLE IF NOT EXISTS audit_risk_event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_event_id UUID NOT NULL REFERENCES audit_risk_events(id),
    action_type TEXT NOT NULL CHECK (action_type IN (
        'Created', 'Updated', 'Status Changed', 'Reviewed',
        'Approved', 'Rejected', 'Allocated', 'Document Added',
        'Milestone Updated', 'Completed', 'Cancelled', 'Reopened'
    )),
    action_details TEXT,
    old_status TEXT,
    new_status TEXT,
    performed_by UUID REFERENCES people(id),
    performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INFORMATION REQUESTS
-- =============================================

CREATE TABLE IF NOT EXISTS audit_information_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Link to Audit Context
    risk_event_id UUID REFERENCES audit_risk_events(id),
    engagement_id UUID REFERENCES audit_engagements(id),

    -- Request Details
    request_code TEXT UNIQUE NOT NULL,  -- IR-2024-001
    request_title TEXT NOT NULL,
    request_description TEXT NOT NULL,

    -- Target
    target_type TEXT NOT NULL CHECK (target_type IN (
        'Internal Division',
        'Internal Section',
        'External Entity',
        'Auditor General'
    )),
    target_division_id UUID REFERENCES audit_divisions(id),
    target_section_id UUID REFERENCES audit_sections(id),
    target_external_entity TEXT,
    target_contact_name TEXT,
    target_contact_email TEXT,

    -- Responsible Party
    assigned_to UUID REFERENCES people(id),

    -- Timeline
    request_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    reminder_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN (
        'Draft',
        'Sent',
        'Pending',
        'Partially Received',
        'Received',
        'Overdue',
        'Cancelled'
    )),

    -- Response
    response_date DATE,
    response_notes TEXT,

    -- Metadata
    requested_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Information Request Documents (Requested & Received)
CREATE TABLE IF NOT EXISTS audit_information_request_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES audit_information_requests(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'Requested',    -- Document being requested
        'Received'      -- Document received in response
    )),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT,
    received_date DATE,
    uploaded_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- AUDIT TASKS (Granular Task Management)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Link to Context
    risk_event_id UUID REFERENCES audit_risk_events(id),
    engagement_id UUID REFERENCES audit_engagements(id),

    -- Task Details
    task_code TEXT,
    task_title TEXT NOT NULL,
    task_description TEXT,

    -- Assignment
    assigned_to UUID REFERENCES people(id),
    assigned_by UUID REFERENCES people(id),
    assigned_at TIMESTAMPTZ,

    -- Timeline
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,

    -- Status & Progress
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN (
        'Not Started',
        'In Progress',
        'Under Review',
        'Completed',
        'Blocked',
        'Cancelled'
    )),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

    -- Priority
    priority TEXT DEFAULT 'Medium' CHECK (priority IN (
        'Critical', 'High', 'Medium', 'Low'
    )),

    -- Notes
    notes TEXT,
    blockers TEXT,

    -- Metadata
    created_by UUID REFERENCES people(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- MODIFICATIONS TO EXISTING TABLES
-- =============================================

-- Add risk_event_id to audit_engagements (MANDATORY LINK)
ALTER TABLE audit_engagements
    ADD COLUMN IF NOT EXISTS risk_event_id UUID REFERENCES audit_risk_events(id);

-- Add audit_category_id to audit_engagements
ALTER TABLE audit_engagements
    ADD COLUMN IF NOT EXISTS audit_category_id UUID REFERENCES audit_categories(id);

-- Add lifecycle stage tracking
ALTER TABLE audit_engagements
    ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT CHECK (lifecycle_stage IN (
        'Planning',
        'Fieldwork',
        'Review',
        'Draft Report',
        'Management Response',
        'Final Report',
        'Closed'
    )) DEFAULT 'Planning';

-- Add stage timestamps
ALTER TABLE audit_engagements
    ADD COLUMN IF NOT EXISTS planning_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fieldwork_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fieldwork_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS review_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS draft_issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS response_received_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS final_issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_risk_events_code ON audit_risk_events(event_code);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_source ON audit_risk_events(source_type);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_status ON audit_risk_events(event_status);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_priority ON audit_risk_events(priority);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_primary_risk ON audit_risk_events(primary_risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_category ON audit_risk_events(audit_category_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_target_div ON audit_risk_events(target_division_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_events_year ON audit_risk_events(financial_year);
CREATE INDEX IF NOT EXISTS idx_audit_risk_event_risks_event ON audit_risk_event_risks(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_event_risks_risk ON audit_risk_event_risks(risk_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_event_docs_event ON audit_risk_event_documents(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_risk_event_log_event ON audit_risk_event_log(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_info_requests_event ON audit_information_requests(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_info_requests_engagement ON audit_information_requests(engagement_id);
CREATE INDEX IF NOT EXISTS idx_audit_info_requests_status ON audit_information_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_tasks_event ON audit_tasks(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_tasks_engagement ON audit_tasks(engagement_id);
CREATE INDEX IF NOT EXISTS idx_audit_tasks_assigned ON audit_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_tasks_status ON audit_tasks(status);
CREATE INDEX IF NOT EXISTS idx_audit_engagements_event ON audit_engagements(risk_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_engagements_category ON audit_engagements(audit_category_id);
CREATE INDEX IF NOT EXISTS idx_audit_engagements_lifecycle ON audit_engagements(lifecycle_stage);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE audit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_event_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_event_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_risk_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_information_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_information_request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY audit_categories_all ON audit_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_events_all ON audit_risk_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_event_risks_all ON audit_risk_event_risks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_event_documents_all ON audit_risk_event_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_event_milestones_all ON audit_risk_event_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_risk_event_log_select ON audit_risk_event_log FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_risk_event_log_insert ON audit_risk_event_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY audit_information_requests_all ON audit_information_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_information_request_documents_all ON audit_information_request_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_tasks_all ON audit_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-generate event_code
CREATE OR REPLACE FUNCTION generate_risk_event_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    year_code TEXT;
    seq_num INTEGER;
BEGIN
    year_code := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(event_code FROM 'RE-' || year_code || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM audit_risk_events
    WHERE event_code LIKE 'RE-' || year_code || '-%';

    NEW.event_code := 'RE-' || year_code || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_risk_event_code ON audit_risk_events;
CREATE TRIGGER trigger_generate_risk_event_code
    BEFORE INSERT ON audit_risk_events
    FOR EACH ROW
    WHEN (NEW.event_code IS NULL OR NEW.event_code = '')
    EXECUTE FUNCTION generate_risk_event_code();

-- Auto-generate information request code
CREATE OR REPLACE FUNCTION generate_info_request_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    year_code TEXT;
    seq_num INTEGER;
BEGIN
    year_code := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(request_code FROM 'IR-' || year_code || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM audit_information_requests
    WHERE request_code LIKE 'IR-' || year_code || '-%';

    NEW.request_code := 'IR-' || year_code || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_info_request_code ON audit_information_requests;
CREATE TRIGGER trigger_generate_info_request_code
    BEFORE INSERT ON audit_information_requests
    FOR EACH ROW
    WHEN (NEW.request_code IS NULL OR NEW.request_code = '')
    EXECUTE FUNCTION generate_info_request_code();

-- Log risk event changes
CREATE OR REPLACE FUNCTION log_risk_event_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_risk_event_log (risk_event_id, action_type, new_status, performed_by)
        VALUES (NEW.id, 'Created', NEW.event_status, NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.event_status IS DISTINCT FROM NEW.event_status THEN
            INSERT INTO audit_risk_event_log (risk_event_id, action_type, old_status, new_status, performed_by)
            VALUES (NEW.id, 'Status Changed', OLD.event_status, NEW.event_status, NEW.reviewed_by);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_risk_event_changes ON audit_risk_events;
CREATE TRIGGER trigger_log_risk_event_changes
    AFTER INSERT OR UPDATE ON audit_risk_events
    FOR EACH ROW
    EXECUTE FUNCTION log_risk_event_changes();

-- Auto-add primary risk to junction table
CREATE OR REPLACE FUNCTION sync_primary_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert or update primary risk in junction table
    INSERT INTO audit_risk_event_risks (risk_event_id, risk_id, is_primary)
    VALUES (NEW.id, NEW.primary_risk_id, true)
    ON CONFLICT (risk_event_id, risk_id)
    DO UPDATE SET is_primary = true;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_primary_risk ON audit_risk_events;
CREATE TRIGGER trigger_sync_primary_risk
    AFTER INSERT OR UPDATE OF primary_risk_id ON audit_risk_events
    FOR EACH ROW
    EXECUTE FUNCTION sync_primary_risk();

-- =============================================
-- VIEWS
-- =============================================

-- Risk Event Summary View
CREATE OR REPLACE VIEW audit_risk_event_summary AS
SELECT
    re.id,
    re.event_code,
    re.event_title,
    re.source_type,
    re.response_type,
    re.priority,
    re.event_status,
    re.financial_year,
    re.created_at,
    rr.risk_code,
    rr.risk_title,
    rr.residual_risk_rating,
    ac.code AS category_code,
    ac.name AS category_name,
    td.name AS target_division,
    la.full_name AS lead_auditor,
    COUNT(DISTINCT e.id) AS engagement_count,
    COUNT(DISTINCT t.id) AS task_count
FROM audit_risk_events re
LEFT JOIN audit_risk_register rr ON rr.id = re.primary_risk_id
LEFT JOIN audit_categories ac ON ac.id = re.audit_category_id
LEFT JOIN audit_divisions td ON td.id = re.target_division_id
LEFT JOIN people la ON la.id = re.lead_auditor_id
LEFT JOIN audit_engagements e ON e.risk_event_id = re.id
LEFT JOIN audit_tasks t ON t.risk_event_id = re.id
GROUP BY re.id, re.event_code, re.event_title, re.source_type, re.response_type,
         re.priority, re.event_status, re.financial_year, re.created_at,
         rr.risk_code, rr.risk_title, rr.residual_risk_rating,
         ac.code, ac.name, td.name, la.full_name;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
SELECT 'Central Risk Event Repository migration complete!' AS status,
       (SELECT COUNT(*) FROM audit_categories) AS audit_categories,
       'All audit activities must now originate from a Risk Event' AS note;

-- ============================================================
-- >>> migrations/006_rbac_system.sql
-- ============================================================
-- =============================================
-- RBAC (Role-Based Access Control) System
-- Migration 006: Create RBAC tables for landauditsystem
-- =============================================

-- =============================================
-- GROUPS TABLE
-- User groups/roles with descriptions
-- =============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULES TABLE
-- System modules/features that can have permissions
-- =============================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL,
    module_key VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) DEFAULT 'core',
    icon VARCHAR(50),
    route VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GROUP MODULE PERMISSIONS TABLE
-- Permission matrix: which groups can do what on which modules
-- =============================================
CREATE TABLE IF NOT EXISTS group_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_print BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, module_id)
);

-- =============================================
-- USER GROUPS TABLE
-- Junction table: which users belong to which groups
-- =============================================
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id, group_id)
);

-- =============================================
-- AUDIT USERS TABLE (optional, for extended user info)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    phone VARCHAR(50),
    division_id UUID REFERENCES audit_divisions(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT LOG TABLE
-- Track user actions for compliance
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    module_id UUID REFERENCES modules(id),
    action VARCHAR(20) NOT NULL, -- create, read, update, delete, print, export, approve
    record_id UUID,
    record_type VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_group_permissions_group ON group_module_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_module ON group_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON audit_log(module_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_logged_at ON audit_log(logged_at);

-- =============================================
-- RLS POLICIES (Anonymous read for development)
-- =============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Anonymous read policies for development
DROP POLICY IF EXISTS groups_anon_read ON groups;
CREATE POLICY groups_anon_read ON groups FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS modules_anon_read ON modules;
CREATE POLICY modules_anon_read ON modules FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS group_permissions_anon_read ON group_module_permissions;
CREATE POLICY group_permissions_anon_read ON group_module_permissions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS user_groups_anon_read ON user_groups;
CREATE POLICY user_groups_anon_read ON user_groups FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_users_anon_read ON audit_users;
CREATE POLICY audit_users_anon_read ON audit_users FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_log_anon_read ON audit_log;
CREATE POLICY audit_log_anon_read ON audit_log FOR SELECT TO anon USING (true);

-- Anonymous write policies for development
DROP POLICY IF EXISTS groups_anon_insert ON groups;
CREATE POLICY groups_anon_insert ON groups FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS groups_anon_update ON groups;
CREATE POLICY groups_anon_update ON groups FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS groups_anon_delete ON groups;
CREATE POLICY groups_anon_delete ON groups FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS modules_anon_insert ON modules;
CREATE POLICY modules_anon_insert ON modules FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS modules_anon_update ON modules;
CREATE POLICY modules_anon_update ON modules FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS modules_anon_delete ON modules;
CREATE POLICY modules_anon_delete ON modules FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS group_permissions_anon_insert ON group_module_permissions;
CREATE POLICY group_permissions_anon_insert ON group_module_permissions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS group_permissions_anon_update ON group_module_permissions;
CREATE POLICY group_permissions_anon_update ON group_module_permissions FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS group_permissions_anon_delete ON group_module_permissions;
CREATE POLICY group_permissions_anon_delete ON group_module_permissions FOR DELETE TO anon USING (true);

-- =============================================
-- SEED DEFAULT MODULES
-- =============================================
INSERT INTO modules (module_name, module_key, category, description) VALUES
-- Core
('Dashboard', 'dashboard', 'core', 'Main dashboard with KPIs and overview'),
('Risk Register', 'risk_register', 'core', 'Authoritative risk landscape for DLPP'),
('Risk Events', 'risk_events', 'core', 'Central repository for audit triggers'),

-- Audit Workflow
('Engagements', 'engagements', 'audit_workflow', 'Audit engagement management'),
('Fieldwork', 'fieldwork', 'audit_workflow', 'Fieldwork and evidence collection'),
('Findings', 'findings', 'audit_workflow', 'Audit findings documentation'),
('Recommendations', 'recommendations', 'audit_workflow', 'Audit recommendations'),
('Action Plans', 'action_plans', 'audit_workflow', 'Action plan tracking and follow-up'),

-- Risk & Governance
('Risk Profiles', 'risk_profiles', 'risk_governance', 'Division risk profiles'),
('PSAP Scorecard', 'psap_scorecard', 'risk_governance', 'Performance assessment scorecard'),
('KRA & Workplan', 'kra_workplan', 'risk_governance', 'Key result areas and work planning'),

-- Management
('Compliance', 'compliance', 'management', 'Compliance monitoring'),
('Reports', 'reports', 'management', 'Audit reports generation'),

-- Administration
('User Management', 'users', 'administration', 'Manage system users'),
('Group Management', 'groups', 'administration', 'Manage user groups and permissions'),
('Module Management', 'modules', 'administration', 'Configure system modules'),
('Division Management', 'divisions', 'administration', 'Manage DLPP divisions')
ON CONFLICT (module_key) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'RBAC tables created successfully!' AS status;

SELECT 'Modules seeded:' AS info, COUNT(*) AS count FROM modules;

-- ============================================================
-- >>> migrations/007_auditor_profiles.sql
-- ============================================================
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

-- ============================================================
-- >>> migrations/008_shared_auth_integration.sql
-- ============================================================
-- =============================================
-- SHARED AUTHENTICATION INTEGRATION
-- Migration 008: Integrate with shared Supabase Auth
-- Compatible with: landauditsystem, landcasesystem, corporate system
-- =============================================
-- Idempotent: safe to run multiple times.
-- =============================================

-- =============================================
-- USER PROFILES (shared across all DLPP systems)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    -- Which systems this account may access: ["audit","cases","corporate"]
    system_access JSONB DEFAULT '["audit"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT-SPECIFIC USER PROFILE (audit system data)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    division_id UUID REFERENCES audit_divisions(id) ON DELETE SET NULL,
    section_id UUID REFERENCES audit_sections(id) ON DELETE SET NULL,

    employee_id TEXT UNIQUE,
    position TEXT,
    grade_level TEXT,
    department TEXT DEFAULT 'Internal Audit Unit',

    highest_qualification TEXT,
    qualification_field TEXT,
    university TEXT,
    graduation_year INTEGER,
    years_of_experience INTEGER DEFAULT 0,

    certifications JSONB DEFAULT '[]'::jsonb,
    specializations JSONB DEFAULT '[]'::jsonb,
    training_records JSONB DEFAULT '[]'::jsonb,

    max_concurrent_engagements INTEGER DEFAULT 2,
    current_workload INTEGER DEFAULT 0,
    availability_status TEXT DEFAULT 'Available',

    total_audits_completed INTEGER DEFAULT 0,
    total_findings_identified INTEGER DEFAULT 0,

    date_joined DATE,
    skills_summary TEXT,
    notes TEXT,
    profile_status TEXT DEFAULT 'Active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_system_access ON public.user_profiles USING gin(system_access);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_user ON public.audit_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_division ON public.audit_user_profiles(division_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_status ON public.audit_user_profiles(profile_status);

-- =============================================
-- POINT user_groups AT auth.users
-- =============================================
ALTER TABLE public.user_groups DROP CONSTRAINT IF EXISTS user_groups_user_id_fkey;
ALTER TABLE public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- MIGRATE EXISTING audit_users (only those that exist in auth.users)
-- =============================================
INSERT INTO public.user_profiles (id, full_name, phone, system_access, is_active, created_at)
SELECT id, full_name, phone, '["audit"]'::jsonb, COALESCE(is_active, true), COALESCE(created_at, NOW())
FROM public.audit_users
WHERE id IN (SELECT id FROM auth.users)
ON CONFLICT (id) DO UPDATE
   SET full_name = EXCLUDED.full_name,
       phone     = EXCLUDED.phone,
       is_active = EXCLUDED.is_active;

INSERT INTO public.audit_user_profiles (user_id, division_id, position, date_joined)
SELECT id, division_id, 'Staff Member', COALESCE(created_at::date, CURRENT_DATE)
FROM public.audit_users
WHERE id IN (SELECT id FROM auth.users)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_user_profiles ENABLE ROW LEVEL SECURITY;

-- user_profiles: anyone authenticated can read; users update own; admins all.
-- (Anon read kept for current dev mode — tighten for production.)
DROP POLICY IF EXISTS user_profiles_anon_read ON public.user_profiles;
CREATE POLICY user_profiles_anon_read ON public.user_profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS user_profiles_auth_read ON public.user_profiles;
CREATE POLICY user_profiles_auth_read ON public.user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_admin_all ON public.user_profiles;
CREATE POLICY user_profiles_admin_all ON public.user_profiles
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_groups ug
        JOIN public.groups g ON ug.group_id = g.id
        WHERE ug.user_id = auth.uid() AND g.group_name = 'Super Admin'
    ));

-- Allow inserts (needed by the new-user trigger + admin user creation in dev)
DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles;
CREATE POLICY user_profiles_insert ON public.user_profiles
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- audit_user_profiles
DROP POLICY IF EXISTS audit_user_profiles_anon_read ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_anon_read ON public.audit_user_profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_user_profiles_auth_read ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_auth_read ON public.audit_user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS audit_user_profiles_update_own ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_update_own ON public.audit_user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS audit_user_profiles_write ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_write ON public.audit_user_profiles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================
-- Auto-create a user_profile when a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, system_access, is_active)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        '["audit"]'::jsonb,
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_user_profiles_updated_at ON public.audit_user_profiles;
CREATE TRIGGER trg_audit_user_profiles_updated_at
    BEFORE UPDATE ON public.audit_user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- HELPER: check system access
-- =============================================
CREATE OR REPLACE FUNCTION public.user_has_system_access(p_user_id UUID, p_system TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_user_id AND is_active = true AND system_access ? p_system
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- BACKFILL profiles for ALL existing auth users (so nobody is locked out)
-- =============================================
INSERT INTO public.user_profiles (id, full_name, system_access, is_active)
SELECT u.id, u.raw_user_meta_data->>'full_name', '["audit","cases","corporate"]'::jsonb, true
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Shared auth integration complete.' AS status;
SELECT 'user_profiles' AS table_name, COUNT(*) AS rows FROM public.user_profiles
UNION ALL
SELECT 'audit_user_profiles', COUNT(*) FROM public.audit_user_profiles;

-- ============================================================
-- >>> migrations/009_fieldwork_workpapers.sql
-- ============================================================
-- =============================================
-- FIELDWORK / WORKPAPERS MODULE
-- Migration 009 (adapted to the live schema)
-- =============================================
-- NOTE: This project already had an `audit_workpapers` table with the columns
-- below. The app stores the rich workpaper fields (test_objective, result,
-- conclusion, conclusion_rating, status, prepared_by, wp_number) and the
-- evidence[] list INSIDE the `metadata` (jsonb) column, and it stores the two
-- real free-text columns `procedure` and `sample_ref` directly.
--
-- Writes (create/update/delete + evidence upload) are performed server-side in
-- Next.js API routes using the SERVICE ROLE key, which bypasses RLS. Therefore
-- only a SELECT policy for anon/authenticated is required for the browser to
-- read the list. This file is idempotent and safe to run on a fresh database.
-- =============================================

CREATE TABLE IF NOT EXISTS audit_workpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    procedure TEXT,
    sample_ref TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workpapers_engagement ON audit_workpapers(engagement_id);

-- updated_at trigger (reuses function from 001_initial_schema.sql)
DROP TRIGGER IF EXISTS update_audit_workpapers_updated_at ON audit_workpapers;
CREATE TRIGGER update_audit_workpapers_updated_at
    BEFORE UPDATE ON audit_workpapers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: browser reads only; writes are done via the service role (API routes).
ALTER TABLE audit_workpapers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workpapers_anon_read ON audit_workpapers;
CREATE POLICY workpapers_anon_read ON audit_workpapers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS workpapers_auth_read ON audit_workpapers;
CREATE POLICY workpapers_auth_read ON audit_workpapers
  FOR SELECT TO authenticated USING (true);

-- Optional: allow authenticated users to write directly as well. The app does
-- not rely on this (it uses the service role), but it is convenient if you want
-- client-side writes later. Uncomment to enable:
-- DROP POLICY IF EXISTS workpapers_auth_write ON audit_workpapers;
-- CREATE POLICY workpapers_auth_write ON audit_workpapers
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- PRIVATE STORAGE BUCKET FOR EVIDENCE
-- The app also creates this automatically via the service role on first upload.
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('workpaper-evidence', 'workpaper-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- >>> audit_system_with_prefixes.sql (prefixed workflow + governance)
-- ============================================================
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

-- >>> migrations/010_create_audit_users_and_user_groups.sql
-- =============================================================================
-- Migration: create_audit_users_and_user_groups
-- Fixes the User Management bug:
--   "Could not find the table 'public.audit_users' in the schema cache"
-- Target Supabase project: yvnkyjnwvylrweyzvibs
--
-- VERIFIED live state of the target project BEFORE writing this migration
-- (introspected via the PostgREST OpenAPI spec using the service_role key):
--   * public.audit_divisions  EXISTS   -> id is  uuid   (has columns: code, name)
--   * public.groups           EXISTS   -> id is  uuid   (id, group_name, description,
--                                                        created_at, updated_at, is_active)
--   * public.user_groups      EXISTS   -> id uuid PK, user_id uuid, group_id uuid,
--                                         assigned_at, assigned_by, is_active
--                                         and ALREADY has FK  user_groups.group_id -> groups(id)
--   * public.audit_users      MISSING  <-- root cause of the bug
--
-- Because audit_divisions.id and groups.id are BOTH uuid, every FK column below
-- is uuid so PostgREST can resolve the embedded joins used by the app:
--     audit_users.division_id -> audit_divisions(id)   (for  audit_divisions(name, code) )
--     user_groups.group_id    -> groups(id)            (for  groups(...) — already present)
--
-- This migration is fully idempotent and safe to run more than once.
-- =============================================================================

-- 1) audit_users -- the only genuinely missing table --------------------------
--    The client supplies `id` as a UUID string on insert; gen_random_uuid()
--    remains as a fallback default.
CREATE TABLE IF NOT EXISTS public.audit_users (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       varchar(255) NOT NULL UNIQUE,
    full_name   varchar(200),
    phone       varchar(50),
    division_id uuid REFERENCES public.audit_divisions(id) ON DELETE SET NULL,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2) user_groups -- idempotent; a no-op on the target (already exists) --------
--    IMPORTANT: user_groups.user_id is intentionally NOT given a FK to
--    audit_users(id). The table already contains rows whose user_id values do
--    NOT exist in the freshly-created audit_users table, so adding that FK would
--    fail; and the app's embedded selects only require group_id -> groups(id),
--    which already exists. (This satisfies the "only if existing data allows"
--    rule for adding FKs to a pre-existing table.)
CREATE TABLE IF NOT EXISTS public.user_groups (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL,
    group_id    uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid,
    is_active   boolean NOT NULL DEFAULT true,
    UNIQUE (user_id, group_id)
);

-- 3) Guarantee the audit_users.division_id -> audit_divisions(id) FK exists ---
--    (covers the edge case where audit_users pre-existed WITHOUT the FK that
--     the audit_divisions(name, code) embedding relies on).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name       = 'audit_users'
          AND constraint_type  = 'FOREIGN KEY'
          AND constraint_name  = 'audit_users_division_id_fkey'
    ) THEN
        ALTER TABLE public.audit_users
            ADD CONSTRAINT audit_users_division_id_fkey
            FOREIGN KEY (division_id) REFERENCES public.audit_divisions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4) Indexes -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_users_division ON public.audit_users(division_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user     ON public.user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group    ON public.user_groups(group_id);

-- 5) Row Level Security ------------------------------------------------------
--    Permissive dev model matching the rest of this app: allow BOTH anon and
--    authenticated to read AND write these two tables.
ALTER TABLE public.audit_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_users_all ON public.audit_users;
CREATE POLICY audit_users_all ON public.audit_users
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS user_groups_all ON public.user_groups;
CREATE POLICY user_groups_all ON public.user_groups
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6) Detach the stale user_groups.user_id FK ---------------------------------
--    The pre-existing (shared) user_groups table has a FK
--    `user_groups_user_id_fkey` that points user_id at a DIFFERENT `users`
--    table (shared auth). This audit app stores its users in `audit_users`, so
--    that FK rejects linking an audit user to a group ("Key is not present in
--    table users"). The app filters user_groups by user_id in code and only
--    needs the group_id -> groups(id) FK (kept), so drop the user_id FK.
--    Existing rows are preserved; only the constraint is removed.
ALTER TABLE public.user_groups DROP CONSTRAINT IF EXISTS user_groups_user_id_fkey;

-- 7) Reload the PostgREST schema cache so the new table + FK relationships
--    are immediately resolvable by the REST API (removes the PGRST205 error).
NOTIFY pgrst, 'reload schema';

-- >>> migrations/011_auditor_profiles_and_rls_hardening.sql
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

-- >>> migrations/012_org_units_self_contained.sql
-- =============================================================================
-- Migration 012: Make the audit system self-contained in project yvnkyjnwvylrweyzvibs
--
-- WHY: A full table audit of this project found ONE app-critical table missing:
--        public.org_units   (PGRST205 "Could not find the table ... in schema cache")
--      The KRA / PSAP / Risk-Profile hooks embed `org_units(name, code)` in their
--      selects, so with org_units absent those three governance pages could not
--      load ANY data (the embed errored). (`user_profiles` and `audit_user_profiles`
--      are also absent but are NOT referenced anywhere in the app, so they are
--      intentionally not recreated. `people` already exists.)
--
-- WHAT THIS DOES:
--   1. Creates public.org_units with the columns the app embeds (name, code).
--   2. Enables permissive RLS (anon + authenticated) so the app can read it
--      whether logged in or not.
--   3. Adds the org_unit_id -> org_units(id) foreign keys the PostgREST embeds
--      rely on, on the three governance parent tables (all currently EMPTY, so
--      adding the FKs is safe).
--   4. Reloads the PostgREST schema cache.
--
-- Row data (org_units, people, and all governance sample data) is loaded
-- separately by scripts/seed-governance.ts, which runs against THIS project.
--
-- Idempotent & safe to run more than once.
-- =============================================================================

-- 1) org_units ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.org_units (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code       varchar(50)  NOT NULL UNIQUE,
    name       varchar(200) NOT NULL,
    unit_type  varchar(50)  DEFAULT 'Division',
    parent_id  uuid REFERENCES public.org_units(id) ON DELETE SET NULL,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) RLS ---------------------------------------------------------------------
ALTER TABLE public.org_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS org_units_all ON public.org_units;
CREATE POLICY org_units_all ON public.org_units
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3) org_unit_id -> org_units(id) foreign keys (needed for the embeds) --------
--    Guarded so this is safe/idempotent and only runs when the column exists
--    and the FK does not already exist. Tables are empty, so no row can violate.
DO $$
DECLARE
    t text;
    tbls text[] := ARRAY['audit_strategic_kras', 'audit_psap_assessments', 'audit_risk_profiles'];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = t AND column_name = 'org_unit_id'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public' AND table_name = t
              AND constraint_name = t || '_org_unit_id_fkey'
        ) THEN
            EXECUTE format(
                'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (org_unit_id) REFERENCES public.org_units(id) ON DELETE SET NULL',
                t, t || '_org_unit_id_fkey'
            );
        END IF;
    END LOOP;
END $$;

-- 4) Reload the PostgREST schema cache ---------------------------------------
NOTIFY pgrst, 'reload schema';

-- >>> migrations/013_governance_rls_policies.sql
-- =============================================================================
-- Migration 013: RLS policies for the governance tables
--
-- WHY: After seeding, a comparison of anon-key vs service-role reads showed all
-- nine governance tables hold data but return 0 rows to the app's API role:
--
--   table                                   anon   service
--   audit_strategic_kras                      0       2     <- blocked
--   audit_kra_activities                      0       6     <- blocked
--   audit_kra_activity_quarterly_status       0      30     <- blocked
--   audit_psap_standards                      0      20     <- blocked
--   audit_psap_rating_scales                  0       8     <- blocked
--   audit_psap_assessments                    0       3     <- blocked
--   audit_psap_assessment_scores              0      60     <- blocked
--   audit_risk_profiles                       0       2     <- blocked
--   audit_risk_profile_items                  0      10     <- blocked
--   (audit_risk_register = 22/22, org_units = 10/10 -> fine, for contrast)
--
-- These tables have RLS enabled but NO policy for the anon / authenticated
-- roles, so the KRA / PSAP / Risk-Profile pages render empty even though the
-- data exists. This adds the same permissive dev-model policy used elsewhere in
-- the app (audit_risk_register, org_units, audit_users, etc.).
--
-- Idempotent & safe to run more than once.
-- =============================================================================

DO $$
DECLARE
    t text;
    tbls text[] := ARRAY[
        'audit_strategic_kras',
        'audit_kra_activities',
        'audit_kra_activity_quarterly_status',
        'audit_psap_standards',
        'audit_psap_rating_scales',
        'audit_psap_assessments',
        'audit_psap_assessment_scores',
        'audit_risk_profiles',
        'audit_risk_profile_items'
    ];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        -- Only touch tables that actually exist in this project
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_all', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
                t || '_all', t
            );
        END IF;
    END LOOP;
END $$;

-- Reload the PostgREST schema cache.
NOTIFY pgrst, 'reload schema';
