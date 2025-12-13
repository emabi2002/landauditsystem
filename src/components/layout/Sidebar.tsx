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
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const navigation = [
  {
    section: 'Audit Workflow',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
      { name: 'Compliance', href: '/compliance', icon: Shield },
      { name: 'Risk Register', href: '/risk-register', icon: FileText },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Admin', href: '/admin', icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold">
            IA
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">DLPP Audit</h1>
            <p className="text-xs text-slate-500">Compliance System</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 px-3 py-2 overflow-y-auto">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-slate-500">
          <p className="font-medium">DLPP Internal Audit</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
