'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  UserPlus,
  Search,
  Shield,
  X,
  Edit,
  Trash2,
  Settings,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  KeyRound,
  LayoutGrid,
} from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { toast } from 'sonner'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { ApplicationKey } from '@/lib/rbac-types'
import {
  APPLICATIONS,
  CURRENT_APPLICATION,
  applicationBadgeClass,
  applicationLabel,
  fetchGroupsWithSystem,
  type GroupWithSystem,
} from '@/lib/rbac-scope'
import { HelpTooltip } from '@/components/help/HelpTooltip'

interface SharedUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  department: string | null
  role: string | null
  status: string | null
  created_at: string | null
  systems: string[]
  groups: { id: string; group_name: string; description: string | null; system: string | null }[]
}

interface Division {
  id: string
  name: string
  code: string
}

type UserFilter = ApplicationKey | 'all'

// These map to the shared `users.role` CHECK constraint (officer / viewer /
// admin). Fine-grained access is controlled by RBAC groups, not this field.
const ROLE_OPTIONS = [
  { value: 'officer', label: 'Officer (standard)' },
  { value: 'viewer', label: 'Viewer (read-only)' },
  { value: 'admin', label: 'Administrator' },
]

const emptyForm = () => ({
  email: '',
  full_name: '',
  phone: '',
  department: '',
  role: 'officer',
  password: '',
  systems: [CURRENT_APPLICATION] as ApplicationKey[],
  group_id: '',
})

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<SharedUser[]>([])
  const [groups, setGroups] = useState<GroupWithSystem[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [systemFilter, setSystemFilter] = useState<UserFilter>(CURRENT_APPLICATION)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [manageGroupsDialogOpen, setManageGroupsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SharedUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Groups (with resolved application) + divisions in parallel with users.
      const [{ data: groupData }, divisionsRes, usersRes] = await Promise.all([
        fetchGroupsWithSystem(supabase),
        supabase.from('audit_divisions').select('id, name, code').order('name'),
        fetch('/api/users').then((r) => r.json()),
      ])

      setGroups(groupData)
      setDivisions((divisionsRes.data as Division[]) || [])

      if (usersRes.error) {
        console.error('Error loading users:', usersRes.error)
        toast.error('Failed to load users')
        setUsers([])
      } else {
        setUsers((usersRes.data as SharedUser[]) || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const toggleFormSystem = (key: ApplicationKey) => {
    setFormData((prev) => {
      const has = prev.systems.includes(key)
      const systems = has ? prev.systems.filter((s) => s !== key) : [...prev.systems, key]
      // If the currently-picked group no longer belongs to an allowed system, clear it.
      const grp = groups.find((g) => g.id === prev.group_id)
      const group_id = grp && grp.system && !systems.includes(grp.system as ApplicationKey) ? '' : prev.group_id
      return { ...prev, systems, group_id }
    })
  }

  // Groups that can be assigned given the systems checked in the form.
  const assignableGroups = groups.filter(
    (g) => g.system && formData.systems.includes(g.system as ApplicationKey),
  )

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.full_name.trim()) {
      toast.error('Email and full name are required')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.systems.length === 0) {
      toast.error('Select at least one application the user can access')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || null,
          department: formData.department || null,
          role: formData.role,
          systems: formData.systems,
          group_ids: formData.group_id ? [formData.group_id] : [],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create user')

      toast.success(
        json?.data?.linked
          ? 'This email already had a DLPP login — granted the selected access and group (existing password kept).'
          : 'User created successfully!',
      )
      setCreateDialogOpen(false)
      setFormData(emptyForm())
      loadData()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          email: selectedUser.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          department: formData.department || null,
          role: formData.role,
          systems: formData.systems,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update user')

      toast.success('User updated successfully!')
      setEditDialogOpen(false)
      setSelectedUser(null)
      setFormData(emptyForm())
      loadData()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: SharedUser) => {
    if (!confirm(`Delete user "${user.email}"? This also removes their login. This cannot be undone.`)) {
      return
    }
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete user')
      toast.success('User deleted successfully')
      loadData()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleToggleActive = async (user: SharedUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update status')
      toast.success(`User ${nextStatus === 'active' ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user status')
    }
  }

  const saveGroupMembership = async (groupIds: string[]) => {
    if (!selectedUser) return
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, group_ids: groupIds }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update groups')
      // Optimistically update the selected user + list.
      const newGroups = groups
        .filter((g) => groupIds.includes(g.id))
        .map((g) => ({ id: g.id, group_name: g.group_name, description: g.description, system: g.system ?? null }))
      setSelectedUser({ ...selectedUser, groups: newGroups })
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, groups: newGroups } : u)))
    } catch (error: any) {
      console.error('Error updating groups:', error)
      toast.error(error.message || 'Failed to update groups')
    }
  }

  const toggleUserGroup = (groupId: string) => {
    if (!selectedUser) return
    const current = selectedUser.groups.map((g) => g.id)
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId]
    saveGroupMembership(next)
  }

  const openCreateDialog = () => {
    setFormData({
      ...emptyForm(),
      systems: systemFilter === 'all' ? [CURRENT_APPLICATION] : [systemFilter as ApplicationKey],
    })
    setShowPassword(false)
    setCreateDialogOpen(true)
  }

  const openEditDialog = (user: SharedUser) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      department: user.department || '',
      role: user.role || 'user',
      password: '',
      systems: (user.systems as ApplicationKey[]).filter((s) =>
        APPLICATIONS.some((a) => a.key === s),
      ),
      group_id: '',
    })
    setShowPassword(false)
    setEditDialogOpen(true)
  }

  const openManageGroupsDialog = (user: SharedUser) => {
    setSelectedUser(user)
    setManageGroupsDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesSystem = systemFilter === 'all' || user.systems.includes(systemFilter)
    return matchesSearch && matchesSystem
  })

  const countForSystem = (key: UserFilter) =>
    key === 'all' ? users.length : users.filter((u) => u.systems.includes(key)).length

  // Groups shown in the Manage Groups dialog — scoped to the user's systems.
  const manageableGroups = selectedUser
    ? groups.filter((g) => !g.system || selectedUser.systems.includes(g.system as ApplicationKey))
    : groups

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        icon={Users}
        title="User Management"
        subtitle="Shared DLPP users — grant application access and assign groups"
        backHref="/admin"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={openCreateDialog} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4" />
              Create New User
            </Button>
            <HelpTooltip tooltipKey="admin-users-new" label="Create New User" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Application filter + search */}
          <Card data-tour="filters">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Application</p>
                  <p className="text-xs text-slate-500">Show users with access to the selected DLPP system</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {APPLICATIONS.map((app) => (
                  <button
                    key={app.key}
                    onClick={() => setSystemFilter(app.key)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      systemFilter === app.key ? app.badgeClass : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {app.label}
                    <span className="ml-1.5 text-xs opacity-70">({countForSystem(app.key)})</span>
                  </button>
                ))}
                <button
                  onClick={() => setSystemFilter('all')}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    systemFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All ({countForSystem('all')})
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div data-tour="table" className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-600">
                    {users.length === 0
                      ? 'No users have been created yet. Click "Create New User" to add one.'
                      : 'Try adjusting your search or application filter.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => {
                const isActive = user.status === 'active'
                return (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <Users className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{user.full_name || 'Unnamed User'}</h3>
                                {isActive ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-600 border-slate-200">Inactive</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </span>
                                {user.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Application access */}
                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            {user.department && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{user.department}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <LayoutGrid className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">Access:</span>
                              <div className="flex flex-wrap gap-1">
                                {user.systems.length > 0 ? (
                                  user.systems.map((sys) => (
                                    <Badge key={sys} variant="outline" className={`text-[10px] ${applicationBadgeClass(sys)}`}>
                                      {applicationLabel(sys)}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-400 italic">No application access</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Groups */}
                          <div className="mt-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">Groups:</span>
                            <div className="flex flex-wrap gap-1">
                              {user.groups.length > 0 ? (
                                user.groups.map((group) => (
                                  <Badge key={group.id} className="bg-blue-100 text-blue-800 border-blue-200">
                                    {group.group_name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-slate-500 italic">No groups assigned</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button onClick={() => openEditDialog(user)} size="sm" variant="outline" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => openManageGroupsDialog(user)}
                            size="sm"
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Settings className="h-4 w-4" />
                            Groups
                          </Button>
                          <Button
                            onClick={() => handleToggleActive(user)}
                            size="sm"
                            variant="outline"
                            className={isActive ? 'text-amber-600' : 'text-green-600'}
                          >
                            {isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {filteredUsers.length > 0 && (
            <p className="text-sm text-slate-600 text-center">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}

          {/* Create User Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Creates a login and grants application access. Assign a group to control their menu.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@dlpp.gov.pg"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Set a password (min 6 characters)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">The user can sign in with this email and password.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+675 xxx xxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department / Division</Label>
                    <Select
                      value={formData.department || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, department: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select division..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.name}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Application access */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Application Access *
                    </Label>
                    <p className="text-xs text-slate-500">Which DLPP system(s) this user can enter.</p>
                    <div className="flex flex-wrap gap-2">
                      {APPLICATIONS.map((app) => {
                        const active = formData.systems.includes(app.key)
                        return (
                          <button
                            key={app.key}
                            type="button"
                            onClick={() => toggleFormSystem(app.key)}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                              active ? app.badgeClass : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {active && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />}
                            {app.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Group */}
                  <div className="space-y-2">
                    <Label htmlFor="group" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Group (menu access)
                    </Label>
                    <Select
                      value={formData.group_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, group_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger id="group">
                        <SelectValue placeholder="Select a group..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No group</SelectItem>
                        {assignableGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.group_name} · {applicationLabel(group.system)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assignableGroups.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No groups exist for the selected application(s) yet.
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                    {submitting ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user details, application access and password</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name">Full Name *</Label>
                    <Input
                      id="edit_full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={formData.email} disabled className="bg-slate-50 text-slate-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit_phone">Phone</Label>
                      <Input
                        id="edit_phone"
                        placeholder="+675 xxx xxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger id="edit_role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_department">Department / Division</Label>
                    <Select
                      value={formData.department || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, department: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger id="edit_department">
                        <SelectValue placeholder="Select division..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.name}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Application Access
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {APPLICATIONS.map((app) => {
                        const active = formData.systems.includes(app.key)
                        return (
                          <button
                            key={app.key}
                            type="button"
                            onClick={() => toggleFormSystem(app.key)}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                              active ? app.badgeClass : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {active && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />}
                            {app.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_password" className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Reset Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit_password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank to keep current password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Manage Groups Dialog */}
          <Dialog open={manageGroupsDialogOpen} onOpenChange={setManageGroupsDialogOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage User Groups</DialogTitle>
                <DialogDescription>
                  Assign or remove groups for {selectedUser?.full_name || selectedUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Current Groups</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser?.groups && selectedUser.groups.length > 0 ? (
                      selectedUser.groups.map((group) => (
                        <Badge key={group.id} className="bg-blue-100 text-blue-800 border-blue-200 gap-2">
                          {group.group_name}
                          <button onClick={() => toggleUserGroup(group.id)} className="hover:text-blue-900">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">No groups assigned</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Groups</Label>
                  <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {manageableGroups.length === 0 && (
                      <p className="text-sm text-slate-500 p-2">No groups available for this user&apos;s applications.</p>
                    )}
                    {manageableGroups.map((group) => {
                      const assigned = selectedUser?.groups.some((g) => g.id === group.id)
                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleUserGroup(group.id)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            assigned ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {assigned ? (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border border-slate-300" />
                            )}
                            {group.group_name}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${applicationBadgeClass(group.system)}`}>
                            {applicationLabel(group.system)}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setManageGroupsDialogOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </>
  )
}
