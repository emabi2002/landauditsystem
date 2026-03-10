import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper to get current authenticated user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper to get current user's audit_users record (if exists)
export async function getCurrentAuditUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: auditUser } = await supabase
    .from('audit_users')
    .select('*')
    .eq('id', user.id)
    .single()

  return auditUser
}

// Helper to get user's groups
export async function getUserGroups() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: userGroups } = await supabase
    .from('user_groups')
    .select(`
      group_id,
      groups (
        id,
        group_name,
        description
      )
    `)
    .eq('user_id', user.id)

  return userGroups || []
}

// Helper to check if user has a specific group
export async function hasGroup(groupName: string | string[]) {
  const userGroups = await getUserGroups()
  if (!userGroups || userGroups.length === 0) return false

  const groupNames = userGroups.map((ug: any) => ug.groups?.group_name).filter(Boolean)

  if (Array.isArray(groupName)) {
    return groupName.some(g => groupNames.includes(g))
  }
  return groupNames.includes(groupName)
}

// Legacy function - returns null (no people table in audit system)
export async function getCurrentPerson() {
  // This function is deprecated in the audit system
  // Use getCurrentUser() or getCurrentAuditUser() instead
  return null
}

// Legacy function - always returns false (no roles table in audit system)
export async function hasRole(role: string | string[]) {
  // This function is deprecated in the audit system
  // Use hasGroup() instead for RBAC
  return false
}
