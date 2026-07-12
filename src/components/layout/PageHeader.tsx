import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  actions?: ReactNode
  backHref?: string
}

/**
 * Unified page header bar shared across all pages.
 * Mirrors the landcasesystem design language: a sticky white bar with an
 * icon, a vertical divider, a title (text-xl font-semibold) and an optional
 * subtitle (text-xs), all constrained to a centered max-w-7xl container.
 */
export function PageHeader({ icon: Icon, title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <div data-tour="page-header" className="sticky top-16 z-20 bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Icon className="h-5 w-5 text-slate-600 shrink-0" />
          <div className="h-6 w-px bg-slate-300 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div data-tour="page-actions" className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

/**
 * Standard centered content container used by every page beneath the
 * PageHeader. Matches landcasesystem's `max-w-7xl mx-auto px-6 py-6`.
 */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
}
