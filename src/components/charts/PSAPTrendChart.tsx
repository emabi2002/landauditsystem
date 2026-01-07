'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

interface PSAPTrendChartProps {
  orgUnitId?: string
}

export function PSAPTrendChart({ orgUnitId }: PSAPTrendChartProps) {
  const supabase = createClientComponentClient<Database>()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrendData()
  }, [orgUnitId])

  const loadTrendData = async () => {
    try {
      let query = supabase
        .from('audit_psap_assessments')
        .select(`
          *,
          org_units(name, code)
        `)
        .order('financial_year')
        .order('quarter')

      if (orgUnitId) {
        query = query.eq('org_unit_id', orgUnitId)
      }

      const { data: assessments, error } = await query

      if (error) throw error

      // Group by year-quarter
      const trendData = ((assessments || []) as any[]).map((a: any) => ({
        period: `${a.financial_year} Q${a.quarter}`,
        score: a.overall_score || 0,
        rating: a.overall_rating,
        orgUnit: a.org_units?.name || 'Unknown',
      }))

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
          <CardTitle>PSAP Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PSAP Score Trend</CardTitle>
          <CardDescription>Score progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No assessment data available for trend analysis
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PSAP Score Trend</CardTitle>
        <CardDescription>
          Compliance scores over time (out of 20.0)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Overall Score"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Reference Lines */}
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Full (18-20)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-lime-500" />
            <span>Substantial (15-18)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>Partial (12-15)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Low (9-12)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>Non (0-9)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
