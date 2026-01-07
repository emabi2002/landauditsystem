import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Finding = Database['public']['Tables']['audit_findings']['Row']
type FindingInsert = Database['public']['Tables']['audit_findings']['Insert']

export function useFindings() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchFindings()
  }, [])

  const fetchFindings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audit_findings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFindings(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createFinding = async (finding: FindingInsert) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('audit_findings')
        .insert(finding as any)
        .select()
        .single()

      if (error) throw error
      setFindings([data, ...findings])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateFinding = async (id: string, updates: Partial<Finding>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('audit_findings')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setFindings(findings.map(f => f.id === id ? data : f))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteFinding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audit_findings')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFindings(findings.filter(f => f.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    findings,
    loading,
    error,
    refresh: fetchFindings,
    createFinding,
    updateFinding,
    deleteFinding,
  }
}
