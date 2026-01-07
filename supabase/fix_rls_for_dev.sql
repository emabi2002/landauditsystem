-- =============================================
-- FIX RLS FOR DEVELOPMENT
-- Run this ENTIRE script in Supabase SQL Editor
-- to allow anonymous read access for all audit data
-- =============================================

-- =============================================
-- STEP 1: Check if data exists
-- =============================================
SELECT 'audit_risk_register' AS table_name, COUNT(*) AS row_count FROM audit_risk_register
UNION ALL SELECT 'audit_divisions', COUNT(*) FROM audit_divisions
UNION ALL SELECT 'audit_legal_instruments', COUNT(*) FROM audit_legal_instruments
UNION ALL SELECT 'audit_categories', COUNT(*) FROM audit_categories
UNION ALL SELECT 'audit_risk_events', COUNT(*) FROM audit_risk_events;

-- =============================================
-- STEP 2: Add anonymous read policies
-- These allow the UI to read data without authentication
-- =============================================

-- Risk Register (core)
DROP POLICY IF EXISTS audit_risk_register_anon_read ON audit_risk_register;
CREATE POLICY audit_risk_register_anon_read ON audit_risk_register
  FOR SELECT TO anon USING (true);

-- Divisions
DROP POLICY IF EXISTS audit_divisions_anon_read ON audit_divisions;
CREATE POLICY audit_divisions_anon_read ON audit_divisions
  FOR SELECT TO anon USING (true);

-- Sections
DROP POLICY IF EXISTS audit_sections_anon_read ON audit_sections;
CREATE POLICY audit_sections_anon_read ON audit_sections
  FOR SELECT TO anon USING (true);

-- Legal Instruments
DROP POLICY IF EXISTS audit_legal_instruments_anon_read ON audit_legal_instruments;
CREATE POLICY audit_legal_instruments_anon_read ON audit_legal_instruments
  FOR SELECT TO anon USING (true);

-- Risk Legal References
DROP POLICY IF EXISTS audit_risk_legal_references_anon_read ON audit_risk_legal_references;
CREATE POLICY audit_risk_legal_references_anon_read ON audit_risk_legal_references
  FOR SELECT TO anon USING (true);

-- Risk Treatments
DROP POLICY IF EXISTS audit_risk_treatments_anon_read ON audit_risk_treatments;
CREATE POLICY audit_risk_treatments_anon_read ON audit_risk_treatments
  FOR SELECT TO anon USING (true);

-- Risk Incidents
DROP POLICY IF EXISTS audit_risk_incidents_anon_read ON audit_risk_incidents;
CREATE POLICY audit_risk_incidents_anon_read ON audit_risk_incidents
  FOR SELECT TO anon USING (true);

-- =============================================
-- RISK EVENTS MODULE
-- =============================================

-- Audit Categories
DROP POLICY IF EXISTS audit_categories_anon_read ON audit_categories;
CREATE POLICY audit_categories_anon_read ON audit_categories
  FOR SELECT TO anon USING (true);

-- Risk Events (central repository)
DROP POLICY IF EXISTS audit_risk_events_anon_read ON audit_risk_events;
CREATE POLICY audit_risk_events_anon_read ON audit_risk_events
  FOR SELECT TO anon USING (true);

-- Risk Event Risks (junction table)
DROP POLICY IF EXISTS audit_risk_event_risks_anon_read ON audit_risk_event_risks;
CREATE POLICY audit_risk_event_risks_anon_read ON audit_risk_event_risks
  FOR SELECT TO anon USING (true);

-- Risk Event Documents
DROP POLICY IF EXISTS audit_risk_event_documents_anon_read ON audit_risk_event_documents;
CREATE POLICY audit_risk_event_documents_anon_read ON audit_risk_event_documents
  FOR SELECT TO anon USING (true);

