'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../database.types'

type StrategicKRA = Database['public']['Tables']['audit_strategic_kras']['Row']
type StrategicKRAInsert = Database['public']['Tables']['audit_strategic_kras']['Insert']
type KRAActivity = Database['public']['Tables']['audit_kra_activities']['Row']
type KRAActivityInsert = Database['public']['Tables']['audit_kra_activities']['Insert']
type KRAQuarterlyStatus = Database['public']['Tables']['audit_kra_activity_quarterly_status']['Row']
type KRAQuarterlyStatusInsert = Database['public']['Tables']['audit_kra_activity_quarterly_status']['Insert']

export function useKRAs() {
  const [kras, setKRAs] = useState<StrategicKRA[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  const fetchKRAs = async (orgUnitId?: string, year?: number) => {
    try {
      setLoading(true)
      let query = supabase
        .from('audit_strategic_kras')
        .select(`
          *,
          org_units(name, code)
        `)
        .order('kra_code', { ascending: true })

      if (orgUnitId) {
        query = query.eq('org_unit_id', orgUnitId)
      }

      if (year) {
        query = query.lte('start_year', year)
        query = query.or(`end_year.is.null,end_year.gte.${year}`)
      }

      const { data, error } = await query

      if (error) throw error
      setKRAs(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KRAs')
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch KRAs'
      }
    } finally {
      setLoading(false)
    }
  }

  const createKRA = async (kra: StrategicKRAInsert) => {
    try {
      const { data, error } = await supabase
        .from('audit_strategic_kras')
        .insert(kra)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create KRA'
      }
    }
  }

  const updateKRA = async (id: string, updates: Partial<StrategicKRA>) => {
    try {
      const { data, error } = await supabase
        .from('audit_strategic_kras')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update KRA'
      }
    }
  }

  const deleteKRA = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audit_strategic_kras')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to delete KRA'
      }
    }
  }

  const fetchActivities = async (kraId: string) => {
    try {
      const { data, error } = await supabase
        .from('audit_kra_activities')
        .select('*')
        .eq('strategic_kra_id', kraId)
        .order('activity_code', { ascending: true })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch activities'
      }
    }
  }

  const createActivity = async (activity: KRAActivityInsert) => {
    try {
      const { data, error } = await supabase
        .from('audit_kra_activities')
        .insert(activity)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create activity'
      }
    }
  }

  const updateActivity = async (id: string, updates: Partial<KRAActivity>) => {
    try {
      const { data, error } = await supabase
        .from('audit_kra_activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update activity'
      }
    }
  }

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audit_kra_activities')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to delete activity'
      }
    }
  }

  const fetchQuarterlyStatus = async (
    activityId?: string,
    year?: number,
    quarter?: number
  ) => {
    try {
      let query = supabase
        .from('audit_kra_activity_quarterly_status')
        .select(`
          *,
          kra_activities(
            description,
            activity_code,
            measure,
            strategic_kras(kra_code, kra_title, org_units(name, code))
          )
        `)
        .order('financial_year', { ascending: false })
        .order('quarter', { ascending: false })

      if (activityId) {
        query = query.eq('kra_activity_id', activityId)
      }

      if (year) {
        query = query.eq('financial_year', year)
      }

      if (quarter) {
        query = query.eq('quarter', quarter)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch quarterly status'
      }
    }
  }

  const createOrUpdateQuarterlyStatus = async (status: KRAQuarterlyStatusInsert) => {
    try {
      const { data, error } = await supabase
        .from('audit_kra_activity_quarterly_status')
        .upsert(status, {
          onConflict: 'kra_activity_id,financial_year,quarter'
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to save quarterly status'
      }
    }
  }

  const fetchKRAStatusSummary = async (orgUnitId?: string, year?: number, quarter?: number) => {
    try {
      let query = supabase
        .from('v_kra_status_summary')
        .select('*')

      if (orgUnitId) {
        query = query.eq('org_unit_id', orgUnitId)
      }

      if (year) {
        query = query.eq('financial_year', year)
      }

      if (quarter) {
        query = query.eq('quarter', quarter)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch KRA summary'
      }
    }
  }

  useEffect(() => {
    fetchKRAs()
  }, [])

  return {
    kras,
    loading,
    error,
    fetchKRAs,
    createKRA,
    updateKRA,
    deleteKRA,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    fetchQuarterlyStatus,
    createOrUpdateQuarterlyStatus,
    fetchKRAStatusSummary
  }
}
