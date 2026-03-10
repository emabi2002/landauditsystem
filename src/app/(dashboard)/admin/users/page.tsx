'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import type { Group } from '@/lib/rbac-types'

interface AuditUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  division_id: string | null
  is_active: boolean
  created_at: string
  division?: {
    name: string
    code: string
  } | null
  groups?: Group[]
}

interface Division {
  id: string
  name: string
  code: string
}

export default function UsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AuditUser[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDivision, setFilterDivision] = useState<string>('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [manageGroupsDialogOpen, setManageGroupsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AuditUser | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    division_id: '',
    group_id: '',
    password: '',
    confirm_password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load groups
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .order('group_name')

      setGroups((groupsData as Group[]) || [])

      // Load divisions
      const { data: divisionsData } = await supabase
        .from('audit_divisions')
        .select('id, name, code')
        .order('name')

      setDivisions((divisionsData as Division[]) || [])

      // Load users from audit_users table with division info
      const { data: usersData, error: usersError } = await supabase
        .from('audit_users')
        .select(`
          id,
          email,
          full_name,
          phone,
          division_id,
          is_active,
          created_at,
          audit_divisions(name, code)
        `)
        .order('full_name')

      if (usersError) {
        console.error('Error loading users:', usersError)
      }

      // Load user groups for each user
      const { data: userGroupsData } = await supabase
        .from('user_groups')
        .select(`
          user_id,
          group_id,
          groups(id, group_name, description, created_at, updated_at)
        `)

      // Map users with their groups
      const usersWithGroups: AuditUser[] = ((usersData as any[]) || []).map((user: any) => {
        const userGroups = (userGroupsData || [])
          .filter((ug: any) => ug.user_id === user.id)
          .map((ug: any) => ug.groups)
          .filter(Boolean)

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          division_id: user.division_id,
          is_active: user.is_active,
          created_at: user.created_at,
          division: user.audit_divisions ? {
            name: user.audit_divisions.name,
            code: user.audit_divisions.code,
          } : null,
          groups: userGroups,
        }
      })

      setUsers(usersWithGroups)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      division_id: '',
      group_id: '',
      password: '',
      confirm_password: '',
    })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.full_name.trim()) {
      toast.error('Email and full name are required')
      return
    }

    setSubmitting(true)

    try {
      // Generate a unique ID for the user
      const userId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create the user in audit_users table
      const { error: userError } = await supabase
        .from('audit_users')
        .insert({
          id: userId,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          division_id: formData.division_id || null,
          is_active: true,
        } as any)

      if (userError) {
        if (userError.code === '23505') {
          toast.error('A user with this email already exists')
        } else {
          throw userError
        }
        return
      }

      // If a group was selected, add the user to that group
      if (formData.group_id) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert({
            user_id: userId,
            group_id: formData.group_id,
          } as any)

        if (groupError) {
          console.error('Error assigning group:', groupError)
        }
      }

      toast.success('User created successfully!')
      setCreateDialogOpen(false)
      resetForm()
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
      const { error } = await supabase
        .from('audit_users')
        .update({
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          division_id: formData.division_id || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', selectedUser.id)

      if (error) throw error

      toast.success('User updated successfully!')
      setEditDialogOpen(false)
      setSelectedUser(null)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: AuditUser) => {
    if (!confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`)) {
      return
    }

    try {
      // First delete user_groups entries
      await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', user.id)

      // Then delete the user
      const { error } = await supabase
        .from('audit_users')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      toast.success('User deleted successfully')
      loadData()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleToggleActive = async (user: AuditUser) => {
    try {
      const { error } = await supabase
        .from('audit_users')
        .update({
          is_active: !user.is_active,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id)

      if (error) throw error

      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
      loadData()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user status')
    }
  }

  const handleAddUserToGroup = async () => {
    if (!selectedUser || !selectedGroupId) {
      toast.error('Please select a group')
      return
    }

    try {
      // Check if user already in group
      const existingGroups = selectedUser.groups?.map(g => g.id) || []
      if (existingGroups.includes(selectedGroupId)) {
        toast.error('User is already in this group')
        return
      }

      const { error } = await supabase
        .from('user_groups')
        .insert({
          user_id: selectedUser.id,
          group_id: selectedGroupId,
        } as any)

      if (error) throw error

      toast.success('User added to group')
      setSelectedGroupId('')
      loadData()

      // Update selected user with new group
      const newGroup = groups.find(g => g.id === selectedGroupId)
      if (newGroup && selectedUser) {
        setSelectedUser({
          ...selectedUser,
          groups: [...(selectedUser.groups || []), newGroup],
        })
      }
    } catch (error: any) {
      console.error('Error adding user to group:', error)
      toast.error(error.message || 'Failed to add user to group')
    }
  }

  const handleRemoveUserFromGroup = async (groupId: string) => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('group_id', groupId)

      if (error) throw error

      const groupName = groups.find(g => g.id === groupId)?.group_name
      toast.success(`Removed from ${groupName}`)
      loadData()

      // Update selected user without this group
      setSelectedUser({
        ...selectedUser,
        groups: (selectedUser.groups || []).filter(g => g.id !== groupId),
      })
    } catch (error: any) {
      console.error('Error removing user from group:', error)
      toast.error(error.message || 'Failed to remove user from group')
    }
  }

  const openEditDialog = (user: AuditUser) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      division_id: user.division_id || '',
      group_id: user.groups?.[0]?.id || '',
      password: '',
      confirm_password: '',
    })
    setEditDialogOpen(true)
  }

  const openManageGroupsDialog = (user: AuditUser) => {
    setSelectedUser(user)
    setSelectedGroupId('')
    setManageGroupsDialogOpen(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDivision =
      filterDivision === 'all' ||
      user.division?.code === filterDivision

    return matchesSearch && matchesDivision
  })

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 mt-1">Manage users and their group assignments</p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setCreateDialogOpen(true)
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <UserPlus className="h-5 w-5" />
          Create New User
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDivision} onValueChange={setFilterDivision}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.code}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
              <p className="text-slate-600">
                {users.length === 0
                  ? 'No users have been created yet. Click "Create New User" to add one.'
                  : 'Try adjusting your search criteria'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${user.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Users className={`h-5 w-5 ${user.is_active ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.full_name || 'Unnamed User'}</h3>
                          {user.is_active ? (
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

                    {/* Division & Groups */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      {user.division && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{user.division.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Groups:</span>
                        <div className="flex flex-wrap gap-1">
                          {user.groups && user.groups.length > 0 ? (
                            user.groups.map((group) => (
                              <Badge
                                key={group.id}
                                className="bg-blue-100 text-blue-800 border-blue-200"
                              >
                                {group.group_name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500 italic">No groups assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditDialog(user)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
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
                      className={user.is_active ? 'text-amber-600' : 'text-green-600'}
                    >
                      {user.is_active ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
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
          ))
        )}
      </div>

      {/* Summary */}
      {filteredUsers.length > 0 && (
        <p className="text-sm text-slate-600 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system and assign them to a group
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4">
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
                <Label htmlFor="division">Division</Label>
                <Select
                  value={formData.division_id}
                  onValueChange={(value) => setFormData({ ...formData, division_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division..." />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Group Assignment
                </Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) => setFormData({ ...formData, group_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name *</Label>
                <Input
                  id="edit_full_name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email Address *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

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
                <Label htmlFor="edit_division">Division</Label>
                <Select
                  value={formData.division_id}
                  onValueChange={(value) => setFormData({ ...formData, division_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division..." />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Groups</DialogTitle>
            <DialogDescription>
              Assign or remove groups for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Current Groups:</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedUser?.groups && selectedUser.groups.length > 0 ? (
                selectedUser.groups.map((group) => (
                  <Badge
                    key={group.id}
                    className="bg-blue-100 text-blue-800 border-blue-200 gap-2"
                  >
                    {group.group_name}
                    <button
                      onClick={() => handleRemoveUserFromGroup(group.id)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">No groups assigned</span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Add to Group</Label>
              <div className="flex gap-2">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddUserToGroup} disabled={!selectedGroupId}>
                  Add
                </Button>
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
  )
}
