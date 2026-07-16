-- =============================================================================
-- Migration 016: RLS for the `people` lookup table (authenticated role)
--
-- WHY: An anon-vs-authenticated-vs-service comparison of `public.people` showed:
--
--   role            people rows
--   service_role         3        (source of truth)
--   anon                 3        (has a policy)
--   authenticated        0    <-- BLOCKED (no policy for this role)
--
-- The app runs as the `authenticated` role AFTER login. With no authenticated
-- policy on `people`, once a user logs in:
--   * PSAP "Completed By" / "Reviewed By" dropdowns are EMPTY, so an assessment
--     can't be attributed (completed_by is required) and the assessment table
--     shows "N/A" for the officer.
--   * Admin -> Officers page is empty and its create/edit/delete all fail.
--
-- `org_units` already got its authenticated policy (migrations 012/013); `people`
-- was missed. This applies the same permissive dev-model policy used across the
-- app (audit_risk_register, org_units, the 9 governance tables, audit_users...).
--
-- Policies are OR-combined, so adding a permissive FOR ALL policy for
-- anon + authenticated grants access without disturbing any existing policy.
--
-- Idempotent & safe to run more than once.
-- =============================================================================

DO $$
DECLARE
    t text;
    -- `people` is the actual fix; `org_units` is re-asserted defensively so both
    -- shared lookup tables behave identically for the authenticated role.
    tbls text[] := ARRAY['people', 'org_units'];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
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

-- Reload the PostgREST schema cache so the new policy takes effect immediately.
NOTIFY pgrst, 'reload schema';
