'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../database.types'

type PSAPStandard = Database['public']['Tables']['audit_psap_standards']['Row']
type PSAPAssessment = Database['public']['Tables']['audit_psap_assessments']['Row']
type PSAPAssessmentInsert = Database['public']['Tables']['audit_psap_assessments']['Insert']
type PSAPAssessmentScore = Database['public']['Tables']['audit_psap_assessment_scores']['Row']
type PSAPAssessmentScoreInsert = Database['public']['Tables']['audit_psap_assessment_scores']['Insert']
type PSAPRatingScale = Database['public']['Tables']['audit_psap_rating_scales']['Row']

export function usePSAPAssessments() {
  const [standards, setStandards] = useState<PSAPStandard[]>([])
  const [ratingScales, setRatingScales] = useState<PSAPRatingScale[]>([])
  const [assessments, setAssessments] = useState<PSAPAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_psap_standards')
        .select('*')
        .order('standard_number', { ascending: true })

      if (error) throw error
      setStandards(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch PSAP standards'
      }
    }
  }

  const fetchRatingScales = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_psap_rating_scales')
        .select('*')
        .order('min_score', { ascending: false })

      if (error) throw error
      setRatingScales(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch rating scales'
      }
    }
  }

  const fetchAssessments = async (orgUnitId?: string, year?: number, quarter?: number) => {
    try {
      setLoading(true)
      let query = supabase
        .from('audit_psap_assessments')
        .select(`
          *,
          org_units(name, code),
          completed_by_person:people!audit_psap_assessments_completed_by_fkey(full_name),
          reviewed_by_person:people!audit_psap_assessments_reviewed_by_fkey(full_name)
        `)
        .order('financial_year', { ascending: false })
        .order('quarter', { ascending: false })

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
      setAssessments(data || [])
      return { data: data || [], error: null }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessments')
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch assessments'
      }
    } finally {
      setLoading(false)
    }
  }

  const createAssessment = async (
    assessment: PSAPAssessmentInsert,
    scores: { psap_standard_id: string; raw_score: number; comments?: string }[]
  ) => {
    try {
      // Create assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('audit_psap_assessments')
        .insert(assessment)
        .select()
        .single()

      if (assessmentError) throw assessmentError

      // Create scores
      const scoreInserts: PSAPAssessmentScoreInsert[] = scores.map(score => ({
        psap_assessment_id: assessmentData.id,
        ...score
      }))

      const { error: scoresError } = await supabase
        .from('audit_psap_assessment_scores')
        .insert(scoreInserts)

      if (scoresError) throw scoresError

      // Fetch the updated assessment with calculated totals
      const { data: updatedAssessment, error: fetchError } = await supabase
        .from('audit_psap_assessments')
        .select('*')
        .eq('id', assessmentData.id)
        .single()

      if (fetchError) throw fetchError

      return { data: updatedAssessment, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create assessment'
      }
    }
  }

  const updateAssessment = async (id: string, updates: Partial<PSAPAssessment>) => {
    try {
      const { data, error } = await supabase
        .from('audit_psap_assessments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update assessment'
      }
    }
  }

  const fetchAssessmentScores = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('audit_psap_assessment_scores')
        .select(`
          *,
          audit_psap_standards(standard_number, title, description, weight)
        `)
        .eq('psap_assessment_id', assessmentId)
        .order('audit_psap_standards(standard_number)', { ascending: true })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to fetch assessment scores'
      }
    }
  }

  const updateScore = async (scoreId: string, rawScore: number, comments?: string) => {
    try {
      const { data, error } = await supabase
        .from('audit_psap_assessment_scores')
        .update({
          raw_score: rawScore,
          comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', scoreId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update score'
      }
    }
  }

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audit_psap_assessments')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to delete assessment'
      }
    }
  }

  const getRatingForScore = (score: number): PSAPRatingScale | undefined => {
    return ratingScales.find(scale =>
      score >= scale.min_score && score <= scale.max_score
    )
  }

  useEffect(() => {
    fetchStandards()
    fetchRatingScales()
    fetchAssessments()
  }, [])

  return {
    standards,
    ratingScales,
    assessments,
    loading,
    error,
    fetchStandards,
    fetchRatingScales,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    fetchAssessmentScores,
    updateScore,
    deleteAssessment,
    getRatingForScore
  }
}
