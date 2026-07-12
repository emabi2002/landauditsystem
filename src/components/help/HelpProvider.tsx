'use client'

import * as React from 'react'
import { NEW_USER_TOUR_ID } from '@/help/help-content'

interface HelpContextValue {
  // Drawer
  drawerOpen: boolean
  /** Article id shown in the drawer; null means "use current route". */
  activeArticleId: string | null
  openHelp: (articleId?: string) => void
  closeHelp: () => void
  setActiveArticle: (articleId: string | null) => void

  // Favourites
  favourites: string[]
  toggleFavourite: (articleId: string) => void
  isFavourite: (articleId: string) => boolean

  // Recently viewed
  recentlyViewed: string[]
  addRecent: (articleId: string) => void

  // Feedback
  helpfulVotes: Record<string, 'up' | 'down'>
  voteHelpful: (articleId: string, vote: 'up' | 'down') => void

  // Guided tours
  activeTourId: string | null
  startTour: (tourId: string) => void
  stopTour: () => void

  // First-run onboarding
  hasSeenWelcome: boolean
  dismissWelcome: () => void
}

const HelpContext = React.createContext<HelpContextValue | undefined>(undefined)

const LS_FAVOURITES = 'dlpp.help.favourites'
const LS_RECENT = 'dlpp.help.recent'
const LS_VOTES = 'dlpp.help.votes'
const LS_WELCOME = 'dlpp.help.welcomeSeen'
const RECENT_LIMIT = 8

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [activeArticleId, setActiveArticleId] = React.useState<string | null>(null)
  const [favourites, setFavourites] = React.useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = React.useState<string[]>([])
  const [helpfulVotes, setHelpfulVotes] = React.useState<Record<string, 'up' | 'down'>>({})
  const [activeTourId, setActiveTourId] = React.useState<string | null>(null)
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(true)

  // Hydrate from localStorage once on mount.
  React.useEffect(() => {
    setFavourites(readLS<string[]>(LS_FAVOURITES, []))
    setRecentlyViewed(readLS<string[]>(LS_RECENT, []))
    setHelpfulVotes(readLS<Record<string, 'up' | 'down'>>(LS_VOTES, {}))
    setHasSeenWelcome(readLS<boolean>(LS_WELCOME, false))
  }, [])

  const openHelp = React.useCallback((articleId?: string) => {
    setActiveArticleId(articleId ?? null)
    setDrawerOpen(true)
  }, [])

  const closeHelp = React.useCallback(() => setDrawerOpen(false), [])

  const setActiveArticle = React.useCallback((articleId: string | null) => {
    setActiveArticleId(articleId)
  }, [])

  const toggleFavourite = React.useCallback((articleId: string) => {
    setFavourites((prev) => {
      const next = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
      writeLS(LS_FAVOURITES, next)
      return next
    })
  }, [])

  const isFavourite = React.useCallback(
    (articleId: string) => favourites.includes(articleId),
    [favourites]
  )

  const addRecent = React.useCallback((articleId: string) => {
    setRecentlyViewed((prev) => {
      const next = [articleId, ...prev.filter((id) => id !== articleId)].slice(0, RECENT_LIMIT)
      writeLS(LS_RECENT, next)
      return next
    })
  }, [])

  const voteHelpful = React.useCallback((articleId: string, vote: 'up' | 'down') => {
    setHelpfulVotes((prev) => {
      const next = { ...prev, [articleId]: vote }
      writeLS(LS_VOTES, next)
      return next
    })
  }, [])

  const startTour = React.useCallback((tourId: string) => {
    // Close the drawer so the tour spotlight is unobstructed.
    setDrawerOpen(false)
    // Delay lets the drawer finish closing before the tour mounts.
    setActiveTourId(null)
    window.setTimeout(() => setActiveTourId(tourId), 250)
  }, [])

  const stopTour = React.useCallback(() => setActiveTourId(null), [])

  const dismissWelcome = React.useCallback(() => {
    setHasSeenWelcome(true)
    writeLS(LS_WELCOME, true)
  }, [])

  const value = React.useMemo<HelpContextValue>(
    () => ({
      drawerOpen,
      activeArticleId,
      openHelp,
      closeHelp,
      setActiveArticle,
      favourites,
      toggleFavourite,
      isFavourite,
      recentlyViewed,
      addRecent,
      helpfulVotes,
      voteHelpful,
      activeTourId,
      startTour,
      stopTour,
      hasSeenWelcome,
      dismissWelcome,
    }),
    [
      drawerOpen,
      activeArticleId,
      openHelp,
      closeHelp,
      setActiveArticle,
      favourites,
      toggleFavourite,
      isFavourite,
      recentlyViewed,
      addRecent,
      helpfulVotes,
      voteHelpful,
      activeTourId,
      startTour,
      stopTour,
      hasSeenWelcome,
      dismissWelcome,
    ]
  )

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
}

export function useHelp(): HelpContextValue {
  const ctx = React.useContext(HelpContext)
  if (!ctx) throw new Error('useHelp must be used within a HelpProvider')
  return ctx
}

export { NEW_USER_TOUR_ID }
