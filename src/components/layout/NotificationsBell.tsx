'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  kind: 'event' | 'overdue'
  code: string
  title: string
  meta: string
  severity: 'critical' | 'high' | 'normal'
  href: string
}

const severityDot: Record<Notification['severity'], string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  normal: 'bg-blue-500',
}

export function NotificationsBell() {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    // Refresh every 60s so the bell stays current
    const interval = setInterval(loadNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    const collected: Notification[] = []

    // 1) Pending Risk Events awaiting Audit Manager action
    try {
      const { data } = await supabase
        .from('audit_risk_events')
        .select('id, event_code, event_title, priority, event_status')
        .in('event_status', ['Pending', 'Under Review'])
        .order('priority', { ascending: true })
        .limit(8)

      for (const e of data ?? []) {
        const sev: Notification['severity'] =
          e.priority === 'Critical' ? 'critical' : e.priority === 'High' ? 'high' : 'normal'
        collected.push({
          id: `event-${e.id}`,
          kind: 'event',
          code: e.event_code || 'EVENT',
          title: e.event_title || 'Untitled event',
          meta: `${e.priority} • ${e.event_status}`,
          severity: sev,
          href: '/risk-events',
        })
      }
    } catch {
      /* table may be restricted */
    }

    // 2) Overdue actions (recommendations past target date, not yet implemented)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('audit_recommendations')
        .select('id, recommendation_text, target_date, status, priority')
        .lt('target_date', today)
        .not('status', 'in', '("Implemented","Closed")')
        .order('target_date', { ascending: true })
        .limit(8)

      for (const r of data ?? []) {
        collected.push({
          id: `rec-${r.id}`,
          kind: 'overdue',
          code: `REC-${String(r.id).slice(0, 8)}`,
          title: r.recommendation_text || 'Recommendation',
          meta: `Due ${r.target_date} • ${r.status}`,
          severity: r.priority === 'High' ? 'high' : 'critical',
          href: '/recommendations',
        })
      }
    } catch {
      /* ignore */
    }

    setItems(collected)
    setLoading(false)
  }

  const count = items.length
  const go = (href: string) => router.push(href)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 hover:text-slate-900"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </span>
          {count > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {count} require action
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : count === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
            <p className="text-sm font-medium text-slate-700">All caught up</p>
            <p className="text-xs text-slate-400">No pending events or overdue actions</p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto py-1">
            {items.map((n) => {
              const Icon = n.kind === 'event' ? Zap : Clock
              return (
                <button
                  key={n.id}
                  onClick={() => go(n.href)}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="relative mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                    <span
                      className={cn(
                        'absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
                        severityDot[n.severity]
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-500">{n.code}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {n.kind === 'event' ? 'Risk Event' : 'Overdue'}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-slate-900">
                      {n.title}
                    </span>
                    <span className="block text-xs text-slate-400">{n.meta}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <DropdownMenuSeparator />
        <button
          onClick={() => go('/risk-events')}
          className="flex w-full items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          View all risk events
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
