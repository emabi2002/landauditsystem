'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  ExternalLink,
  Clock,
  Star,
  Compass,
  PlayCircle,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  getArticleById,
  getArticleForRoute,
  getCategoryById,
  getTourForRoute,
  HELP_CATEGORIES,
  getArticlesByCategory,
  type HelpArticle,
} from '@/help/help-content'
import { useHelp } from './HelpProvider'
import { HelpArticleView } from './HelpArticleView'
import { HelpSearch } from './HelpSearch'
import { HelpBreadcrumb } from './HelpBreadcrumb'
import { resolveIcon } from './icon-map'
import { cn } from '@/lib/utils'

export function HelpDrawer() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    drawerOpen,
    closeHelp,
    activeArticleId,
    setActiveArticle,
    favourites,
    recentlyViewed,
    startTour,
  } = useHelp()

  // Resolve the article to display: an explicitly-selected one, else the route.
  const routeArticle = getArticleForRoute(pathname)
  const article: HelpArticle | undefined = activeArticleId
    ? getArticleById(activeArticleId)
    : routeArticle

  const routeTour = getTourForRoute(pathname)
  const category = article ? getCategoryById(article.category) : undefined

  const goToArticle = (id: string) => setActiveArticle(id)

  const openCentre = () => {
    closeHelp()
    router.push('/help')
  }

  const breadcrumb = React.useMemo(() => {
    const items: { label: string; onClick?: () => void }[] = [
      { label: 'Help', onClick: () => setActiveArticle(null) },
    ]
    if (article) {
      if (category) items.push({ label: category.name })
      items.push({ label: article.title })
    } else {
      items.push({ label: 'Overview' })
    }
    return items
  }, [article, category, setActiveArticle])

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeHelp()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-5 pb-3 pt-5">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Help &amp; Training</p>
                <p className="text-[11px] text-slate-500">Contextual guidance for this page</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCentre}
              className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              Help Centre <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-3">
            <HelpBreadcrumb items={breadcrumb} />
          </div>
          <div className="mt-3">
            <HelpSearch onSelect={goToArticle} placeholder="Search all help topics…" />
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {article ? (
            <>
              {/* Contextual banner when viewing the route's own help */}
              {!activeArticleId && routeArticle && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <Compass className="h-3.5 w-3.5" />
                  Showing help for the page you are on.
                </div>
              )}
              <HelpArticleView article={article} onSelectRelated={goToArticle} />
            </>
          ) : (
            <HelpDrawerHome
              onSelect={goToArticle}
              onStartTour={routeTour ? () => startTour(routeTour.id) : undefined}
              routeTourName={routeTour?.name}
              favourites={favourites}
              recentlyViewed={recentlyViewed}
            />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={openCentre}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <BookOpen className="h-4 w-4" /> Open the full Help Centre
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Home view shown in the drawer when the route has no dedicated article. */
function HelpDrawerHome({
  onSelect,
  onStartTour,
  routeTourName,
  favourites,
  recentlyViewed,
}: {
  onSelect: (id: string) => void
  onStartTour?: () => void
  routeTourName?: string
  favourites: string[]
  recentlyViewed: string[]
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">How can we help?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Search above, start a guided tour, or browse the modules below.
        </p>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Take the {routeTourName} tour
          </button>
        )}
      </div>

      {recentlyViewed.length > 0 && (
        <QuickList
          title="Recently viewed"
          icon={Clock}
          ids={recentlyViewed.slice(0, 4)}
          onSelect={onSelect}
        />
      )}

      {favourites.length > 0 && (
        <QuickList title="Your favourites" icon={Star} ids={favourites.slice(0, 4)} onSelect={onSelect} />
      )}

      {/* Categories */}
      <div className="space-y-4">
        {HELP_CATEGORIES.map((cat) => {
          const articles = getArticlesByCategory(cat.id)
          if (articles.length === 0) return null
          const CatIcon = resolveIcon(cat.icon)
          return (
            <div key={cat.id}>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CatIcon className="h-3.5 w-3.5" /> {cat.name}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {articles.map((a) => {
                  const Icon = resolveIcon(a.icon)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelect(a.id)}
                      className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                        {a.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuickList({
  title,
  icon: Icon,
  ids,
  onSelect,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  ids: string[]
  onSelect: (id: string) => void
}) {
  const articles = ids.map((id) => getArticleById(id)).filter(Boolean) as HelpArticle[]
  if (articles.length === 0) return null
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {articles.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={cn(
              'rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700'
            )}
          >
            {a.title}
          </button>
        ))}
      </div>
    </div>
  )
}
