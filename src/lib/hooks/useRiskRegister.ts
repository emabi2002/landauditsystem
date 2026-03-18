'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, RiskCategory, RiskRating, RiskStatus } from '../database.types'

type RiskRegister = Database['public']['Tables']['audit_risk_register']['Row']
type RiskRegisterInsert = Database['public']['Tables']['audit_risk_register']['Insert']
type RiskRegisterUpdate = Database['public']['Tables']['audit_risk_register']['Update']
type Division = Database['public']['Tables']['audit_divisions']['Row']
type LegalInstrument = Database['public']['Tables']['audit_legal_instruments']['Row']
type RiskLegalReference = Database['public']['Tables']['audit_risk_legal_references']['Row']
type RiskTreatment = Database['public']['Tables']['audit_risk_treatments']['Row']
type RiskIncident = Database['public']['Tables']['audit_risk_incidents']['Row']

export interface RiskWithRelations extends RiskRegister {
  audit_divisions?: Division | null
  legal_references?: (RiskLegalReference & { audit_legal_instruments?: LegalInstrument })[]
  treatments?: RiskTreatment[]
  incidents?: RiskIncident[]
}

export interface RiskFilters {
  status?: RiskStatus
  category?: RiskCategory
  rating?: RiskRating
  division_id?: string
  search?: string
}

export interface RiskStats {
  total: number
  extreme: number
  high: number
  medium: number
  low: number
  byCategory: Record<string, number>
  byDivision: Record<string, number>
  byStatus: Record<string, number>
}

