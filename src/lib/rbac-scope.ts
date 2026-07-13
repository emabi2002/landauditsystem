import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Group, Module, ApplicationKey } from './rbac-types'

/**
 * DLPP runs several applications on ONE shared Supabase database. Every RBAC
 * row (group / module / user access) is scoped to a "system" so each app only
 * sees and manages its own menu, groups and users.
 *
 * The DB already uses a `system` column on `modules` and `user_system_access`
 * (values: 'audit' | 'corporate' | 'landcase' | 'admin'). We mirror that here
 * and add the same `system` scope to `groups` (migration 015).
 */

export interface ApplicationDef {
  /** Canonical value stored in *.system columns. */
  key: ApplicationKey
  /** Full label, e.g. "Audit System". */
  label: string
  /** Short label for chips/badges, e.g. "Audit". */
  shortLabel: string
  description: string
  /** Tailwind badge classes. */
  badgeClass: string
  /** Accent colour classes for selectors. */
  accentClass: string
  /** lucide-react icon name. */
  icon: string
}

/** The application this deployment primarily serves. */
export const CURRENT_APPLICATION: ApplicationKey = 'audit'

export const APPLICATIONS: ApplicationDef[] = [
  {
    key: 'audit',
    label: 'Audit System',
    shortLabel: 'Audit',
    description: 'Internal Audit & Compliance',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accentClass: 'text-emerald-600',
    icon: 'ShieldCheck',
  },
  {
    key: 'corporate',
    label: 'Corporate Matters',
    shortLabel: 'Corporate',
    description: 'Corporate Services & Legal',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    accentClass: 'text-blue-600',
    icon: 'Building2',
  },
  {
    key: 'landcase',
    label: 'Land Case System',
    shortLabel: 'Land Case',
    description: 'Legal Case Management',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    accentClass: 'text-amber-600',
    icon: 'Scale',
  },
]

export function getApplication(key?: string | null): ApplicationDef | undefined {
  if (!key) return undefined
  return APPLICATIONS.find((a) => a.key === key)
}

export function applicationLabel(key?: string | null): string {
  return getApplication(key)?.label ?? 'Unassigned'
}

export function applicationBadgeClass(key?: string | null): string {
  return getApplication(key)?.badgeClass ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

const isValidSystem = (v: unknown): v is ApplicationKey =>
  v === 'audit' || v === 'corporate' || v === 'landcase'

/**
 * Name-based classifier. Used (a) as the client-side fallback before the
 * `groups.system` column exists, and (b) to seed the migration backfill.
 *
 * Returns null when a group cannot be confidently attributed to one system
 * (e.g. the generic "Super Admin" / "Manager" / "Viewer" groups that exist on
 * the shared DB). Ambiguous groups stay unassigned rather than being mis-tagged.
 */
export function classifyGroupApplication(groupName: string): ApplicationKey | null {
  const n = (groupName || '').trim().toLowerCase()
  if (!n) return null
  // Corporate — anything explicitly "corporate".
  if (n.includes('corporate')) return 'corporate'
  // Land Case — litigation / land-case / the known legal-clerk roles.
  if (n.includes('litigation') || n.includes('land case') || n.includes('land cases')) {
    return 'landcase'
  }
  if (['document clerk', 'legal clerk'].includes(n)) return 'landcase'
  // Audit — anything "audit" or the audit role templates.
  if (n.includes('audit')) return 'audit'
  if (['senior auditor', 'audit manager', 'risk officer', 'action owner'].includes(n)) {
    return 'audit'
  }
  // Ambiguous (Super Admin, Manager, Viewer, ...) — leave unassigned.
  return null
}

/** Resolve a group's system: prefer the stored column, else classify by name. */
export function resolveGroupApplication(group: Pick<Group, 'group_name'> & { system?: string | null }): ApplicationKey | null {
  if (isValidSystem(group.system)) return group.system
  return classifyGroupApplication(group.group_name)
}

export const isUndefinedColumnError = (
  error: { code?: string; message?: string } | null,
): boolean => {
  if (!error) return false
  // 42703 = undefined_column. PGRST204 = column missing from schema cache.
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    /system|application/i.test(error.message || '')
  )
}

export interface GroupWithSystem extends Group {
  system: ApplicationKey | null
}

/**
 * Fetch every group with a resolved `system`. `select('*')` never errors on a
 * missing column, so this works before AND after migration 015; when the column
 * is absent we fall back to name-based classification.
 */
export async function fetchGroupsWithSystem(
  supabase: SupabaseClient<Database>,
): Promise<{ data: GroupWithSystem[]; hasColumn: boolean }> {
  const res = await supabase.from('groups').select('*').order('group_name')
  if (res.error) throw res.error
  const rows = (res.data as any[]) || []
  const hasColumn = rows.some((r) => 'system' in r)
  const data: GroupWithSystem[] = rows.map((g) => ({
    ...g,
    system: resolveGroupApplication(g),
  }))
  return { data, hasColumn }
}

/** Insert a group tagged with a system; retries without the column if needed. */
export async function insertGroupForApplication(
  supabase: SupabaseClient<Database>,
  values: { group_name: string; description: string | null; system: ApplicationKey },
) {
  const withSystem = await supabase
    .from('groups')
    .insert(values as any)
    .select()
    .single()
  if (!withSystem.error) return withSystem
  if (!isUndefinedColumnError(withSystem.error)) return withSystem
  // Column not present yet — insert without it (name classifier will scope it).
  const { system, ...rest } = values
  return await supabase.from('groups').insert(rest as any).select().single()
}

/** Update a group's system. Returns { persisted:false } if the column is absent. */
export async function setGroupApplication(
  supabase: SupabaseClient<Database>,
  groupId: string,
  system: ApplicationKey,
): Promise<{ persisted: boolean; error?: unknown }> {
  const res = await supabase
    .from('groups')
    .update({ system, updated_at: new Date().toISOString() } as any)
    .eq('id', groupId)
  if (!res.error) return { persisted: true }
  if (isUndefinedColumnError(res.error)) return { persisted: false }
  return { persisted: false, error: res.error }
}

/** Fetch modules for a system (uses the DB `system` column). */
export async function fetchModulesForApplication(
  supabase: SupabaseClient<Database>,
  system: ApplicationKey,
): Promise<Module[]> {
  const res = await supabase
    .from('modules')
    .select('*')
    .eq('system', system)
    .order('display_order', { ascending: true })
    .order('module_name', { ascending: true })
  if (res.error) {
    if (isUndefinedColumnError(res.error)) {
      // No `system` column on modules — return everything as a fallback.
      const all = await supabase.from('modules').select('*').order('module_name')
      if (all.error) throw all.error
      return (all.data as Module[]) || []
    }
    throw res.error
  }
  return (res.data as Module[]) || []
}
