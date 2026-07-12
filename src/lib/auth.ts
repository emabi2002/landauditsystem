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
