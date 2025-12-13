'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

export function PSAPRatingsWidget() {
  const supabase = createClientComponentClient<Database>()
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRatings()
  }, [])

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('v_latest_psap_ratings')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(5)

      if (error) throw error
      setRatings(data || [])
    } catch (error) {
      console.error('Error loading PSAP ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'Full Compliance': return 'bg-green-500'
      case 'Substantial Compliance': return 'bg-lime-500'
      case 'Partial Compliance': return 'bg-yellow-500'
      case 'Low Compliance': return 'bg-orange-500'
      case 'Non-Compliance': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PSAP Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PSAP Ratings</CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">No PSAP assessments yet</p>
            <Link
              href="/psap-scorecard"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Create your first assessment
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const avgScore = ratings.reduce((sum, r) => sum + (r.overall_score || 0), 0) / ratings.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">PSAP Scorecard</CardTitle>
          <CardDescription>Latest compliance ratings</CardDescription>
        </div>
        <TrendingUp className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Average Score */}
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-3xl font-bold">{avgScore.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">Average Score (out of 20.0)</p>
          </div>

          {/* Recent Ratings */}
          <div className="space-y-2">
            {ratings.slice(0, 4).map((rating, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{rating.org_unit_name}</p>
                  <p className="text-xs text-slate-500">
                    {rating.financial_year} Q{rating.quarter}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{rating.overall_score?.toFixed(1)}</span>
                  <Badge className={getRatingColor(rating.overall_rating)}>
                    {rating.overall_rating?.split(' ')[0]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/psap-scorecard"
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            View all assessments →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
