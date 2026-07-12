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
