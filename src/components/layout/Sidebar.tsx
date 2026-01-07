'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Shield,
  BarChart3,
  Settings,
  Search,
  Briefcase,
  FolderOpen,
  Activity,
  TrendingUp,
  Target,
  Zap,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onClose?: () => void
}

const navigation = [
  {
    section: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Risk Register', href: '/risk-register', icon: Shield, highlight: true },
      { name: 'Risk Events', href: '/risk-events', icon: Zap, highlight: true },
    ]
  },
  {
    section: 'Audit Workflow',
    items: [
      { name: 'Engagements', href: '/engagements', icon: Briefcase },
      { name: 'Fieldwork', href: '/fieldwork', icon: FolderOpen },
      { name: 'Findings', href: '/findings', icon: AlertTriangle },
      { name: 'Recommendations', href: '/recommendations', icon: CheckCircle },
      { name: 'Action Plans', href: '/action-plans', icon: ClipboardList },
    ]
  },
  {
    section: 'Risk & Governance',
    items: [
      { name: 'Risk Profiles', href: '/risk-profiles', icon: Activity },
      { name: 'PSAP Scorecard', href: '/psap-scorecard', icon: TrendingUp },
      { name: 'KRA & Workplan', href: '/kra-workplan', icon: Target },
    ]
  },
  {
    section: 'Management',
    items: [
      { name: 'Compliance', href: '/compliance', icon: FileText },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Admin', href: '/admin', icon: Settings },
    ]
  }
]

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      {/* Logo */}
      <div className="flex h-14 md:h-16 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold text-sm">
            IA
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">DLPP Audit</h1>
            <p className="text-xs text-slate-500">Compliance System</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-white border-slate-200 h-9 text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 md:space-y-4 px-2 md:px-3 py-2 overflow-y-auto">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {section.section}
            </h3>
            <div className="space-y-0.5 md:space-y-1">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                const isHighlight = item.highlight
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'group flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2 md:py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : isHighlight
                        ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 md:h-5 md:w-5 transition-colors flex-shrink-0',
                        isActive ? 'text-white' : isHighlight ? 'text-red-600' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                    {isHighlight && !isActive && (
                      <span className="ml-auto text-[10px] md:text-xs bg-red-600 text-white px-1 md:px-1.5 py-0.5 rounded flex-shrink-0">CORE</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 md:p-4">
        <div className="text-xs text-slate-500">
          <p className="font-medium">DLPP Internal Audit</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
