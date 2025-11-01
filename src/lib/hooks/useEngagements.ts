import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Engagement = Database['public']['Tables']['engagements']['Row']
type EngagementInsert = Database['public']['Tables']['engagements']['Insert']

export function useEngagements() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchEngagements()
  }, [])

  const fetchEngagements = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('engagements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEngagements(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createEngagement = async (engagement: EngagementInsert) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('engagements')
        .insert(engagement as any)
        .select()
        .single()

      if (error) throw error
      setEngagements([data, ...engagements])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateEngagement = async (id: string, updates: Partial<Engagement>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('engagements')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setEngagements(engagements.map(e => e.id === id ? data : e))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteEngagement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('engagements')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEngagements(engagements.filter(e => e.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    engagements,
    loading,
    error,
    refresh: fetchEngagements,
    createEngagement,
    updateEngagement,
    deleteEngagement,
  }
}
