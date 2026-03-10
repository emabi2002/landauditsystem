-- =============================================
-- RBAC (Role-Based Access Control) System
-- Migration 006: Create RBAC tables for landauditsystem
-- =============================================

-- =============================================
-- GROUPS TABLE
-- User groups/roles with descriptions
-- =============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULES TABLE
-- System modules/features that can have permissions
-- =============================================
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

-- =============================================
-- GROUP MODULE PERMISSIONS TABLE
-- Permission matrix: which groups can do what on which modules
-- =============================================
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

-- =============================================
-- USER GROUPS TABLE
-- Junction table: which users belong to which groups
-- =============================================
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id, group_id)
);

-- =============================================
-- AUDIT USERS TABLE (optional, for extended user info)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    phone VARCHAR(50),
    division_id UUID REFERENCES audit_divisions(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT LOG TABLE
-- Track user actions for compliance
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    module_id UUID REFERENCES modules(id),
    action VARCHAR(20) NOT NULL, -- create, read, update, delete, print, export, approve
    record_id UUID,
    record_type VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_group_permissions_group ON group_module_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_module ON group_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON audit_log(module_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_logged_at ON audit_log(logged_at);

-- =============================================
-- RLS POLICIES (Anonymous read for development)
-- =============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Anonymous read policies for development
DROP POLICY IF EXISTS groups_anon_read ON groups;
CREATE POLICY groups_anon_read ON groups FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS modules_anon_read ON modules;
CREATE POLICY modules_anon_read ON modules FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS group_permissions_anon_read ON group_module_permissions;
CREATE POLICY group_permissions_anon_read ON group_module_permissions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS user_groups_anon_read ON user_groups;
CREATE POLICY user_groups_anon_read ON user_groups FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_users_anon_read ON audit_users;
CREATE POLICY audit_users_anon_read ON audit_users FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_log_anon_read ON audit_log;
CREATE POLICY audit_log_anon_read ON audit_log FOR SELECT TO anon USING (true);

-- Anonymous write policies for development
DROP POLICY IF EXISTS groups_anon_insert ON groups;
CREATE POLICY groups_anon_insert ON groups FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS groups_anon_update ON groups;
CREATE POLICY groups_anon_update ON groups FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS groups_anon_delete ON groups;
CREATE POLICY groups_anon_delete ON groups FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS modules_anon_insert ON modules;
CREATE POLICY modules_anon_insert ON modules FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS modules_anon_update ON modules;
CREATE POLICY modules_anon_update ON modules FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS modules_anon_delete ON modules;
CREATE POLICY modules_anon_delete ON modules FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS group_permissions_anon_insert ON group_module_permissions;
CREATE POLICY group_permissions_anon_insert ON group_module_permissions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS group_permissions_anon_update ON group_module_permissions;
CREATE POLICY group_permissions_anon_update ON group_module_permissions FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS group_permissions_anon_delete ON group_module_permissions;
CREATE POLICY group_permissions_anon_delete ON group_module_permissions FOR DELETE TO anon USING (true);

-- =============================================
-- SEED DEFAULT MODULES
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
SELECT 'RBAC tables created successfully!' AS status;

SELECT 'Modules seeded:' AS info, COUNT(*) AS count FROM modules;
