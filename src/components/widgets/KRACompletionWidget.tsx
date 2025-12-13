'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

export function KRACompletionWidget() {
  const supabase = createClientComponentClient<Database>()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3)

      const { data, error } = await supabase
        .from('v_kra_status_summary')
        .select('*')
        .eq('financial_year', currentYear)
        .eq('quarter', currentQuarter)
        .limit(5)

      if (error) throw error

      // Calculate totals
      if (data && data.length > 0) {
        const totals = {
          total_activities: data.reduce((sum, d) => sum + (d.total_activities || 0), 0),
          completed: data.reduce((sum, d) => sum + (d.completed || 0), 0),
          ongoing: data.reduce((sum, d) => sum + (d.ongoing || 0), 0),
          delayed: data.reduce((sum, d) => sum + (d.delayed || 0), 0),
        }

        setSummary({ items: data, totals, year: currentYear, quarter: currentQuarter })
      }
    } catch (error) {
      console.error('Error loading KRA summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRA Performance</CardTitle>
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
          <CardTitle className="text-sm font-medium">KRA Performance</CardTitle>
          <Target className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">No KRA status data yet</p>
            <Link
              href="/kra-workplan"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Update KRA status
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { totals, year, quarter } = summary
  const completionRate = totals.total_activities > 0
    ? Math.round((totals.completed / totals.total_activities) * 100)
    : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">KRA Performance</CardTitle>
          <CardDescription>{year} Q{quarter} Status</CardDescription>
        </div>
        <Target className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completion Rate */}
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {totals.completed} of {totals.total_activities} activities completed
            </p>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-blue-500">{totals.ongoing}</div>
              <p className="text-xs text-slate-500">Ongoing</p>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{totals.delayed}</div>
              <p className="text-xs text-slate-500">Delayed</p>
            </div>
            <div>
              <div className="text-xl font-bold">{totals.total_activities}</div>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>

          {/* KRAs List */}
          <div className="space-y-2">
            {summary.items.slice(0, 3).map((item: any, idx: number) => {
              const kraCompletion = item.total_activities > 0
                ? Math.round((item.completed / item.total_activities) * 100)
                : 0

              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">KRA {item.kra_code}</p>
                    <p className="text-xs text-slate-500 truncate">{item.kra_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={kraCompletion >= 75 ? 'default' : 'outline'}>
                      {kraCompletion}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          <Link
            href="/kra-workplan"
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            View all KRAs →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
