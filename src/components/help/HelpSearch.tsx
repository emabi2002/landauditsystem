'use client'

import * as React from 'react'
import { Search, X, CornerDownLeft } from 'lucide-react'
import { searchArticles, type SearchResult } from '@/help/help-content'
import { resolveIcon } from './icon-map'
import { cn } from '@/lib/utils'

interface HelpSearchProps {
  onSelect: (articleId: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

/**
 * Instant help search. Results filter as you type and are ordered by relevance.
 */
export function HelpSearch({
  onSelect,
  placeholder = 'Search help — engagements, findings, risk, PSAP…',
  autoFocus = false,
  className,
}: HelpSearchProps) {
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const results: SearchResult[] = React.useMemo(() => {
    if (!query.trim()) return []
    return searchArticles(query).slice(0, 8)
  }, [query])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const choose = (articleId: string) => {
    onSelect(articleId)
    setQuery('')
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = results[activeIndex]
      if (chosen) choose(chosen.article.id)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No results for “{query}”. Try a module name like <span className="font-medium">findings</span> or{' '}
              <span className="font-medium">risk</span>.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => {
                const Icon = resolveIcon(result.article.icon)
                return (
                  <li key={result.article.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(result.article.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                        index === activeIndex ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {result.article.title}
                        </span>
                        <span className="block truncate text-xs text-slate-500">{result.article.summary}</span>
                      </span>
                      {index === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
