import { supabase } from './supabase'

/**
 * Auth helpers for the DLPP Audit & Compliance System.
 *
 * The Supabase project is SHARED across DLPP systems (audit / landcase /
 * corporate). User identity lives in `profiles`, cross-system access in
 * `user_system_access`, and RBAC group membership in `user_groups` -> `groups`.
 *
 * Access policy for the Audit System:
 *   A user may access the audit system if they are an administrator
 *   (profiles.role === 'admin', or they hold the 'admin' system, or they belong
 *   to an "*admin*" group) OR they have been explicitly granted the 'audit'
 *   system in `user_system_access`.
 */
export interface AuditProfile {
  id: string
  email: string
  full_name: string | null
  role: string | null
  is_active: boolean
  primaryGroup: string | null
  groups: string[]
  systemAccess: string[]
  isAdmin: boolean
  hasAuditAccess: boolean
}

function computeIsAdmin(role: string | null, systemAccess: string[], groups: string[]): boolean {
  if (role === 'admin') return true
  if (systemAccess.includes('admin')) return true
  if (groups.some((g) => /admin/i.test(g))) return true
  return false
}

/**
 * Load the full audit profile for the currently authenticated user.
 * Returns null when there is no active session.
 */
export async function loadAuditProfile(): Promise<AuditProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: access }, { data: ug }] = await Promise.all([
    (supabase as any)
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', user.id)
      .maybeSingle(),
    (supabase as any).from('user_system_access').select('system').eq('user_id', user.id),
    (supabase as any).from('user_groups').select('groups(group_name)').eq('user_id', user.id),
  ])

  const systemAccess: string[] = (access || [])
    .map((a: any) => a.system)
    .filter(Boolean)
  const groups: string[] = (ug || [])
    .map((g: any) => g.groups?.group_name)
    .filter(Boolean)

  const role: string | null = profile?.role ?? null
  const isAdmin = computeIsAdmin(role, systemAccess, groups)
  const hasAuditAccess = isAdmin || systemAccess.includes('audit')

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    full_name: profile?.full_name ?? null,
    role,
    is_active: profile?.is_active ?? true,
    primaryGroup: groups[0] ?? null,
    groups,
    systemAccess,
    isAdmin,
    hasAuditAccess,
  }
}

export interface AuditMenu {
  isAdmin: boolean
  hasAuditAccess: boolean
  /**
   * Routes the user is allowed to see in the Audit menu, derived from their
   * groups' `can_read` permissions on `system='audit'` modules.
   *
   * `null` means "do not restrict" — used for administrators, when there is no
   * session, or when no Audit permissions have been configured yet (so a user
   * is never accidentally locked out of the whole menu during rollout).
   */
  allowedRoutes: string[] | null
}

/**
 * Compute the Audit menu the current user should see. The sidebar renders its
 * built-in items filtered by `allowedRoutes` (when not null), so each group/role
 * gets its own tailored menu.
 */
export async function loadAuditMenu(): Promise<AuditMenu> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false, hasAuditAccess: false, allowedRoutes: null }

  const [{ data: profile }, { data: access }, { data: ug }] = await Promise.all([
    (supabase as any).from('profiles').select('role').eq('id', user.id).maybeSingle(),
    (supabase as any).from('user_system_access').select('system').eq('user_id', user.id),
    (supabase as any).from('user_groups').select('group_id, groups(group_name)').eq('user_id', user.id),
  ])

  const systemAccess: string[] = (access || []).map((a: any) => a.system).filter(Boolean)
  const groupNames: string[] = (ug || []).map((g: any) => g.groups?.group_name).filter(Boolean)
  const groupIds: string[] = (ug || []).map((g: any) => g.group_id).filter(Boolean)

  const isAdmin = computeIsAdmin(profile?.role ?? null, systemAccess, groupNames)
  const hasAuditAccess = isAdmin || systemAccess.includes('audit')

  // Admins (and users with no groups yet) see the full menu.
  if (isAdmin || groupIds.length === 0) {
    return { isAdmin, hasAuditAccess, allowedRoutes: null }
  }

  const { data: perms, error } = await (supabase as any)
    .from('group_module_permissions')
    .select('can_read, modules(route, system)')
    .in('group_id', groupIds)
    .eq('can_read', true)

  // On error, don't restrict (fail open so navigation always works).
  if (error) return { isAdmin, hasAuditAccess, allowedRoutes: null }

  const routes: string[] = (perms || [])
    .filter((p: any) => p.modules && p.modules.system === 'audit' && p.modules.route)
    .map((p: any) => p.modules.route as string)

  // Nothing configured for Audit yet -> don't lock the user out.
  if (routes.length === 0) return { isAdmin, hasAuditAccess, allowedRoutes: null }

  return { isAdmin, hasAuditAccess, allowedRoutes: Array.from(new Set(routes)) }
}

/** True when there is an active Supabase session. */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}

/** Sign the current user out. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
