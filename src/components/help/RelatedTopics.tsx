'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { getArticleById } from '@/help/help-content'
import { resolveIcon } from './icon-map'
import { cn } from '@/lib/utils'

interface RelatedTopicsProps {
  articleIds: string[]
  onSelect: (articleId: string) => void
  title?: string
  className?: string
  variant?: 'list' | 'grid'
}

/** Renders related help articles as clickable rows or a small grid. */
export function RelatedTopics({
  articleIds,
  onSelect,
  title = 'Related topics',
  className,
  variant = 'list',
}: RelatedTopicsProps) {
  const articles = articleIds
    .map((id) => getArticleById(id))
    .filter((a): a is NonNullable<ReturnType<typeof getArticleById>> => Boolean(a))

  if (articles.length === 0) return null

  return (
    <div className={className}>
      {title && (
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h4>
      )}
      <div className={cn(variant === 'grid' ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : 'space-y-1.5')}>
        {articles.map((article) => {
          const Icon = resolveIcon(article.icon)
          return (
            <button
              key={article.id}
              type="button"
              onClick={() => onSelect(article.id)}
              className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{article.title}</span>
                <span className="block truncate text-xs text-slate-500">{article.summary}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-emerald-500" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
