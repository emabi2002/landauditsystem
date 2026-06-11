'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import {
  Search,
  Shield,
  Zap,
  Briefcase,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ResultType = 'risk' | 'event' | 'engagement' | 'finding'

interface SearchResult {
  id: string
  type: ResultType
  code: string
  title: string
  href: string
}

const typeConfig: Record<
  ResultType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  risk: { icon: Shield, label: 'Risk', color: 'text-emerald-600 bg-emerald-50' },
  event: { icon: Zap, label: 'Risk Event', color: 'text-amber-600 bg-amber-50' },
  engagement: { icon: Briefcase, label: 'Engagement', color: 'text-blue-600 bg-blue-50' },
  finding: { icon: AlertTriangle, label: 'Finding', color: 'text-red-600 bg-red-50' },
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => performSearch(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    const term = `%${query}%`
    const all: SearchResult[] = []

    // Risk Register
    try {
      const { data } = await supabase
        .from('audit_risk_register')
        .select('id, risk_code, risk_title')
        .or(`risk_code.ilike.${term},risk_title.ilike.${term}`)
        .limit(5)
      for (const r of data ?? []) {
        all.push({
          id: r.id,
          type: 'risk',
          code: r.risk_code || 'RISK',
          title: r.risk_title || 'Untitled Risk',
          href: '/risk-register',
        })
      }
    } catch {
      /* table may be restricted */
    }

    // Risk Events
    try {
      const { data } = await supabase
        .from('audit_risk_events')
        .select('id, event_code, event_title')
        .or(`event_code.ilike.${term},event_title.ilike.${term}`)
        .limit(5)
      for (const e of data ?? []) {
        all.push({
          id: e.id,
          type: 'event',
          code: e.event_code || 'EVENT',
          title: e.event_title || 'Untitled Event',
          href: '/risk-events',
        })
      }
    } catch {
      /* ignore */
    }

    // Engagements (real columns: id, title — no engagement_number/engagement_title)
    try {
      const { data } = await supabase
        .from('audit_engagements')
        .select('id, title')
        .ilike('title', term)
        .limit(5)
      for (const g of data ?? []) {
        all.push({
          id: g.id,
          type: 'engagement',
          code: `ENG-${String(g.id).slice(0, 8)}`,
          title: g.title || 'Untitled Engagement',
          href: '/engagements',
        })
      }
    } catch {
      /* ignore */
    }

    // Findings (real columns: id, title — no finding_number/finding_title)
    try {
      const { data } = await supabase
        .from('audit_findings')
        .select('id, title')
        .ilike('title', term)
        .limit(5)
      for (const f of data ?? []) {
        all.push({
          id: f.id,
          type: 'finding',
          code: `FND-${String(f.id).slice(0, 8)}`,
          title: f.title || 'Untitled Finding',
          href: '/findings',
        })
      }
    } catch {
      /* ignore */
    }

    setResults(all)
    setIsOpen(true)
    setLoading(false)
  }

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    router.push(result.href)
  }

  return (
    <div ref={searchRef} className="relative w-48 lg:w-72">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder="Search risks, events, audits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        className="pl-9 pr-8 h-9 bg-slate-50 border-slate-200"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
      )}
      {!loading && query && (
        <button
          onClick={() => {
            setQuery('')
            setResults([])
            setIsOpen(false)
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => {
                const config = typeConfig[result.type]
                const Icon = config.icon
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{result.code}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {config.label}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-slate-900">{result.title}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
