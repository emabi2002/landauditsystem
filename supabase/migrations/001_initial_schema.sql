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
