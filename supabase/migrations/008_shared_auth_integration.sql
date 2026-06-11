-- =============================================
-- SHARED AUTHENTICATION INTEGRATION
-- Migration 008: Integrate with shared Supabase Auth
-- Compatible with: landauditsystem, landcasesystem, corporate system
-- =============================================
-- Idempotent: safe to run multiple times.
-- =============================================

-- =============================================
-- USER PROFILES (shared across all DLPP systems)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    -- Which systems this account may access: ["audit","cases","corporate"]
    system_access JSONB DEFAULT '["audit"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT-SPECIFIC USER PROFILE (audit system data)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    division_id UUID REFERENCES audit_divisions(id) ON DELETE SET NULL,
    section_id UUID REFERENCES audit_sections(id) ON DELETE SET NULL,

    employee_id TEXT UNIQUE,
    position TEXT,
    grade_level TEXT,
    department TEXT DEFAULT 'Internal Audit Unit',

    highest_qualification TEXT,
    qualification_field TEXT,
    university TEXT,
    graduation_year INTEGER,
    years_of_experience INTEGER DEFAULT 0,

    certifications JSONB DEFAULT '[]'::jsonb,
    specializations JSONB DEFAULT '[]'::jsonb,
    training_records JSONB DEFAULT '[]'::jsonb,

    max_concurrent_engagements INTEGER DEFAULT 2,
    current_workload INTEGER DEFAULT 0,
    availability_status TEXT DEFAULT 'Available',

    total_audits_completed INTEGER DEFAULT 0,
    total_findings_identified INTEGER DEFAULT 0,

    date_joined DATE,
    skills_summary TEXT,
    notes TEXT,
    profile_status TEXT DEFAULT 'Active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_system_access ON public.user_profiles USING gin(system_access);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_user ON public.audit_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_division ON public.audit_user_profiles(division_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_profiles_status ON public.audit_user_profiles(profile_status);

-- =============================================
-- POINT user_groups AT auth.users
-- =============================================
ALTER TABLE public.user_groups DROP CONSTRAINT IF EXISTS user_groups_user_id_fkey;
ALTER TABLE public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- MIGRATE EXISTING audit_users (only those that exist in auth.users)
-- =============================================
INSERT INTO public.user_profiles (id, full_name, phone, system_access, is_active, created_at)
SELECT id, full_name, phone, '["audit"]'::jsonb, COALESCE(is_active, true), COALESCE(created_at, NOW())
FROM public.audit_users
WHERE id IN (SELECT id FROM auth.users)
ON CONFLICT (id) DO UPDATE
   SET full_name = EXCLUDED.full_name,
       phone     = EXCLUDED.phone,
       is_active = EXCLUDED.is_active;

INSERT INTO public.audit_user_profiles (user_id, division_id, position, date_joined)
SELECT id, division_id, 'Staff Member', COALESCE(created_at::date, CURRENT_DATE)
FROM public.audit_users
WHERE id IN (SELECT id FROM auth.users)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_user_profiles ENABLE ROW LEVEL SECURITY;

-- user_profiles: anyone authenticated can read; users update own; admins all.
-- (Anon read kept for current dev mode — tighten for production.)
DROP POLICY IF EXISTS user_profiles_anon_read ON public.user_profiles;
CREATE POLICY user_profiles_anon_read ON public.user_profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS user_profiles_auth_read ON public.user_profiles;
CREATE POLICY user_profiles_auth_read ON public.user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_admin_all ON public.user_profiles;
CREATE POLICY user_profiles_admin_all ON public.user_profiles
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_groups ug
        JOIN public.groups g ON ug.group_id = g.id
        WHERE ug.user_id = auth.uid() AND g.group_name = 'Super Admin'
    ));

-- Allow inserts (needed by the new-user trigger + admin user creation in dev)
DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles;
CREATE POLICY user_profiles_insert ON public.user_profiles
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- audit_user_profiles
DROP POLICY IF EXISTS audit_user_profiles_anon_read ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_anon_read ON public.audit_user_profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_user_profiles_auth_read ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_auth_read ON public.audit_user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS audit_user_profiles_update_own ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_update_own ON public.audit_user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS audit_user_profiles_write ON public.audit_user_profiles;
CREATE POLICY audit_user_profiles_write ON public.audit_user_profiles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================
-- Auto-create a user_profile when a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, system_access, is_active)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        '["audit"]'::jsonb,
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_user_profiles_updated_at ON public.audit_user_profiles;
CREATE TRIGGER trg_audit_user_profiles_updated_at
    BEFORE UPDATE ON public.audit_user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- HELPER: check system access
-- =============================================
CREATE OR REPLACE FUNCTION public.user_has_system_access(p_user_id UUID, p_system TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_user_id AND is_active = true AND system_access ? p_system
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- BACKFILL profiles for ALL existing auth users (so nobody is locked out)
-- =============================================
INSERT INTO public.user_profiles (id, full_name, system_access, is_active)
SELECT u.id, u.raw_user_meta_data->>'full_name', '["audit","cases","corporate"]'::jsonb, true
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Shared auth integration complete.' AS status;
SELECT 'user_profiles' AS table_name, COUNT(*) AS rows FROM public.user_profiles
UNION ALL
SELECT 'audit_user_profiles', COUNT(*) FROM public.audit_user_profiles;
