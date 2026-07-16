'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Obligation {
  id: string
  title: string
  source: string | null
  category: string | null
  description: string | null
  owner_unit_id: string | null
  created_at: string
}

export interface Control {
  id: string
  title: string
  control_type: string | null
  description: string | null
  owner_unit_id: string | null
  obligation_id: string | null
  frequency: string | null
  effectiveness: string | null
  created_at: string
}

export interface OrgUnitLite {
  id: string
  name: string
  code: string | null
}

type Resource = 'obligation' | 'control'

export function useCompliance() {
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [controls, setControls] = useState<Control[]>([])
  const [orgUnits, setOrgUnits] = useState<OrgUnitLite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/compliance', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load compliance data')
      setObligations(json.obligations || [])
      setControls(json.controls || [])
      setOrgUnits(json.orgUnits || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const create = async (resource: Resource, values: Record<string, unknown>) => {
    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, ...values }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error || 'Failed to create' }
    await fetchAll()
    return { data: json.data, error: null }
  }

  const update = async (resource: Resource, id: string, values: Record<string, unknown>) => {
    const res = await fetch('/api/compliance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, id, ...values }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error || 'Failed to update' }
    await fetchAll()
    return { data: json.data, error: null }
  }

  const remove = async (resource: Resource, id: string) => {
    const res = await fetch(`/api/compliance?resource=${resource}&id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) return { error: json.error || 'Failed to delete' }
    await fetchAll()
    return { error: null }
  }

  return { obligations, controls, orgUnits, loading, error, fetchAll, create, update, remove }
}