-- Risk Event Milestones
DROP POLICY IF EXISTS audit_risk_event_milestones_anon_read ON audit_risk_event_milestones;
CREATE POLICY audit_risk_event_milestones_anon_read ON audit_risk_event_milestones
  FOR SELECT TO anon USING (true);

-- Risk Event Log
DROP POLICY IF EXISTS audit_risk_event_log_anon_read ON audit_risk_event_log;
CREATE POLICY audit_risk_event_log_anon_read ON audit_risk_event_log
  FOR SELECT TO anon USING (true);

-- Information Requests
DROP POLICY IF EXISTS audit_information_requests_anon_read ON audit_information_requests;
CREATE POLICY audit_information_requests_anon_read ON audit_information_requests
  FOR SELECT TO anon USING (true);

-- Tasks
DROP POLICY IF EXISTS audit_tasks_anon_read ON audit_tasks;
CREATE POLICY audit_tasks_anon_read ON audit_tasks
  FOR SELECT TO anon USING (true);

-- =============================================
-- AUDIT WORKFLOW TABLES
-- =============================================

-- Engagements
DROP POLICY IF EXISTS audit_engagements_anon_read ON audit_engagements;
CREATE POLICY audit_engagements_anon_read ON audit_engagements
  FOR SELECT TO anon USING (true);

-- Findings
DROP POLICY IF EXISTS audit_findings_anon_read ON audit_findings;
CREATE POLICY audit_findings_anon_read ON audit_findings
  FOR SELECT TO anon USING (true);

-- Recommendations
DROP POLICY IF EXISTS audit_recommendations_anon_read ON audit_recommendations;
CREATE POLICY audit_recommendations_anon_read ON audit_recommendations
  FOR SELECT TO anon USING (true);

-- =============================================
-- ANONYMOUS WRITE POLICIES (for development)
-- These allow creating/updating data without auth
-- =============================================

-- Risk Events - allow anonymous insert/update for dev
DROP POLICY IF EXISTS audit_risk_events_anon_insert ON audit_risk_events;
CREATE POLICY audit_risk_events_anon_insert ON audit_risk_events
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS audit_risk_events_anon_update ON audit_risk_events;
CREATE POLICY audit_risk_events_anon_update ON audit_risk_events
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Risk Event Risks - allow anonymous insert for dev
DROP POLICY IF EXISTS audit_risk_event_risks_anon_insert ON audit_risk_event_risks;
CREATE POLICY audit_risk_event_risks_anon_insert ON audit_risk_event_risks
  FOR INSERT TO anon WITH CHECK (true);

-- Risk Event Log - allow anonymous insert for dev
DROP POLICY IF EXISTS audit_risk_event_log_anon_insert ON audit_risk_event_log;
CREATE POLICY audit_risk_event_log_anon_insert ON audit_risk_event_log
  FOR INSERT TO anon WITH CHECK (true);

-- Engagements - allow anonymous insert/update for dev
DROP POLICY IF EXISTS audit_engagements_anon_insert ON audit_engagements;
CREATE POLICY audit_engagements_anon_insert ON audit_engagements
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS audit_engagements_anon_update ON audit_engagements;
CREATE POLICY audit_engagements_anon_update ON audit_engagements
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Tasks - allow anonymous CRUD for dev
DROP POLICY IF EXISTS audit_tasks_anon_insert ON audit_tasks;
CREATE POLICY audit_tasks_anon_insert ON audit_tasks
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS audit_tasks_anon_update ON audit_tasks;
CREATE POLICY audit_tasks_anon_update ON audit_tasks
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'RLS policies created successfully!' AS status;

-- Show sample risk data
SELECT risk_code, risk_title, risk_category, residual_risk_rating
FROM audit_risk_register
ORDER BY risk_code
LIMIT 5;

-- Show divisions
SELECT code, name FROM audit_divisions ORDER BY code LIMIT 5;

-- Show audit categories
SELECT code, name FROM audit_categories ORDER BY code;
