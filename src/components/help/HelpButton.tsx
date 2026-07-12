'use client'

import * as React from 'react'
import { HelpCircle, LifeBuoy } from 'lucide-react'
import { useHelp } from './HelpProvider'
import { cn } from '@/lib/utils'

interface HelpButtonProps {
  variant?: 'floating' | 'icon'
  className?: string
}

/**
 * Opens the contextual Help Drawer for the current page.
 * - `floating`: a fixed action button shown on every page.
 * - `icon`: a compact header button.
 */
export function HelpButton({ variant = 'floating', className }: HelpButtonProps) {
  const { openHelp } = useHelp()

  if (variant === 'icon') {
    return (
      <button
        type="button"
        data-tour="help-button"
        onClick={() => openHelp()}
        aria-label="Open help"
        title="Help & Training"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-600',
          className
        )}
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      data-tour="help-button"
      onClick={() => openHelp()}
      aria-label="Open help and training"
      className={cn(
        'group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 py-3 pl-3 pr-4 text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
        className
      )}
    >
      <span className="relative flex items-center justify-center">
        <LifeBuoy className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[80px] group-hover:opacity-100">
        Help
      </span>
    </button>
  )
}
