-- =============================================================================
-- Migration 017: RLS for the Risk Register + Risk Events + structure tables
--
-- WHY: An authenticated-vs-service read comparison showed a whole family of
-- tables have anon policies (from the early migrations 004/005) but NO policy
-- for the `authenticated` role, so after LOGIN they return 0 rows and writes
-- fail with "new row violates row-level security policy":
--
--   table                          service  authenticated
--   audit_divisions                   10          0   <- blocked
--   audit_legal_instruments           13          0   <- blocked
--   audit_risk_register               22          0   <- blocked (+ insert RLS error)
--   audit_risk_legal_references       25          0   <- blocked
--   audit_risk_audit_log              22          0   <- blocked
--   audit_categories                   7          0   <- blocked
--   audit_risk_events                 17          0   <- blocked
--   audit_risk_event_risks            23          0   <- blocked
--   audit_risk_event_log              29          0   <- blocked
--   (engagements/findings/recommendations + governance tables already work)
--
-- Effect on the app after login: the Risk Register page is empty and "Add Risk"
-- fails; the Risk Events page is empty; the Create Risk dialog's Division and
-- Legal Instrument dropdowns are empty (so a risk can't be created).
--
-- This grants the same permissive dev-model policy used elsewhere (013/016) to
-- the whole risk/register/events/structure family, including the currently-empty
-- sibling tables so their writes (treatments, incidents, tasks, milestones...)
-- also work for authenticated users.
--
-- Idempotent & safe to run more than once.
-- =============================================================================

DO $$
DECLARE
    t text;
    tbls text[] := ARRAY[
        -- core org structure
        'audit_divisions',
        'audit_sections',
        'audit_business_processes',
        'audit_legal_instruments',
        -- risk register spine
        'audit_risk_register',
        'audit_risk_legal_references',
        'audit_risk_treatments',
        'audit_risk_incidents',
        'audit_risk_audit_log',
        'audit_risk_indicators',
        'audit_risk_indicator_values',
        -- risk events (the gateway)
        'audit_categories',
        'audit_risk_events',
        'audit_risk_event_risks',
        'audit_risk_event_milestones',
        'audit_risk_event_documents',
        'audit_risk_event_log',
        -- workflow tasks (empty but same anon-only origin)
        'audit_tasks'
    ];
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

-- Reload the PostgREST schema cache so the policies take effect immediately.
NOTIFY pgrst, 'reload schema';
