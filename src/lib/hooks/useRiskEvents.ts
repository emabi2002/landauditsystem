'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../database.types'

type RiskEvent = Database['public']['Tables']['audit_risk_events']['Row']
type RiskEventInsert = Database['public']['Tables']['audit_risk_events']['Insert']
type RiskEventUpdate = Database['public']['Tables']['audit_risk_events']['Update']
type AuditCategory = Database['public']['Tables']['audit_categories']['Row']
type Division = Database['public']['Tables']['audit_divisions']['Row']
type RiskRegister = Database['public']['Tables']['audit_risk_register']['Row']
type Task = Database['public']['Tables']['audit_tasks']['Row']

export type RiskEventSource = 'AAAP' | 'Secretary' | 'External' | 'Internal'
export type RiskEventStatus = 'Pending' | 'Under Review' | 'Approved' | 'Allocated' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Rejected'
export type ResponseType = 'Audit' | 'Review' | 'Investigation' | 'Information Request'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

export interface RiskEventWithRelations extends RiskEvent {
  audit_risk_register?: RiskRegister | null
  audit_categories?: AuditCategory | null
  target_division?: Division | null
  requesting_division?: Division | null
  tasks?: Task[]
}

export interface RiskEventFilters {
  source_type?: RiskEventSource
  event_status?: RiskEventStatus
  priority?: Priority
  financial_year?: number
  target_division_id?: string
  audit_category_id?: string
  search?: string
}

export interface RiskEventStats {
  total: number
  pending: number
  underReview: number
  approved: number
  allocated: number
  inProgress: number
  completed: number
  bySource: Record<string, number>
  byPriority: Record<string, number>
  byCategory: Record<string, number>
}

