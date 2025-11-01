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
