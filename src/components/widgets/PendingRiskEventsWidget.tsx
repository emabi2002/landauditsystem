'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Clock,
  AlertTriangle,
  FileWarning,
  Calendar,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

interface PendingEvent {
  id: string
  event_code: string
  event_title: string
  source_type: 'AAAP' | 'Secretary' | 'External' | 'Internal'
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  event_status: string
  is_priority_override: boolean
  created_at: string
  audit_risk_register?: {
    risk_code: string
    risk_title: string
    residual_risk_rating: string
  } | null
}

const priorityColors = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-green-500 text-white',
}

const sourceIcons = {
  AAAP: Calendar,
  Secretary: FileWarning,
  External: Building2,
  Internal: Users,
}

export function PendingRiskEventsWidget() {
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    approved: 0,
    secretaryDirectives: 0,
  })

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_risk_events')
        .select(`
          id,
          event_code,
          event_title,
          source_type,
          priority,
          event_status,
          is_priority_override,
          created_at,
          audit_risk_register:primary_risk_id(risk_code, risk_title, residual_risk_rating)
        `)
        .in('event_status', ['Pending', 'Under Review', 'Approved'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(5)

      if (!error && data) {
        setEvents(data as unknown as PendingEvent[])
      }

      const { data: allEvents } = await supabase
        .from('audit_risk_events')
        .select('event_status, source_type')

      if (allEvents) {
        const events = allEvents as { event_status: string; source_type: string }[]
        const pending = events.filter(e => e.event_status === 'Pending').length
        const underReview = events.filter(e => e.event_status === 'Under Review').length
        const approved = events.filter(e => e.event_status === 'Approved').length
        const secretaryDirectives = events.filter(e => e.source_type === 'Secretary').length
        setStats({ pending, underReview, approved, secretaryDirectives })
      }
    } catch (err) {
      console.error('Error fetching pending events:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalActionRequired = stats.pending + stats.underReview + stats.approved

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Risk Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Risk Events
          </CardTitle>
          {totalActionRequired > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalActionRequired} Action Required
            </Badge>
          )}
        </div>
        <CardDescription>Pending Audit Manager review</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-700">{stats.pending}</div>
            <div className="text-xs text-amber-600">Pending</div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">{stats.underReview}</div>
            <div className="text-xs text-blue-600">Review</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-700">{stats.approved}</div>
            <div className="text-xs text-emerald-600">Approved</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-700">{stats.secretaryDirectives}</div>
            <div className="text-xs text-red-600">Secretary</div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No pending events</p>
            <p className="text-xs text-slate-400 mt-1">All events have been processed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const SourceIcon = sourceIcons[event.source_type]
              return (
                <Link
                  key={event.id}
                  href="/risk-events"
                  className="block p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${event.source_type === 'Secretary' ? 'bg-red-100' : 'bg-slate-100'}`}>
                      <SourceIcon className={`h-4 w-4 ${event.source_type === 'Secretary' ? 'text-red-600' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{event.event_code}</span>
                        <Badge className={`text-xs ${priorityColors[event.priority]}`}>
                          {event.priority}
                        </Badge>
                        {event.is_priority_override && (
                          <Badge variant="destructive" className="text-xs">
                            Override
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate mt-1">
                        {event.event_title}
                      </p>
                      {event.audit_risk_register && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {event.audit_risk_register.risk_code}: {event.audit_risk_register.risk_title}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${
                        event.event_status === 'Pending' ? 'border-amber-300 text-amber-700' :
                        event.event_status === 'Under Review' ? 'border-blue-300 text-blue-700' :
                        'border-emerald-300 text-emerald-700'
                      }`}
                    >
                      {event.event_status}
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <Link href="/risk-events">
          <Button variant="outline" className="w-full">
            View All Risk Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
