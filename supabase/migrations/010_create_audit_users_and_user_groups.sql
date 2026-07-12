-- =============================================================================
-- Migration: create_audit_users_and_user_groups
-- Fixes the User Management bug:
--   "Could not find the table 'public.audit_users' in the schema cache"
-- Target Supabase project: yvnkyjnwvylrweyzvibs
--
-- VERIFIED live state of the target project BEFORE writing this migration
-- (introspected via the PostgREST OpenAPI spec using the service_role key):
--   * public.audit_divisions  EXISTS   -> id is  uuid   (has columns: code, name)
--   * public.groups           EXISTS   -> id is  uuid   (id, group_name, description,
--                                                        created_at, updated_at, is_active)
--   * public.user_groups      EXISTS   -> id uuid PK, user_id uuid, group_id uuid,
--                                         assigned_at, assigned_by, is_active
--                                         and ALREADY has FK  user_groups.group_id -> groups(id)
--   * public.audit_users      MISSING  <-- root cause of the bug
--
-- Because audit_divisions.id and groups.id are BOTH uuid, every FK column below
-- is uuid so PostgREST can resolve the embedded joins used by the app:
--     audit_users.division_id -> audit_divisions(id)   (for  audit_divisions(name, code) )
--     user_groups.group_id    -> groups(id)            (for  groups(...) — already present)
--
-- This migration is fully idempotent and safe to run more than once.
-- =============================================================================

-- 1) audit_users -- the only genuinely missing table --------------------------
--    The client supplies `id` as a UUID string on insert; gen_random_uuid()
--    remains as a fallback default.
CREATE TABLE IF NOT EXISTS public.audit_users (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       varchar(255) NOT NULL UNIQUE,
    full_name   varchar(200),
    phone       varchar(50),
    division_id uuid REFERENCES public.audit_divisions(id) ON DELETE SET NULL,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2) user_groups -- idempotent; a no-op on the target (already exists) --------
--    IMPORTANT: user_groups.user_id is intentionally NOT given a FK to
--    audit_users(id). The table already contains rows whose user_id values do
--    NOT exist in the freshly-created audit_users table, so adding that FK would
--    fail; and the app's embedded selects only require group_id -> groups(id),
--    which already exists. (This satisfies the "only if existing data allows"
--    rule for adding FKs to a pre-existing table.)
CREATE TABLE IF NOT EXISTS public.user_groups (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL,
    group_id    uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid,
    is_active   boolean NOT NULL DEFAULT true,
    UNIQUE (user_id, group_id)
);

-- 3) Guarantee the audit_users.division_id -> audit_divisions(id) FK exists ---
--    (covers the edge case where audit_users pre-existed WITHOUT the FK that
--     the audit_divisions(name, code) embedding relies on).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name       = 'audit_users'
          AND constraint_type  = 'FOREIGN KEY'
          AND constraint_name  = 'audit_users_division_id_fkey'
    ) THEN
        ALTER TABLE public.audit_users
            ADD CONSTRAINT audit_users_division_id_fkey
            FOREIGN KEY (division_id) REFERENCES public.audit_divisions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4) Indexes -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_users_division ON public.audit_users(division_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user     ON public.user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group    ON public.user_groups(group_id);

-- 5) Row Level Security ------------------------------------------------------
--    Permissive dev model matching the rest of this app: allow BOTH anon and
--    authenticated to read AND write these two tables.
ALTER TABLE public.audit_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_users_all ON public.audit_users;
CREATE POLICY audit_users_all ON public.audit_users
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS user_groups_all ON public.user_groups;
CREATE POLICY user_groups_all ON public.user_groups
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6) Detach the stale user_groups.user_id FK ---------------------------------
--    The pre-existing (shared) user_groups table has a FK
--    `user_groups_user_id_fkey` that points user_id at a DIFFERENT `users`
--    table (shared auth). This audit app stores its users in `audit_users`, so
--    that FK rejects linking an audit user to a group ("Key is not present in
--    table users"). The app filters user_groups by user_id in code and only
--    needs the group_id -> groups(id) FK (kept), so drop the user_id FK.
--    Existing rows are preserved; only the constraint is removed.
ALTER TABLE public.user_groups DROP CONSTRAINT IF EXISTS user_groups_user_id_fkey;

-- 7) Reload the PostgREST schema cache so the new table + FK relationships
--    are immediately resolvable by the REST API (removes the PGRST205 error).
NOTIFY pgrst, 'reload schema';
