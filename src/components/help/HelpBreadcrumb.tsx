'use client'

import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface HelpBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/** Compact breadcrumb used inside the Help Drawer and Help Centre. */
export function HelpBreadcrumb({ items, className }: HelpBreadcrumbProps) {
  return (
    <nav aria-label="Help breadcrumb" className={cn('flex flex-wrap items-center gap-1 text-xs', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="rounded font-medium text-slate-500 transition-colors hover:text-emerald-600"
              >
                {item.label}
              </button>
            ) : (
              <span className={cn(isLast ? 'font-semibold text-slate-800' : 'text-slate-500')}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