export function useRiskRegister() {
  const [risks, setRisks] = useState<RiskWithRelations[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [legalInstruments, setLegalInstruments] = useState<LegalInstrument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<RiskStats>({
    total: 0,
    extreme: 0,
    high: 0,
    medium: 0,
    low: 0,
    byCategory: {},
    byDivision: {},
    byStatus: {}
  })

  const supabase = createClientComponentClient<Database>()

  // Calculate stats from risks
  const calculateStats = useCallback((riskList: RiskWithRelations[]): RiskStats => {
    const stats: RiskStats = {
      total: riskList.length,
      extreme: 0,
      high: 0,
      medium: 0,
      low: 0,
      byCategory: {},
      byDivision: {},
      byStatus: {}
    }

    riskList.forEach(risk => {
      // By rating
      switch (risk.residual_risk_rating) {
        case 'Extreme': stats.extreme++; break
        case 'High': stats.high++; break
        case 'Medium': stats.medium++; break
        case 'Low': stats.low++; break
      }

      // By category
      stats.byCategory[risk.risk_category] = (stats.byCategory[risk.risk_category] || 0) + 1

      // By division
      const divName = risk.audit_divisions?.name || 'Unassigned'
      stats.byDivision[divName] = (stats.byDivision[divName] || 0) + 1

      // By status
      stats.byStatus[risk.risk_status] = (stats.byStatus[risk.risk_status] || 0) + 1
    })

    return stats
  }, [])

  // Fetch all risks with relations
  const fetchRisks = useCallback(async (filters?: RiskFilters) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('audit_risk_register')
        .select(`
          *,
          audit_divisions(id, code, name)
        `)
        .order('risk_code', { ascending: true })

      // Apply filters
      if (filters?.status) {
        query = query.eq('risk_status', filters.status)
      }
      if (filters?.category) {
        query = query.eq('risk_category', filters.category)
      }
      if (filters?.rating) {
        query = query.eq('residual_risk_rating', filters.rating)
      }
      if (filters?.division_id) {
        query = query.eq('division_id', filters.division_id)
      }
      if (filters?.search) {
        query = query.or(`risk_title.ilike.%${filters.search}%,risk_code.ilike.%${filters.search}%,risk_description.ilike.%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      console.log("Fetched risks:", data?.length || 0, "Error:", fetchError)

      if (fetchError) throw fetchError

      const riskList = (data || []) as RiskWithRelations[]
      setRisks(riskList)
      setStats(calculateStats(riskList))

      return { data: riskList, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch risks'
      setError(message)
      return { data: [], error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Fetch a single risk with all relations
  const fetchRiskById = useCallback(async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_register')
        .select(`
          *,
          audit_divisions(id, code, name, head_title),
          audit_sections(id, code, name),
          audit_business_processes(id, code, name)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Fetch legal references separately
      const { data: legalRefs } = await supabase
        .from('audit_risk_legal_references')
        .select(`
          *,
          audit_legal_instruments(id, code, title, instrument_type)
        `)
        .eq('risk_id', id)

      // Fetch treatments
      const { data: treatments } = await supabase
        .from('audit_risk_treatments')
        .select('*')
        .eq('risk_id', id)
        .order('created_at', { ascending: false })

      // Fetch incidents
      const { data: incidents } = await supabase
        .from('audit_risk_incidents')
        .select('*')
        .eq('risk_id', id)
        .order('incident_date', { ascending: false })

      const riskWithRelations: RiskWithRelations = {
        ...(data as any),
        legal_references: legalRefs as any || [],
        treatments: treatments as any || [],
        incidents: incidents as any || []
      }

      return { data: riskWithRelations, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch risk'
      }
    }
  }, [supabase])

  // Fetch divisions
  const fetchDivisions = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_divisions')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      setDivisions(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch divisions'
      }
    }
  }, [supabase])

  // Fetch legal instruments
  const fetchLegalInstruments = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_legal_instruments')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (fetchError) throw fetchError
      setLegalInstruments(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch legal instruments'
      }
    }
  }, [supabase])

  // Create a new risk
  const createRisk = useCallback(async (
    risk: RiskRegisterInsert,
    legalReferences?: { legal_instrument_id: string; section_reference?: string; compliance_type: 'Mandatory' | 'Advisory' | 'Best Practice' }[]
  ) => {
    try {
      // Validate at least one legal reference
      if (!legalReferences || legalReferences.length === 0) {
        return {
          data: null,
          error: 'A risk cannot be created without at least one legal reference'
        }
      }

      // Insert the risk
      const { data: newRisk, error: insertError } = await supabase
        .from('audit_risk_register')
        .insert(risk as any)
        .select()
        .single()

      if (insertError) throw insertError

      // Insert legal references
      const legalRefInserts = legalReferences.map(ref => ({
        risk_id: (newRisk as any).id,
        legal_instrument_id: ref.legal_instrument_id,
        section_reference: ref.section_reference || null,
        compliance_type: ref.compliance_type
      }))

      const { error: refError } = await supabase
        .from('audit_risk_legal_references')
        .insert(legalRefInserts as any)

      if (refError) {
        // Rollback risk creation
        await supabase.from('audit_risk_register').delete().eq('id', (newRisk as any).id)
        throw refError
      }

      // Refresh risks
      await fetchRisks()

      return { data: newRisk, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create risk'
      }
    }
  }, [supabase, fetchRisks])

  // Update a risk
  const updateRisk = useCallback(async (id: string, updates: RiskRegisterUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('audit_risk_register')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh risks
      await fetchRisks()

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update risk'
      }
    }
  }, [supabase, fetchRisks])

  // Update risk status (with audit logging)
  const updateRiskStatus = useCallback(async (id: string, newStatus: RiskStatus, reason?: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('audit_risk_register')
        .update({
          risk_status: newStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh risks
      await fetchRisks()

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update risk status'
      }
    }
  }, [supabase, fetchRisks])

  // Review a risk (update last_reviewed_at and set next review)
  const reviewRisk = useCallback(async (id: string, notes?: string) => {
    try {
      const now = new Date()
      const nextReview = new Date()
      nextReview.setMonth(nextReview.getMonth() + 3) // Default quarterly

      const { data, error: updateError } = await supabase
        .from('audit_risk_register')
        .update({
          last_reviewed_at: now.toISOString(),
          next_review_due: nextReview.toISOString().split('T')[0],
          notes: notes || null,
          updated_at: now.toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh risks
      await fetchRisks()

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to review risk'
      }
    }
  }, [supabase, fetchRisks])

  // Add a treatment action
  const addTreatment = useCallback(async (treatment: Database['public']['Tables']['audit_risk_treatments']['Insert']) => {
    try {
      const { data, error: insertError } = await supabase
        .from('audit_risk_treatments')
        .insert(treatment as any)
        .select()
        .single()

      if (insertError) throw insertError

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to add treatment'
      }
    }
  }, [supabase])

  // Record an incident
  const recordIncident = useCallback(async (incident: Database['public']['Tables']['audit_risk_incidents']['Insert']) => {
    try {
      const { data, error: insertError } = await supabase
        .from('audit_risk_incidents')
        .insert(incident as any)
        .select()
        .single()

      if (insertError) throw insertError

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to record incident'
      }
    }
  }, [supabase])

  // Get risks requiring review (overdue or due soon)
  const getRisksRequiringReview = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error: fetchError } = await supabase
        .from('audit_risk_register')
        .select(`
          *,
          audit_divisions(id, code, name)
        `)
        .eq('risk_status', 'Active')
        .or(`next_review_due.lte.${today},next_review_due.is.null`)
        .order('next_review_due', { ascending: true })

      if (fetchError) throw fetchError

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch risks requiring review'
      }
    }
  }, [supabase])

  // Get extreme/high risks for audit planning
  const getHighPriorityRisks = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_register')
        .select(`
          *,
          audit_divisions(id, code, name)
        `)
        .eq('risk_status', 'Active')
        .in('residual_risk_rating', ['Extreme', 'High'])
        .order('residual_risk_score', { ascending: false })

      if (fetchError) throw fetchError

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch high priority risks'
      }
    }
  }, [supabase])

  // Get risk audit history
  const getRiskAuditLog = useCallback(async (riskId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_audit_log')
        .select(`
          *,
          people:changed_by(full_name)
        `)
        .eq('risk_id', riskId)
        .order('changed_at', { ascending: false })

      if (fetchError) throw fetchError

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch audit log'
      }
    }
  }, [supabase])

  // Get risks by legal instrument (for compliance dashboard)
  const getRisksByLegalInstrument = useCallback(async (legalInstrumentId: string) => {
    try {
      const { data: refs, error: refError } = await supabase
        .from('audit_risk_legal_references')
        .select('risk_id')
        .eq('legal_instrument_id', legalInstrumentId)

      if (refError) throw refError

      if (!refs || refs.length === 0) {
        return { data: [], error: null }
      }

      const riskIds = (refs as any[]).map(r => r.risk_id)

      const { data, error: fetchError } = await supabase
        .from('audit_risk_register')
        .select(`
          *,
          audit_divisions(id, code, name)
        `)
        .in('id', riskIds)
        .order('residual_risk_score', { ascending: false })

      if (fetchError) throw fetchError

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch risks by legal instrument'
      }
    }
  }, [supabase])

  // Initial data load
  useEffect(() => {
    fetchRisks()
    fetchDivisions()
    fetchLegalInstruments()
  }, [fetchRisks, fetchDivisions, fetchLegalInstruments])

  return {
    // Data
    risks,
    divisions,
    legalInstruments,
    stats,
    loading,
    error,

    // CRUD Operations
    fetchRisks,
    fetchRiskById,
    createRisk,
    updateRisk,
    updateRiskStatus,
    reviewRisk,

    // Related entities
    addTreatment,
    recordIncident,

    // Queries
    getRisksRequiringReview,
    getHighPriorityRisks,
    getRiskAuditLog,
    getRisksByLegalInstrument,

    // Reference data
    fetchDivisions,
    fetchLegalInstruments
  }
}
