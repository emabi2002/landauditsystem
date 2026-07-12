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
