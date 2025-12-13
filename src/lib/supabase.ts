import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper to get current user's person record
export async function getCurrentPerson() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return person
}

// Helper to check if user has role
export async function hasRole(role: string | string[]) {
  const person = await getCurrentPerson()
  if (!person) return false

  const personRole = person.role as string
  if (Array.isArray(role)) {
    return role.includes(personRole)
  }
  return personRole === role
}
