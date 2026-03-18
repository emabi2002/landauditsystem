'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Shield,
  Package,
  Building2,
  Settings,
  Database,
  Activity,
  ArrowRight,
  UserPlus,
  FolderCog,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  UserCircle,
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database as DbTypes } from '@/lib/database.types'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalGroups: number
  totalModules: number
  totalDivisions: number
  totalAuditors: number
  recentActivity: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGroups: 0,
    totalModules: 0,
    totalDivisions: 0,
    totalAuditors: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<DbTypes>()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load counts from database
      const [divisionsRes, groupsRes, modulesRes, usersRes, auditorsRes] = await Promise.all([
        supabase.from('audit_divisions').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('audit_users').select('id, is_active'),
        supabase.from('audit_auditor_profiles').select('id', { count: 'exact', head: true }),
      ])

      const usersData = (usersRes.data as any[]) || []
      const totalUsers = usersData.length
      const activeUsers = usersData.filter((u: any) => u.is_active).length

      // Get recent activity count from audit_log
      const { count: activityCount } = await supabase
        .from('audit_log')
        .select('id', { count: 'exact', head: true })

      setStats({
        totalUsers,
        activeUsers,
        totalGroups: groupsRes.count || 0,
        totalModules: modulesRes.count || 0,
        totalDivisions: divisionsRes.count || 0,
        totalAuditors: auditorsRes.count || 0,
        recentActivity: activityCount || 0,
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage system users, assign groups, and control access',
      icon: Users,
      href: '/admin/users',
      color: 'bg-emerald-500',
      stats: `${stats.totalUsers} users`,
      highlight: true,
    },
    {
      title: 'Auditor Profiles',
      description: 'Manage auditor qualifications, certifications, and specializations',
      icon: UserCircle,
      href: '/admin/auditors',
      color: 'bg-teal-500',
      stats: `${stats.totalAuditors} auditors`,
      highlight: true,
    },
    {
      title: 'Group Management',
      description: 'Create and manage user groups with granular permissions',
      icon: Shield,
      href: '/admin/groups',
      color: 'bg-blue-500',
      stats: `${stats.totalGroups} groups`,
    },
    {
      title: 'Module Management',
      description: 'Configure system modules and feature access',
      icon: Package,
      href: '/admin/modules',
      color: 'bg-purple-500',
      stats: `${stats.totalModules} modules`,
    },
    {
      title: 'Division Management',
      description: 'Manage DLPP organizational divisions and sections',
      icon: Building2,
      href: '/admin/divisions',
      color: 'bg-amber-500',
      stats: `${stats.totalDivisions} divisions`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-500 mt-1">
            Manage users, groups, permissions, and system configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
                <p className="text-xs text-emerald-600 mt-1">{stats.activeUsers} active</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">User Groups</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalGroups}</p>
                <p className="text-xs text-blue-600 mt-1">With permissions</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">System Modules</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalModules}</p>
                <p className="text-xs text-purple-600 mt-1">Configurable</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">DLPP Divisions</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDivisions}</p>
                <p className="text-xs text-amber-600 mt-1">Organizational units</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Setup Banner (show when no groups exist) */}
      {stats.totalGroups === 0 && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Wand2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900 mb-1">
                  Welcome! Let's set up your RBAC system
                </h3>
                <p className="text-sm text-emerald-700 mb-4">
                  You haven't created any groups yet. Use Quick Setup to create common role templates
                  (Super Admin, Audit Manager, Auditor, etc.) with pre-configured permissions.
                </p>
                <div className="flex gap-3">
                  <Link href="/admin/groups">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <Wand2 className="h-4 w-4" />
                      Quick Setup Groups
                    </Button>
                  </Link>
                  <Link href="/admin/modules">
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 gap-2">
                      <FolderCog className="h-4 w-4" />
                      Configure Modules First
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer group ${
              module.highlight ? 'border-2 border-slate-200 hover:border-slate-300' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${module.color}`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-slate-700">
                        {module.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                    <Badge variant="secondary" className="mt-3">
                      {module.stats}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* RBAC Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              RBAC System Status
            </CardTitle>
            <CardDescription>Role-Based Access Control configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Groups Configured</span>
              </div>
              <Badge variant="outline">{stats.totalGroups} groups</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Modules Registered</span>
              </div>
              <Badge variant="outline">{stats.totalModules} modules</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {stats.totalUsers > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <span className="text-sm font-medium">Users Assigned</span>
              </div>
              <Badge variant="outline">{stats.totalUsers} users</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users" className="block">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Add New User</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
            <Link href="/admin/groups" className="block">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Configure Permissions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
            <Link href="/admin/divisions" className="block">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Manage Divisions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">View Audit Logs</span>
              </div>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Footer */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                About Role-Based Access Control (RBAC)
              </p>
              <p className="text-sm text-blue-700 mt-1">
                RBAC allows you to define what actions users can perform on different modules.
                Create groups (roles), assign permissions to those groups, then assign users to groups.
                Users inherit all permissions from their assigned groups.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
