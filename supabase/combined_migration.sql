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


-- ========================================
-- MIGRATION 002: RLS Policies
-- ========================================
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


-- ========================================
-- MIGRATION 003: Risk & Governance Modules
-- ========================================
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
DO $$
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
