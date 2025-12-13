'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

export function RiskProfileWidget() {
  const supabase = createClientComponentClient<Database>()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('v_current_risk_summary')
        .select('*')
        .limit(5)

      if (error) throw error

      // Calculate totals
      const totals = {
        total_risks: data?.reduce((sum, d) => sum + (d.total_risks || 0), 0) || 0,
        extreme_risks: data?.reduce((sum, d) => sum + (d.extreme_risks || 0), 0) || 0,
        high_risks: data?.reduce((sum, d) => sum + (d.high_risks || 0), 0) || 0,
        open_risks: data?.reduce((sum, d) => sum + (d.open_risks || 0), 0) || 0,
      }

      setSummary({ items: data, totals })
    } catch (error) {
      console.error('Error loading risk summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary || !summary.items || summary.items.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Profiles</CardTitle>
          <Activity className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">No risk profiles yet</p>
            <Link
              href="/risk-profiles"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Create your first risk profile
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { totals } = summary

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Risk Profiles</CardTitle>
          <CardDescription>Current risk assessment summary</CardDescription>
        </div>
        <Activity className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{totals.total_risks}</div>
              <p className="text-xs text-slate-500">Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{totals.extreme_risks}</div>
              <p className="text-xs text-slate-500">Extreme</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{totals.high_risks}</div>
              <p className="text-xs text-slate-500">High</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{totals.open_risks}</div>
              <p className="text-xs text-slate-500">Open</p>
            </div>
          </div>

          {/* Org Units List */}
          <div className="space-y-2">
            {summary.items.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 truncate">{item.org_unit_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">{item.extreme_risks}</span>
                  <span className="text-orange-500 font-medium">{item.high_risks}</span>
                  <Badge variant="outline" className="text-xs">{item.total_risks} risks</Badge>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/risk-profiles"
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            View all risk profiles →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
