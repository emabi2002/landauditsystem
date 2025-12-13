'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../database.types'

type RiskProfile = Database['public']['Tables']['risk_profiles']['Row']
type RiskProfileInsert = Database['public']['Tables']['risk_profiles']['Insert']
type RiskProfileUpdate = Database['public']['Tables']['risk_profiles']['Update']
type RiskProfileItem = Database['public']['Tables']['risk_profile_items']['Row']
type RiskProfileItemInsert = Database['public']['Tables']['risk_profile_items']['Insert']

export function useRiskProfiles() {
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  const fetchRiskProfiles = async (orgUnitId?: string, year?: number) => {
    try {
      setLoading(true)
      let query = supabase
        .from('risk_profiles')
        .select(`
          *,
          org_units(name, code),
          prepared_by_person:people!risk_profiles_prepared_by_fkey(full_name),
          reviewed_by_person:people!risk_profiles_reviewed_by_fkey(full_name)
        `)
        .order('profile_date', { ascending: false })

      if (orgUnitId) {
        query = query.eq('org_unit_id', orgUnitId)
      }

      if (year) {
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`
        query = query.gte('profile_date', startDate).lte('profile_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      setRiskProfiles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risk profiles')
    } finally {
      setLoading(false)
    }
  }

  const createRiskProfile = async (profile: RiskProfileInsert) => {
    try {
      const { data, error } = await supabase
        .from('risk_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create risk profile'
      }
    }
  }

  const updateRiskProfile = async (id: string, updates: RiskProfileUpdate) => {
    try {
      const { data, error } = await supabase
        .from('risk_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update risk profile'
      }
    }
  }

  const deleteRiskProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('risk_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to delete risk profile'
      }
    }
  }

  const fetchRiskProfileItems = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_profile_items')
        .select(`
          *,
          risk_owner:org_units(name, code)
        `)
        .eq('risk_profile_id', profileId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch risk items'
      }
    }
  }

  const createRiskProfileItem = async (item: RiskProfileItemInsert) => {
    try {
      const { data, error } = await supabase
        .from('risk_profile_items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create risk item'
      }
    }
  }

  const updateRiskProfileItem = async (id: string, updates: Partial<RiskProfileItem>) => {
    try {
      const { data, error } = await supabase
        .from('risk_profile_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update risk item'
      }
    }
  }

  const deleteRiskProfileItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('risk_profile_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to delete risk item'
      }
    }
  }

  useEffect(() => {
    fetchRiskProfiles()
  }, [])

  return {
    riskProfiles,
    loading,
    error,
    fetchRiskProfiles,
    createRiskProfile,
    updateRiskProfile,
    deleteRiskProfile,
    fetchRiskProfileItems,
    createRiskProfileItem,
    updateRiskProfileItem,
    deleteRiskProfileItem
  }
}
