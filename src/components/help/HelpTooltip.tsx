'use client'

import * as React from 'react'
import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getTooltip } from '@/help/help-content'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  /** Direct help text. Takes precedence over `tooltipKey`. */
  content?: string
  /** Key into the shared HELP_TOOLTIPS map. */
  tooltipKey?: string
  /** Optional label rendered above the help text. */
  label?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  iconClassName?: string
}

/**
 * A small "?" icon that reveals contextual guidance for a field or button.
 * Works on click/tap (accessible on touch devices) and keyboard focus.
 */
export function HelpTooltip({
  content,
  tooltipKey,
  label,
  side = 'top',
  className,
  iconClassName,
}: HelpTooltipProps) {
  const text = content ?? (tooltipKey ? getTooltip(tooltipKey) : undefined)
  if (!text) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label ? `Help: ${label}` : 'Help'}
          className={cn(
            'inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
            className
          )}
        >
          <HelpCircle className={cn('h-4 w-4', iconClassName)} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-64 p-3 text-sm">
        {label && <p className="mb-1 font-semibold text-slate-900">{label}</p>}
        <p className="leading-relaxed text-slate-600">{text}</p>
      </PopoverContent>
    </Popover>
  )
}
