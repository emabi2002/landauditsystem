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
