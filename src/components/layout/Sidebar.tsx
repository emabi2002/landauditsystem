'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Shield,
  Zap,
  Briefcase,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Activity,
  TrendingUp,
  Target,
  FileText,
  BarChart3,
  Settings,
  Users,
  Package,
  Building2,
  UserCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Scale,
  GitBranch,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  defaultOpen?: boolean
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    name: 'Risk Foundation',
    icon: Shield,
    defaultOpen: true,
    items: [
      { name: 'Risk Register', href: '/risk-register', icon: Shield, badge: 'CORE' },
      { name: 'Risk Events', href: '/risk-events', icon: Zap, badge: 'GATE' },
      { name: 'Risk Profiles', href: '/risk-profiles', icon: Activity },
    ],
  },
  {
    name: 'Audit Workflow',
    icon: Scale,
    defaultOpen: true,
    items: [
      { name: 'Engagements', href: '/engagements', icon: Briefcase },
      { name: 'Fieldwork', href: '/fieldwork', icon: FolderOpen },
      { name: 'Findings', href: '/findings', icon: AlertTriangle },
      { name: 'Recommendations', href: '/recommendations', icon: CheckCircle },
      { name: 'Action Plans', href: '/action-plans', icon: ClipboardList },
    ],
  },
  {
    name: 'Governance',
    icon: GitBranch,
    defaultOpen: false,
    items: [
      { name: 'PSAP Scorecard', href: '/psap-scorecard', icon: TrendingUp },
      { name: 'KRA & Workplan', href: '/kra-workplan', icon: Target },
      { name: 'Compliance', href: '/compliance', icon: FileText },
    ],
  },
  {
    name: 'Reports',
    icon: BarChart3,
    defaultOpen: false,
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    name: 'Administration',
    icon: Settings,
    defaultOpen: false,
    items: [
      { name: 'Admin Hub', href: '/admin', icon: Settings },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Auditor Profiles', href: '/admin/auditors', icon: UserCircle },
      { name: 'Groups', href: '/admin/groups', icon: Shield },
      { name: 'Modules', href: '/admin/modules', icon: Package },
      { name: 'Divisions', href: '/admin/divisions', icon: Building2 },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navigationGroups.forEach((group) => {
      initial[group.name] = group.defaultOpen ?? false
    })
    return initial
  })

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  const isActiveItem = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href.includes('?')) {
      const basePath = href.split('?')[0]
      return pathname === basePath
    }
    // Exact match for admin sub-pages to avoid /admin matching /admin/users
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isActiveGroup = (group: NavGroup) => {
    return group.items.some((item) => isActiveItem(item.href))
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-center border-b border-slate-700 px-4">
          <img
            src="/dlpp-logo.svg"
            alt="DLPP Logo"
            className={cn('transition-all duration-300', collapsed ? 'h-8' : 'h-10')}
          />
          {!collapsed && (
            <div className="ml-3">
              <div className="text-sm font-semibold">DLPP Audit</div>
              <div className="text-xs text-slate-400">Compliance System</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigationGroups.map((group) => {
              const GroupIcon = group.icon
              const isOpen = openGroups[group.name]
              const isGroupActive = isActiveGroup(group)

              return (
                <div key={group.name} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-slate-800',
                      isGroupActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{group.name}</span>}
                    </div>
                    {!collapsed &&
                      (isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      ))}
                  </button>

                  {/* Expanded nested items */}
                  {!collapsed && isOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-4">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = isActiveItem(item.href)

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onMobileClose}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              'hover:bg-slate-800',
                              isActive
                                ? 'bg-emerald-600 text-white font-medium'
                                : 'text-slate-400 hover:text-white'
                            )}
                          >
                            <ItemIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold',
                                  item.badge === 'CORE'
                                    ? 'bg-emerald-500 text-white'
                                    : item.badge === 'GATE'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-red-500 text-white'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Collapsed icons only */}
                  {collapsed && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = isActiveItem(item.href)

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            title={item.name}
                            onClick={onMobileClose}
                            className={cn(
                              'flex items-center justify-center rounded-lg p-2 transition-colors',
                              'hover:bg-slate-800',
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            )}
                          >
                            <ItemIcon className="h-4 w-4" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
