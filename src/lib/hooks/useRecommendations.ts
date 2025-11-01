import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Recommendation = Database['public']['Tables']['recommendations']['Row']
type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecommendations(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createRecommendation = async (recommendation: RecommendationInsert) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendation as any)
        .select()
        .single()

      if (error) throw error
      setRecommendations([data, ...recommendations])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateRecommendation = async (id: string, updates: Partial<Recommendation>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('recommendations')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRecommendations(recommendations.map(r => r.id === id ? data : r))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id)

      if (error) throw error
      setRecommendations(recommendations.filter(r => r.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const publishRecommendation = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.rpc('publish_recommendation', { rec_id: id } as any)
      if (error) throw error
      await fetchRecommendations()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    publishRecommendation,
  }
}
