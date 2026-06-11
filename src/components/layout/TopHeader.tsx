'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  LayoutGrid,
  Scale,
  Building2,
  ShieldCheck,
  ExternalLink,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { GlobalSearch } from './GlobalSearch'
import { NotificationsBell } from './NotificationsBell'
import { cn } from '@/lib/utils'

interface TopHeaderProps {
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onMobileToggle?: () => void
}

interface UserProfile {
  full_name: string | null
  email: string
  primaryGroup: string | null
  systemAccess: string[]
}

// DLPP sister systems available via the switcher
const DLPP_SYSTEMS = [
  {
    key: 'audit',
    name: 'Audit System',
    description: 'Internal Audit & Compliance',
    icon: ShieldCheck,
    url: '',
    current: true,
  },
  {
    key: 'cases',
    name: 'Land Cases System',
    description: 'Legal Case Management',
    icon: Scale,
    url: 'https://cases.dlpp.gov.pg',
    current: false,
  },
  {
    key: 'corporate',
    name: 'Corporate System',
    description: 'Corporate Services',
    icon: Building2,
    url: 'https://corporate.dlpp.gov.pg',
    current: false,
  },
]

function getInitials(name: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function TopHeader({ sidebarCollapsed, onToggleSidebar, onMobileToggle }: TopHeaderProps) {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    const devFallback: UserProfile = {
      full_name: 'John Doe',
      email: 'admin@dlpp.gov.pg',
      primaryGroup: 'Audit Manager',
      systemAccess: ['audit', 'cases', 'corporate'],
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserProfile(devFallback)
        return
      }

      const { data: profileData } = await (supabase as any)
        .from('user_profiles')
        .select('full_name, system_access')
        .eq('id', user.id)
        .single()

      const { data: userGroups } = await (supabase as any)
        .from('user_groups')
        .select('groups(group_name)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      setUserProfile({
        full_name: profileData?.full_name || null,
        email: user.email || '',
        primaryGroup: userGroups?.groups?.group_name || null,
        systemAccess: (profileData?.system_access as string[]) || ['audit'],
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(devFallback)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  const accessibleSystems = DLPP_SYSTEMS.filter(
    (s) => s.current || userProfile?.systemAccess?.includes(s.key)
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMobileToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Sidebar Toggle */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex text-slate-600 hover:text-slate-900"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Title */}
        <div className="hidden xl:block">
          <h2 className="text-lg font-semibold text-slate-800">
            Internal Audit & Compliance System
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search */}
        <div className="hidden md:block">
          <GlobalSearch />
        </div>

        {/* System Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900"
              title="Switch DLPP System"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              DLPP Systems
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accessibleSystems.map((system) => {
              const Icon = system.icon
              return (
                <DropdownMenuItem
                  key={system.key}
                  className={cn(
                    'flex items-start gap-3 py-2.5 cursor-pointer',
                    system.current && 'bg-emerald-50'
                  )}
                  onClick={() => {
                    if (system.current) return
                    if (system.url) window.open(system.url, '_blank')
                  }}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                      system.current ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{system.name}</span>
                      {system.current ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{system.description}</p>
                  </div>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-[11px] text-slate-400">
              Single sign-on across all DLPP systems
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationsBell />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">
                  {userProfile ? getInitials(userProfile.full_name || userProfile.primaryGroup || userProfile.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-700 leading-tight">
                  {userProfile ? (userProfile.full_name || 'User') : 'Loading...'}
                </span>
                <span className="text-xs text-slate-500 leading-tight">
                  {userProfile?.primaryGroup || 'Staff'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