export function useRiskEvents() {
  const [riskEvents, setRiskEvents] = useState<RiskEventWithRelations[]>([])
  const [categories, setCategories] = useState<AuditCategory[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [risks, setRisks] = useState<RiskRegister[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<RiskEventStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    allocated: 0,
    inProgress: 0,
    completed: 0,
    bySource: {},
    byPriority: {},
    byCategory: {}
  })

  const supabase = createClientComponentClient<Database>()

  // Calculate stats from risk events
  const calculateStats = useCallback((events: RiskEventWithRelations[]): RiskEventStats => {
    const stats: RiskEventStats = {
      total: events.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      allocated: 0,
      inProgress: 0,
      completed: 0,
      bySource: {},
      byPriority: {},
      byCategory: {}
    }

    events.forEach(event => {
      // By status
      switch (event.event_status) {
        case 'Pending': stats.pending++; break
        case 'Under Review': stats.underReview++; break
        case 'Approved': stats.approved++; break
        case 'Allocated': stats.allocated++; break
        case 'In Progress': stats.inProgress++; break
        case 'Completed': stats.completed++; break
      }

      // By source
      stats.bySource[event.source_type] = (stats.bySource[event.source_type] || 0) + 1

      // By priority
      stats.byPriority[event.priority] = (stats.byPriority[event.priority] || 0) + 1

      // By category
      const catName = event.audit_categories?.name || 'Uncategorized'
      stats.byCategory[catName] = (stats.byCategory[catName] || 0) + 1
    })

    return stats
  }, [])

  // Fetch all risk events with relations
  const fetchRiskEvents = useCallback(async (filters?: RiskEventFilters) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('audit_risk_events')
        .select(`
          *,
          audit_risk_register:primary_risk_id(id, risk_code, risk_title, residual_risk_rating),
          audit_categories:audit_category_id(id, code, name),
          target_division:target_division_id(id, code, name),
          requesting_division:requesting_division_id(id, code, name)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.source_type) {
        query = query.eq('source_type', filters.source_type)
      }
      if (filters?.event_status) {
        query = query.eq('event_status', filters.event_status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.financial_year) {
        query = query.eq('financial_year', filters.financial_year)
      }
      if (filters?.target_division_id) {
        query = query.eq('target_division_id', filters.target_division_id)
      }
      if (filters?.audit_category_id) {
        query = query.eq('audit_category_id', filters.audit_category_id)
      }
      if (filters?.search) {
        query = query.or(`event_title.ilike.%${filters.search}%,event_code.ilike.%${filters.search}%,event_description.ilike.%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const eventList = (data || []) as unknown as RiskEventWithRelations[]
      setRiskEvents(eventList)
      setStats(calculateStats(eventList))

      return { data: eventList, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch risk events'
      setError(message)
      return { data: [], error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Fetch a single risk event with all relations
  const fetchRiskEventById = useCallback(async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_events')
        .select(`
          *,
          audit_risk_register:primary_risk_id(*),
          audit_categories:audit_category_id(*),
          target_division:target_division_id(*),
          requesting_division:requesting_division_id(*)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Fetch tasks for this event
      const { data: tasks } = await supabase
        .from('audit_tasks')
        .select('*')
        .eq('risk_event_id', id)
        .order('created_at', { ascending: true })

      // Fetch activity log
      const { data: activityLog } = await supabase
        .from('audit_risk_event_log')
        .select('*')
        .eq('risk_event_id', id)
        .order('performed_at', { ascending: false })

      // Fetch milestones
      const { data: milestones } = await supabase
        .from('audit_risk_event_milestones')
        .select('*')
        .eq('risk_event_id', id)
        .order('planned_date', { ascending: true })

      // Fetch documents
      const { data: documents } = await supabase
        .from('audit_risk_event_documents')
        .select('*')
        .eq('risk_event_id', id)
        .order('created_at', { ascending: false })

      // Fetch additional linked risks
      const { data: linkedRisks } = await supabase
        .from('audit_risk_event_risks')
        .select(`
          *,
          audit_risk_register:risk_id(id, risk_code, risk_title, residual_risk_rating)
        `)
        .eq('risk_event_id', id)

      const eventWithRelations = {
        ...(data as unknown as RiskEventWithRelations),
        tasks: tasks || [],
        activity_log: activityLog || [],
        milestones: milestones || [],
        documents: documents || [],
        linked_risks: linkedRisks || []
      }

      return { data: eventWithRelations, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch risk event'
      }
    }
  }, [supabase])

  // Fetch audit categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      setCategories(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch categories'
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

  // Fetch active risks for linking
  const fetchRisks = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_register')
        .select('*')
        .eq('risk_status', 'Active')
        .order('risk_code')

      if (fetchError) throw fetchError
      setRisks(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch risks'
      }
    }
  }, [supabase])

  // Create a new risk event
  const createRiskEvent = useCallback(async (
    eventData: RiskEventInsert,
    additionalRiskIds?: string[]
  ) => {
    try {
      // Validate primary risk is provided
      if (!eventData.primary_risk_id) {
        return {
          data: null,
          error: 'A Risk Event must be linked to at least one risk from the Risk Register'
        }
      }

      // Insert the risk event
      const { data: newEvent, error: insertError } = await supabase
        .from('audit_risk_events')
        .insert(eventData as any)
        .select()
        .single()

      if (insertError) throw insertError

      // Add additional linked risks if provided
      if (additionalRiskIds && additionalRiskIds.length > 0) {
        const linkedRisks = additionalRiskIds.map(riskId => ({
          risk_event_id: (newEvent as any).id,
          risk_id: riskId,
          is_primary: false
        }))

        await supabase
          .from('audit_risk_event_risks')
          .insert(linkedRisks as any)
      }

      // Refresh events
      await fetchRiskEvents()

      return { data: newEvent, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create risk event'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Update a risk event
  const updateRiskEvent = useCallback(async (id: string, updates: RiskEventUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('audit_risk_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh events
      await fetchRiskEvents()

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update risk event'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Audit Manager: Review and approve/reject an event
  const reviewRiskEvent = useCallback(async (
    id: string,
    action: 'approve' | 'reject',
    notes: string,
    rejectionReason?: string
  ) => {
    try {
      const now = new Date().toISOString()

      const updates: any = {
        reviewed_at: now,
        review_notes: notes,
        event_status: action === 'approve' ? 'Approved' : 'Rejected',
        updated_at: now
      }

      if (action === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason
      }

      const { data, error: updateError } = await supabase
        .from('audit_risk_events')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchRiskEvents()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to review risk event'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Audit Manager: Allocate resources
  const allocateRiskEvent = useCallback(async (
    id: string,
    leadAuditorId: string,
    auditCategoryId?: string
  ) => {
    try {
      const now = new Date().toISOString()

      const { data, error: updateError } = await supabase
        .from('audit_risk_events')
        .update({
          allocated_at: now,
          lead_auditor_id: leadAuditorId,
          audit_category_id: auditCategoryId || null,
          event_status: 'Allocated',
          updated_at: now
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchRiskEvents()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to allocate risk event'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Update event status
  const updateEventStatus = useCallback(async (id: string, newStatus: RiskEventStatus) => {
    try {
      const { data, error: updateError } = await supabase
        .from('audit_risk_events')
        .update({
          event_status: newStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchRiskEvents()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update status'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Create an audit engagement from a risk event
  const createEngagementFromEvent = useCallback(async (
    eventId: string,
    engagementData: {
      title: string
      scope?: string
      objectives?: string
      start_date: string
      end_date?: string
    }
  ) => {
    try {
      // First get the event details
      const { data: event } = await supabase
        .from('audit_risk_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (!event) {
        throw new Error('Risk event not found')
      }

      // Create the engagement linked to this event
      const { data: engagement, error: engError } = await supabase
        .from('audit_engagements')
        .insert({
          title: engagementData.title,
          scope: engagementData.scope || null,
          objectives: engagementData.objectives || null,
          start_date: engagementData.start_date,
          end_date: engagementData.end_date || null,
          risk_event_id: eventId,
          risk_id: (event as any).primary_risk_id,
          audit_category_id: (event as any).audit_category_id,
          status: 'Planning',
          lifecycle_stage: 'Planning',
          metadata: {}
        } as any)
        .select()
        .single()

      if (engError) throw engError

      // Update event status to In Progress
      await supabase
        .from('audit_risk_events')
        .update({ event_status: 'In Progress', updated_at: new Date().toISOString() } as any)
        .eq('id', eventId)

      await fetchRiskEvents()
      return { data: engagement, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create engagement'
      }
    }
  }, [supabase, fetchRiskEvents])

  // Add a task to a risk event
  const addTask = useCallback(async (task: Database['public']['Tables']['audit_tasks']['Insert']) => {
    try {
      const { data, error: insertError } = await supabase
        .from('audit_tasks')
        .insert(task as any)
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to add task'
      }
    }
  }, [supabase])

  // Add a milestone to a risk event
  const addMilestone = useCallback(async (milestone: Database['public']['Tables']['audit_risk_event_milestones']['Insert']) => {
    try {
      const { data, error: insertError } = await supabase
        .from('audit_risk_event_milestones')
        .insert(milestone as any)
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to add milestone'
      }
    }
  }, [supabase])

  // Get pending events (for Audit Manager dashboard)
  const getPendingEvents = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_events')
        .select(`
          *,
          audit_risk_register:primary_risk_id(risk_code, risk_title, residual_risk_rating),
          audit_categories:audit_category_id(code, name)
        `)
        .in('event_status', ['Pending', 'Under Review'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch pending events'
      }
    }
  }, [supabase])

  // Get Secretary directives (priority events)
  const getSecretaryDirectives = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_events')
        .select(`
          *,
          audit_risk_register:primary_risk_id(risk_code, risk_title, residual_risk_rating)
        `)
        .eq('source_type', 'Secretary')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch secretary directives'
      }
    }
  }, [supabase])

  // Get activity log for an event
  const getActivityLog = useCallback(async (eventId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_risk_event_log')
        .select('*')
        .eq('risk_event_id', eventId)
        .order('performed_at', { ascending: false })

      if (fetchError) throw fetchError
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch activity log'
      }
    }
  }, [supabase])

  // Initial data load
  useEffect(() => {
    fetchRiskEvents()
    fetchCategories()
    fetchDivisions()
    fetchRisks()
  }, [fetchRiskEvents, fetchCategories, fetchDivisions, fetchRisks])

  return {
    // Data
    riskEvents,
    categories,
    divisions,
    risks,
    stats,
    loading,
    error,

    // CRUD Operations
    fetchRiskEvents,
    fetchRiskEventById,
    createRiskEvent,
    updateRiskEvent,

    // Workflow Operations
    reviewRiskEvent,
    allocateRiskEvent,
    updateEventStatus,
    createEngagementFromEvent,

    // Related entities
    addTask,
    addMilestone,

    // Queries
    getPendingEvents,
    getSecretaryDirectives,
    getActivityLog,

    // Reference data
    fetchCategories,
    fetchDivisions,
    fetchRisks
  }
}
