'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export function KRATrendChart() {
  const supabase = createClientComponentClient<Database>()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrendData()
  }, [])

  const loadTrendData = async () => {
    try {
      const currentYear = new Date().getFullYear()

      const { data: summary, error } = await supabase
        .from('v_kra_status_summary')
        .select('*')
        .eq('financial_year', currentYear)
        .order('quarter')

      if (error) throw error

      // Group by quarter
      const quarters = [1, 2, 3, 4]
      const trendData = quarters.map(q => {
        const quarterData = (summary || []).filter((s: any) => s.quarter === q)
        const totals = {
          quarter: `Q${q}`,
          completed: quarterData.reduce((sum: number, s: any) => sum + (s.completed || 0), 0),
          ongoing: quarterData.reduce((sum: number, s: any) => sum + (s.ongoing || 0), 0),
          delayed: quarterData.reduce((sum: number, s: any) => sum + (s.delayed || 0), 0),
          notStarted: quarterData.reduce((sum: number, s: any) => sum + (s.not_started || 0), 0),
        }
        return totals
      })

      setData(trendData)
    } catch (error) {
      console.error('Error loading trend data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRA Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  const hasData = data.some(d => d.completed + d.ongoing + d.delayed + d.notStarted > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRA Performance Trend</CardTitle>
          <CardDescription>Activity status by quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No KRA status data available for trend analysis
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KRA Performance Trend</CardTitle>
        <CardDescription>
          Activity completion status by quarter ({new Date().getFullYear()})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#22c55e" name="Completed" />
            <Bar dataKey="ongoing" fill="#3b82f6" name="Ongoing" />
            <Bar dataKey="delayed" fill="#ef4444" name="Delayed" />
            <Bar dataKey="notStarted" fill="#94a3b8" name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
