-- =============================================
-- FIX: "column user_id does not exist" ERROR
-- Run this ENTIRE script in Supabase SQL Editor
-- This fixes old RLS policies that reference people.user_id
-- =============================================

-- =============================================
-- STEP 1: Drop old RLS functions that reference people table
-- =============================================

-- Drop get_my_person_id function if it exists
DROP FUNCTION IF EXISTS get_my_person_id() CASCADE;

-- Drop get_my_role function if it exists
DROP FUNCTION IF EXISTS get_my_role() CASCADE;

-- Drop any functions that might reference people.user_id
DROP FUNCTION IF EXISTS auth_person_id() CASCADE;
DROP FUNCTION IF EXISTS current_person_id() CASCADE;

-- =============================================
-- STEP 2: Drop old RLS policies on people table
-- =============================================

-- Drop all policies on people table if it exists
DO $$
BEGIN
    -- Drop policies if people table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'people') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON people;
        DROP POLICY IF EXISTS "Users can update their own profile" ON people;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON people;
        DROP POLICY IF EXISTS "Admins can manage all profiles" ON people;
        DROP POLICY IF EXISTS people_anon_read ON people;
        DROP POLICY IF EXISTS people_anon_insert ON people;
        DROP POLICY IF EXISTS people_anon_update ON people;
        DROP POLICY IF EXISTS people_anon_delete ON people;
    END IF;
END $$;

-- =============================================
-- STEP 3: Create a minimal people table for compatibility
-- (Only if it doesn't exist - this prevents old code from breaking)
-- =============================================

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    org_unit_id UUID,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on people table
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
DROP POLICY IF EXISTS people_allow_all ON people;
CREATE POLICY people_allow_all ON people FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also create policy for authenticated users
DROP POLICY IF EXISTS people_auth_all ON people;
CREATE POLICY people_auth_all ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 4: Make sure RBAC tables exist and have proper RLS
-- =============================================

-- Create groups table if not exists
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create modules table if not exists
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL,
    module_key VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) DEFAULT 'core',
    icon VARCHAR(50),
    route VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_module_permissions table if not exists
CREATE TABLE IF NOT EXISTS group_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_print BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, module_id)
);

-- Create user_groups table if not exists
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id, group_id)
);

-- Create audit_users table if not exists
CREATE TABLE IF NOT EXISTS audit_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    phone VARCHAR(50),
    division_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_log table if not exists
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    module_id UUID,
    action VARCHAR(20) NOT NULL,
    record_id UUID,
    record_type VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 5: Enable RLS and create permissive policies for development
-- =============================================

-- Groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS groups_allow_all ON groups;
CREATE POLICY groups_allow_all ON groups FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS groups_auth_all ON groups;
CREATE POLICY groups_auth_all ON groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS modules_allow_all ON modules;
CREATE POLICY modules_allow_all ON modules FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS modules_auth_all ON modules;
CREATE POLICY modules_auth_all ON modules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Group Module Permissions
ALTER TABLE group_module_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS group_permissions_allow_all ON group_module_permissions;
CREATE POLICY group_permissions_allow_all ON group_module_permissions FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS group_permissions_auth_all ON group_module_permissions;
CREATE POLICY group_permissions_auth_all ON group_module_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User Groups
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_groups_allow_all ON user_groups;
CREATE POLICY user_groups_allow_all ON user_groups FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS user_groups_auth_all ON user_groups;
CREATE POLICY user_groups_auth_all ON user_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit Users
ALTER TABLE audit_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_users_allow_all ON audit_users;
CREATE POLICY audit_users_allow_all ON audit_users FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS audit_users_auth_all ON audit_users;
CREATE POLICY audit_users_auth_all ON audit_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit Log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_log_allow_all ON audit_log;
CREATE POLICY audit_log_allow_all ON audit_log FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS audit_log_auth_all ON audit_log;
CREATE POLICY audit_log_auth_all ON audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 6: Create indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_group_permissions_group ON group_module_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_module ON group_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON audit_log(module_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_logged_at ON audit_log(logged_at);

-- =============================================
-- STEP 7: Seed default modules
-- =============================================

INSERT INTO modules (module_name, module_key, category, description) VALUES
-- Core
('Dashboard', 'dashboard', 'core', 'Main dashboard with KPIs and overview'),
('Risk Register', 'risk_register', 'core', 'Authoritative risk landscape for DLPP'),
('Risk Events', 'risk_events', 'core', 'Central repository for audit triggers'),
-- Audit Workflow
('Engagements', 'engagements', 'audit_workflow', 'Audit engagement management'),
('Fieldwork', 'fieldwork', 'audit_workflow', 'Fieldwork and evidence collection'),
('Findings', 'findings', 'audit_workflow', 'Audit findings documentation'),
('Recommendations', 'recommendations', 'audit_workflow', 'Audit recommendations'),
('Action Plans', 'action_plans', 'audit_workflow', 'Action plan tracking and follow-up'),
-- Risk & Governance
('Risk Profiles', 'risk_profiles', 'risk_governance', 'Division risk profiles'),
('PSAP Scorecard', 'psap_scorecard', 'risk_governance', 'Performance assessment scorecard'),
('KRA & Workplan', 'kra_workplan', 'risk_governance', 'Key result areas and work planning'),
-- Management
('Compliance', 'compliance', 'management', 'Compliance monitoring'),
('Reports', 'reports', 'management', 'Audit reports generation'),
-- Administration
('User Management', 'users', 'administration', 'Manage system users'),
('Group Management', 'groups', 'administration', 'Manage user groups and permissions'),
('Module Management', 'modules', 'administration', 'Configure system modules'),
('Division Management', 'divisions', 'administration', 'Manage DLPP divisions')
ON CONFLICT (module_key) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT '✅ Fix applied successfully!' AS status;

SELECT 'Tables created/verified:' AS info;
SELECT tablename FROM pg_tables
WHERE tablename IN ('people', 'groups', 'modules', 'group_module_permissions', 'user_groups', 'audit_users', 'audit_log')
ORDER BY tablename;

SELECT 'Modules count:' AS info, COUNT(*) AS count FROM modules;
