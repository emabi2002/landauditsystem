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
