-- =============================================================================
-- Migration 015: Shared multi-application RBAC scoping
-- Target Supabase project: yvnkyjnwvylrweyzvibs  (SHARED across DLPP apps)
--
-- Context (verified live via the REST/OpenAPI introspection):
--   The database is SHARED by several DLPP applications. The RBAC layer is
--   already multi-tenant:
--     * modules.system            -> which app a menu item belongs to
--                                    (values seen: 'admin','corporate','landcase')
--     * user_system_access.system -> which app(s) a user may enter
--     * groups / group_module_permissions / user_groups -> the shared RBAC
--   BUT:
--     * `groups` has NO way to say which app a group belongs to.
--     * There are NO modules with system='audit' yet (the Audit menu was never
--       seeded into the shared `modules` table).
--
-- This migration is additive, idempotent and safe for the shared DB:
--   1. Add `groups.system` and backfill it CONSERVATIVELY by name
--      (audit / corporate / landcase). Ambiguous names (Super Admin, Manager,
--      Viewer, ...) are LEFT NULL rather than mis-tagged.
--   2. Seed the Audit application's menu into `modules` (system='audit') using
--      audit_-prefixed keys so they never collide with other apps' module_keys.
--   3. Ensure the app's RBAC tables are readable/writable by anon+authenticated
--      (matches the existing permissive model; other apps are unaffected).
--
-- It does NOT touch, retag or delete any other application's rows.
-- =============================================================================

-- 1) groups.system --------------------------------------------------------------
ALTER TABLE public.groups
    ADD COLUMN IF NOT EXISTS system text;

-- Conservative, order-sensitive backfill. Only fills rows that are still NULL,
-- so it never overwrites a value an admin set from the UI, and re-running is a
-- no-op. Corporate is matched first so "Corporate ..." never falls through to
-- the broader audit rule.
UPDATE public.groups
   SET system = 'corporate'
 WHERE system IS NULL
   AND group_name ILIKE '%corporate%';

UPDATE public.groups
   SET system = 'landcase'
 WHERE system IS NULL
   AND (
        group_name ILIKE '%litigation%'
     OR group_name ILIKE '%land case%'
     OR group_name ILIKE '%land cases%'
     OR group_name IN ('Document Clerk', 'Legal Clerk')
   );

UPDATE public.groups
   SET system = 'audit'
 WHERE system IS NULL
   AND (
        group_name ILIKE '%audit%'
     OR group_name IN ('Senior Auditor', 'Audit Manager', 'Risk Officer', 'Action Owner')
   );

CREATE INDEX IF NOT EXISTS idx_groups_system ON public.groups(system);

-- 2) Seed the Audit menu into the shared `modules` table ------------------------
--    audit_-prefixed keys guarantee no collision with existing module_keys
--    (landcase/corporate/admin). WHERE NOT EXISTS keeps this idempotent even if
--    the `modules` table has no unique constraint on module_key.
INSERT INTO public.modules
    (module_name, module_key, system, category, icon, route, display_order, is_active)
SELECT v.module_name, v.module_key, 'audit', v.category, v.icon, v.route, v.display_order, true
FROM (VALUES
    -- Core
    ('Dashboard',            'audit_dashboard',        'core',           'LayoutDashboard', '/dashboard',        10),
    ('Risk Register',        'audit_risk_register',    'core',           'Shield',          '/risk-register',    20),
    ('Risk Events',          'audit_risk_events',      'core',           'Zap',             '/risk-events',      30),
    -- Audit Workflow
    ('Engagements',          'audit_engagements',      'audit_workflow', 'Briefcase',       '/engagements',      40),
    ('Fieldwork',            'audit_fieldwork',        'audit_workflow', 'FolderOpen',      '/fieldwork',        50),
    ('Findings',             'audit_findings',         'audit_workflow', 'AlertTriangle',   '/findings',         60),
    ('Recommendations',      'audit_recommendations',  'audit_workflow', 'CheckCircle',     '/recommendations',  70),
    ('Action Plans',         'audit_action_plans',     'audit_workflow', 'ClipboardList',   '/action-plans',     80),
    -- Risk & Governance
    ('Risk Profiles',        'audit_risk_profiles',    'risk_governance','Activity',        '/risk-profiles',    90),
    ('PSAP Scorecard',       'audit_psap_scorecard',   'risk_governance','TrendingUp',      '/psap-scorecard',  100),
    ('KRA & Workplan',       'audit_kra_workplan',     'risk_governance','Target',          '/kra-workplan',    110),
    -- Management
    ('Compliance',           'audit_compliance',       'management',     'FileText',        '/compliance',      120),
    ('Reports',              'audit_reports',          'management',     'BarChart3',       '/reports',         130),
    -- Administration
    ('Admin Hub',            'audit_admin',            'administration', 'Settings',        '/admin',           140),
    ('User Management',      'audit_users',            'administration', 'Users',           '/admin/users',     150),
    ('Auditor Profiles',     'audit_auditors',         'administration', 'UserCircle',      '/admin/auditors',  160),
    ('Group Management',     'audit_groups',           'administration', 'Shield',          '/admin/groups',    170),
    ('Module Management',    'audit_modules',          'administration', 'Package',         '/admin/modules',   180),
    ('Division Management',  'audit_divisions',        'administration', 'Building2',       '/admin/divisions', 190)
) AS v(module_name, module_key, category, icon, route, display_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.modules m WHERE m.module_key = v.module_key
);

-- 3) RLS: make sure the Audit app (anon + authenticated) can read/write its
--    RBAC tables. Idempotent; additive; other apps keep their own policies.
ALTER TABLE public.groups                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_module_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups               ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['groups', 'modules', 'group_module_permissions', 'user_groups']
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_rbac_all ON public.%I', t, t);
        EXECUTE format(
            'CREATE POLICY %I_rbac_all ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
            t, t
        );
    END LOOP;
END $$;

-- 4) Reload PostgREST schema cache so the new column + modules are queryable.
NOTIFY pgrst, 'reload schema';
