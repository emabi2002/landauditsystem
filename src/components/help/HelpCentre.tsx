'use client'

import * as React from 'react'
import {
  ArrowLeft,
  Sparkles,
  Printer,
  Clock,
  Star,
  PlayCircle,
  LayoutGrid,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_ROLES,
  GUIDED_TOURS,
  QUICK_START_GUIDE,
  NEW_USER_TOUR_ID,
  searchArticles,
  getArticleById,
  getCategoryById,
  type HelpArticle,
  type HelpCategoryId,
  type HelpRoleId,
} from '@/help/help-content'
import { useHelp } from './HelpProvider'
import { HelpArticleView } from './HelpArticleView'
import { HelpSearch } from './HelpSearch'
import { HelpBreadcrumb } from './HelpBreadcrumb'
import { resolveIcon } from './icon-map'
import { printFullGuide } from './print'
import { cn } from '@/lib/utils'

export function HelpCentre() {
  const { recentlyViewed, favourites, startTour, isFavourite, toggleFavourite } = useHelp()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<HelpCategoryId | 'all'>('all')
  const [role, setRole] = React.useState<HelpRoleId | 'all'>('all')

  const selected = selectedId ? getArticleById(selectedId) : undefined

  const filtered: HelpArticle[] = React.useMemo(() => {
    let list: HelpArticle[]
    if (query.trim()) {
      list = searchArticles(query).map((r) => r.article)
    } else {
      list = [...HELP_ARTICLES]
    }
    if (category !== 'all') list = list.filter((a) => a.category === category)
    if (role !== 'all') list = list.filter((a) => a.roles.includes(role))
    return list
  }, [query, category, role])

  // ---- Article detail view -------------------------------------------------
  if (selected) {
    const cat = getCategoryById(selected.category)
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Help Centre
        </button>
        <div className="mb-4">
          <HelpBreadcrumb
            items={[
              { label: 'Help Centre', onClick: () => setSelectedId(null) },
              { label: cat?.name ?? 'Article' },
              { label: selected.title },
            ]}
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <HelpArticleView article={selected} onSelectRelated={(id) => setSelectedId(id)} />
        </div>
      </div>
    )
  }

  // ---- Browse view ---------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 text-white shadow-lg">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px, 60px 60px',
          }}
        />
        <div className="relative max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <BookOpen className="h-3.5 w-3.5" /> Help &amp; Training Centre
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">How can we help you today?</h1>
          <p className="mt-1.5 text-sm text-slate-300">
            Complete training for every module of the DLPP Internal Audit &amp; Compliance System —
            searchable guides, guided tours and best practice.
          </p>
          <div className="mt-5">
            <HelpSearch onSelect={(id) => setSelectedId(id)} placeholder="Search help — e.g. findings, PSAP, evidence, risk…" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startTour(NEW_USER_TOUR_ID)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              <Sparkles className="h-4 w-4" /> New User Tour
            </button>
            <button
              type="button"
              onClick={() => printFullGuide()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Printer className="h-4 w-4" /> Printable User Guide
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <section>
        <SectionHeading icon={Sparkles} title="Quick Start Guide" subtitle="Six steps to get productive fast" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START_GUIDE.map((item, i) => {
            const Icon = resolveIcon(item.icon)
            return (
              <button
                key={item.articleId}
                type="button"
                onClick={() => setSelectedId(item.articleId)}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:shadow-sm"
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                  <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recently viewed & Favourites */}
      {(recentlyViewed.length > 0 || favourites.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {recentlyViewed.length > 0 && (
            <ChipList
              icon={Clock}
              title="Recently viewed"
              ids={recentlyViewed}
              onSelect={setSelectedId}
            />
          )}
          {favourites.length > 0 && (
            <ChipList icon={Star} title="Your favourites" ids={favourites} onSelect={setSelectedId} />
          )}
        </div>
      )}

      {/* Browse all */}
      <section>
        <SectionHeading icon={LayoutGrid} title="Browse all topics" subtitle={`${HELP_ARTICLES.length} training articles`} />

        {/* Category filter */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </FilterPill>
          {HELP_CATEGORIES.map((cat) => (
            <FilterPill key={cat.id} active={category === cat.id} onClick={() => setCategory(cat.id)}>
              {cat.name}
            </FilterPill>
          ))}
        </div>

        {/* Role filter */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400">Role:</span>
          <FilterPill active={role === 'all'} onClick={() => setRole('all')} size="sm">
            Everyone
          </FilterPill>
          {HELP_ROLES.map((r) => (
            <FilterPill key={r.id} active={role === r.id} onClick={() => setRole(r.id)} size="sm">
              {r.name}
            </FilterPill>
          ))}
        </div>

        {/* Inline search that filters the grid */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter the list…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No topics match your filters. Try “All” and “Everyone”, or clear the search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onOpen={() => setSelectedId(article.id)}
                favourite={isFavourite(article.id)}
                onToggleFavourite={() => toggleFavourite(article.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Guided tours */}
      <section>
        <SectionHeading icon={PlayCircle} title="Guided tours" subtitle="Interactive, step-by-step walkthroughs" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDED_TOURS.map((tour) => {
            const Icon = resolveIcon(tour.icon)
            return (
              <div
                key={tour.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{tour.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{tour.description}</p>
                  <button
                    type="button"
                    onClick={() => startTour(tour.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> Start tour
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Roles reference */}
      <section>
        <SectionHeading icon={LayoutGrid} title="Help by role" subtitle="What each role is responsible for" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {HELP_ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole((prev) => (prev === r.id ? 'all' : r.id))}
              className={cn(
                'rounded-xl border bg-white p-4 text-left transition-all hover:shadow-sm',
                role === r.id ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', r.color)}>
                  {r.name}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{r.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// --- Sub-components ----------------------------------------------------------

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-emerald-600" />
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
  size = 'md',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  size?: 'sm' | 'md'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border font-medium transition-colors',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        active
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
      )}
    >
      {children}
    </button>
  )
}

function ArticleCard({
  article,
  onOpen,
  favourite,
  onToggleFavourite,
}: {
  article: HelpArticle
  onOpen: () => void
  favourite: boolean
  onToggleFavourite: () => void
}) {
  const Icon = resolveIcon(article.icon)
  const cat = getCategoryById(article.category)
  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavourite()
        }}
        aria-label={favourite ? 'Remove favourite' : 'Add favourite'}
        className="absolute right-3 top-3 text-slate-300 transition-colors hover:text-amber-400"
      >
        <Star className={cn('h-4 w-4', favourite && 'fill-amber-400 text-amber-400')} />
      </button>
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </span>
        <span className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {cat?.name}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" /> {article.estimatedReadMinutes}m
          </span>
        </span>
        <span className="mt-1 block text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
          {article.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-500">
          {article.summary}
        </span>
      </button>
    </div>
  )
}

function ChipList({
  icon: Icon,
  title,
  ids,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  ids: string[]
  onSelect: (id: string) => void
}) {
  const articles = ids.map((id) => getArticleById(id)).filter(Boolean) as HelpArticle[]
  if (articles.length === 0) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-emerald-600" /> {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {articles.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
          >
            {a.title}
          </button>
        ))}
      </div>
    </div>
  )
}
