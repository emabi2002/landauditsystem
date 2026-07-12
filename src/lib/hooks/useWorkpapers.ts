import { useState, useEffect, useCallback } from 'react'

export interface WorkpaperEvidence {
  id: string
  workpaper_id: string
  file_name: string
  file_path: string
  description: string | null
  uploaded_by: string | null
  created_at: string
}

/**
 * View model exposed to the UI. The underlying `audit_workpapers` table stores
 * the rich fields in `metadata` (jsonb) plus the real `procedure` / `sample_ref`
 * columns; this shape flattens all of that for the components.
 */
export interface WorkpaperWithEngagement {
  id: string
  engagement_id: string
  wp_number: string | null
  title: string
  test_objective: string | null
  procedure_performed: string | null
  sample_population: string | null
  result: string | null
  conclusion: string | null
  conclusion_rating: string
  status: string
  prepared_by: string | null
  created_at: string
  updated_at: string
  audit_engagements?: {
    title: string
    engagement_number?: string | null
  } | null
  evidence: WorkpaperEvidence[]
}

export interface WorkpaperStats {
  total: number
  draft: number
  inReview: number
  completed: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): WorkpaperWithEngagement {
  const m = (row?.metadata as Record<string, unknown>) || {}
  return {
    id: row.id,
    engagement_id: row.engagement_id,
    wp_number: (m.wp_number as string) ?? null,
    title: row.title,
    test_objective: (m.test_objective as string) ?? null,
    procedure_performed: row.procedure ?? null,
    sample_population: row.sample_ref ?? null,
    result: (m.result as string) ?? null,
    conclusion: (m.conclusion as string) ?? null,
    conclusion_rating: (m.conclusion_rating as string) ?? 'Not Concluded',
    status: (m.status as string) ?? 'Draft',
    prepared_by: (m.prepared_by as string) ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    audit_engagements: row.audit_engagements ?? null,
    evidence: ((m.evidence as WorkpaperEvidence[]) ?? []).map((e) => ({
      ...e,
      workpaper_id: e.workpaper_id ?? row.id,
    })),
  }
}

export function useWorkpapers() {
  const [workpapers, setWorkpapers] = useState<WorkpaperWithEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkpapers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Read via the service-role API route so rows are visible regardless of
      // the table's RLS (the browser session lives in localStorage, not cookies).
      const res = await fetch('/api/workpapers')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load workpapers')
      setWorkpapers((json.data || []).map(mapRow))
    } catch (err: unknown) {
      setWorkpapers([])
      setError(err instanceof Error ? err.message : 'Failed to load workpapers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkpapers()
  }, [fetchWorkpapers])

  const createWorkpaper = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/workpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create workpaper')
      const vm = mapRow(json.data)
      setWorkpapers((prev) => [vm, ...prev])
      return { data: vm, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateWorkpaper = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/workpapers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update workpaper')
      const vm = mapRow(json.data)
      setWorkpapers((prev) => prev.map((w) => (w.id === id ? vm : w)))
      return { data: vm, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteWorkpaper = async (id: string) => {
    try {
      const res = await fetch(`/api/workpapers?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to delete workpaper')
      setWorkpapers((prev) => prev.filter((w) => w.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // --- Evidence -----------------------------------------------------------

  const fetchEvidence = async (workpaperId: string) => {
    try {
      const res = await fetch(
        `/api/workpapers/evidence?workpaperId=${encodeURIComponent(workpaperId)}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load evidence')
      return { data: (json.data as WorkpaperEvidence[]) || [], error: null }
    } catch (err) {
      return { data: [] as WorkpaperEvidence[], error: err as Error }
    }
  }

  const uploadEvidence = async (workpaperId: string, file: File, description?: string) => {
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('workpaperId', workpaperId)
      if (description) form.append('description', description)
      const res = await fetch('/api/workpapers/evidence', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      return { data: json.data as WorkpaperEvidence, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const getEvidenceUrl = async (filePath: string) => {
    try {
      const res = await fetch(`/api/workpapers/evidence?path=${encodeURIComponent(filePath)}`)
      const json = await res.json()
      return (json.url as string) ?? null
    } catch {
      return null
    }
  }

  const deleteEvidence = async (evidence: WorkpaperEvidence) => {
    try {
      const res = await fetch('/api/workpapers/evidence', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workpaperId: evidence.workpaper_id,
          evidenceId: evidence.id,
          filePath: evidence.file_path,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to delete evidence')
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const stats: WorkpaperStats = {
    total: workpapers.length,
    draft: workpapers.filter((w) => w.status === 'Draft').length,
    inReview: workpapers.filter((w) => w.status === 'In Review').length,
    completed: workpapers.filter((w) => w.status === 'Completed').length,
  }

  return {
    workpapers,
    loading,
    error,
    stats,
    fetchWorkpapers,
    createWorkpaper,
    updateWorkpaper,
    deleteWorkpaper,
    fetchEvidence,
    uploadEvidence,
    getEvidenceUrl,
    deleteEvidence,
  }
}
