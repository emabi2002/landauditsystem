// RBAC (Role-Based Access Control) Type Definitions for DLPP Audit System

export interface Group {
  id: string;
  group_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  module_name: string;
  module_key: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  route: string | null;
  created_at: string;
}

export interface GroupModulePermission {
  id: string;
  group_id: string;
  module_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_export: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: string;
  user_id: string;
  group_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface AuditUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  division_id: string | null;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  module_id: string | null;
  action: 'create' | 'read' | 'update' | 'delete' | 'print' | 'export' | 'approve';
  record_id: string | null;
  record_type: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  logged_at: string;
}

// Combined types for UI
export interface GroupWithPermissions extends Group {
  permissions: GroupModulePermission[];
}

export interface UserWithGroups extends AuditUser {
  groups: Group[];
}

export interface ModulePermission {
  module_key: string;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_export: boolean;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'print' | 'approve' | 'export';

// Helper type for permission matrix UI
export interface PermissionMatrixRow {
  module_id: string;
  module_name: string;
  module_key: string;
  permissions: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_print: boolean;
    can_approve: boolean;
    can_export: boolean;
  };
}

// Module categories for the audit system
export const MODULE_CATEGORIES = [
  { value: 'core', label: 'Core Modules', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'audit_workflow', label: 'Audit Workflow', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'risk_governance', label: 'Risk & Governance', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'management', label: 'Management', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'administration', label: 'Administration', color: 'bg-slate-100 text-slate-700 border-slate-300' },
] as const;

// Default group templates for quick setup
export const DEFAULT_GROUP_TEMPLATES = [
  {
    group_name: 'Super Admin',
    description: 'Full system access including user management, configuration, and all modules. For system administrators.',
    permissionLevel: 'full'
  },
  {
    group_name: 'Audit Manager',
    description: 'Department heads and audit supervisors. Can manage risk events, engagements, approve findings, and generate reports.',
    permissionLevel: 'manager'
  },
  {
    group_name: 'Senior Auditor',
    description: 'Lead auditors who can create and manage engagements, findings, and recommendations.',
    permissionLevel: 'senior_auditor'
  },
  {
    group_name: 'Auditor',
    description: 'Standard auditors who conduct fieldwork, document findings, and track action plans.',
    permissionLevel: 'auditor'
  },
  {
    group_name: 'Risk Officer',
    description: 'Risk management specialists who manage the Risk Register and Risk Events.',
    permissionLevel: 'risk_officer'
  },
  {
    group_name: 'Action Owner',
    description: 'Division staff responsible for implementing recommendations and action plans.',
    permissionLevel: 'action_owner'
  },
  {
    group_name: 'Viewer',
    description: 'Read-only access for external auditors, observers, or management. Can view reports but cannot modify data.',
    permissionLevel: 'viewer'
  }
] as const;
