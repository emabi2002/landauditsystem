import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type ActionPlan = Database['public']['Tables']['audit_action_plans']['Row']
type ActionPlanInsert = Database['public']['Tables']['audit_action_plans']['Insert']

export function useActionPlans() {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchActionPlans()
  }, [])

  const fetchActionPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audit_action_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setActionPlans(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createActionPlan = async (plan: ActionPlanInsert) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('audit_action_plans')
        .insert(plan as any)
        .select()
        .single()

      if (error) throw error
      setActionPlans([data, ...actionPlans])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateActionPlan = async (id: string, updates: Partial<ActionPlan>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('audit_action_plans')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setActionPlans(actionPlans.map((p) => (p.id === id ? data : p)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteActionPlan = async (id: string) => {
    try {
      const { error } = await supabase.from('audit_action_plans').delete().eq('id', id)
      if (error) throw error
      setActionPlans(actionPlans.filter((p) => p.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    actionPlans,
    loading,
    error,
    refresh: fetchActionPlans,
    createActionPlan,
    updateActionPlan,
    deleteActionPlan,
  }
}
