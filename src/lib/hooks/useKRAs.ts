'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '../database.types'

type StrategicKRA = Database['public']['Tables']['audit_strategic_kras']['Row'] & {
  org_units?: { name: string | null; code: string | null } | null
}

export interface KRAStatusSummaryRow {
  strategic_kra_id: string
  kra_code: string
  kra_title: string
  org_unit_name: string | null
  financial_year: number
  quarter: number
  total_activities: number
  completed: number
  ongoing: number
  delayed: number
  not_started: number
}

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
        .select(`*, org_units(name, code)`)
        .order('kra_code', { ascending: true })

      if (orgUnitId) query = query.eq('org_unit_id', orgUnitId)
      if (year) {
        query = query.lte('start_year', year)
        query = query.or(`end_year.is.null,end_year.gte.${year}`)
      }

      const { data, error } = await query
      if (error) throw error
      const rows = ((data as any[]) || []) as StrategicKRA[]
      setKRAs(rows)
      return { data: rows, error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch KRAs'
      setError(msg)
      return { data: [], error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aggregates quarterly activity statuses into a per-KRA summary. The database
   * has no `v_kra_status_summary` view in this project, so we compute it in JS
   * from `audit_kra_activity_quarterly_status` joined up to the KRA + org unit.
   */
  const fetchKRAStatusSummary = async (
    orgUnitId?: string,
    year?: number,
    quarter?: number
  ) => {
    try {
      let query = supabase
        .from('audit_kra_activity_quarterly_status')
        .select(`
          status,
          financial_year,
          quarter,
          audit_kra_activities(
            strategic_kra_id,
            audit_strategic_kras(kra_code, kra_title, org_unit_id, org_units(name))
          )
        `)

      if (year) query = query.eq('financial_year', year)
      if (quarter) query = query.eq('quarter', quarter)

      const { data, error } = await query
      if (error) throw error

      const map = new Map<string, KRAStatusSummaryRow>()
      for (const row of (data as any[]) || []) {
        const activity = row.audit_kra_activities
        const kra = activity?.audit_strategic_kras
        if (!kra) continue
        if (orgUnitId && kra.org_unit_id !== orgUnitId) continue

        const key = activity.strategic_kra_id
        if (!map.has(key)) {
          map.set(key, {
            strategic_kra_id: key,
            kra_code: kra.kra_code,
            kra_title: kra.kra_title,
            org_unit_name: kra.org_units?.name ?? null,
            financial_year: row.financial_year,
            quarter: row.quarter,
            total_activities: 0,
            completed: 0,
            ongoing: 0,
            delayed: 0,
            not_started: 0,
          })
        }
        const s = map.get(key)!
        s.total_activities += 1
        const st = String(row.status || '').toLowerCase()
        if (st === 'completed') s.completed += 1
        else if (st === 'ongoing' || st === 'in progress') s.ongoing += 1
        else if (st === 'delayed') s.delayed += 1
        else s.not_started += 1
      }

      return { data: Array.from(map.values()), error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch KRA status summary'
      return { data: [], error: msg }
    }
  }

  const createKRA = async (kra: Partial<StrategicKRA>) => {
    const { data, error } = await supabase
      .from('audit_strategic_kras')
      .insert(kra as any)
      .select()
      .single()
    if (!error) fetchKRAs()
    return { data, error: error?.message ?? null }
  }

  const updateKRA = async (id: string, updates: Partial<StrategicKRA>) => {
    const { data, error } = await supabase
      .from('audit_strategic_kras')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()
    if (!error) fetchKRAs()
    return { data, error: error?.message ?? null }
  }

  const deleteKRA = async (id: string) => {
    // Remove quarterly statuses + activities first (avoid FK errors), then the KRA.
    const { data: acts } = await supabase
      .from('audit_kra_activities')
      .select('id')
      .eq('strategic_kra_id', id)
    const activityIds = ((acts as any[]) || []).map((a) => a.id)
    if (activityIds.length > 0) {
      await supabase
        .from('audit_kra_activity_quarterly_status')
        .delete()
        .in('kra_activity_id', activityIds)
      await supabase.from('audit_kra_activities').delete().eq('strategic_kra_id', id)
    }
    const { error } = await supabase.from('audit_strategic_kras').delete().eq('id', id)
    if (!error) fetchKRAs()
    return { error: error?.message ?? null }
  }

  // ---- KRA activities -------------------------------------------------------
  const fetchActivities = async (strategicKraId?: string) => {
    let query = supabase
      .from('audit_kra_activities')
      .select('*')
      .order('activity_code', { ascending: true })
    if (strategicKraId) query = query.eq('strategic_kra_id', strategicKraId)
    const { data, error } = await query
    return { data: (data as any[]) || [], error: error?.message ?? null }
  }

  const createActivity = async (activity: {
    strategic_kra_id: string
    activity_code?: string
    description: string
    measure?: string
    baseline?: string
    annual_target?: string
  }) => {
    const { data, error } = await supabase
      .from('audit_kra_activities')
      .insert(activity as any)
      .select()
      .single()
    return { data, error: error?.message ?? null }
  }

  const updateActivity = async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('audit_kra_activities')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()
    return { data, error: error?.message ?? null }
  }

  const deleteActivity = async (id: string) => {
    await supabase.from('audit_kra_activity_quarterly_status').delete().eq('kra_activity_id', id)
    const { error } = await supabase.from('audit_kra_activities').delete().eq('id', id)
    return { error: error?.message ?? null }
  }

  useEffect(() => {
    fetchKRAs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    kras,
    loading,
    error,
    fetchKRAs,
    fetchKRAStatusSummary,
    createKRA,
    updateKRA,
    deleteKRA,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  }
}
