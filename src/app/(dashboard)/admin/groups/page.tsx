'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Wand2,
  ArrowLeft,
  Package,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { DEFAULT_GROUP_TEMPLATES, MODULE_CATEGORIES } from '@/lib/rbac-types'
import type { Group, Module, GroupModulePermission, PermissionMatrixRow } from '@/lib/rbac-types'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [permissions, setPermissions] = useState<PermissionMatrixRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [isCreating, setIsCreating] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [groupForm, setGroupForm] = useState({ group_name: '', description: '' })

  // Quick setup wizard
  const [showQuickSetup, setShowQuickSetup] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [settingUpGroups, setSettingUpGroups] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [groupsRes, modulesRes] = await Promise.all([
        supabase.from('groups').select('*').order('group_name'),
        supabase.from('modules').select('*').order('module_name'),
      ])

      setGroups((groupsRes.data as Group[]) || [])
      setModules((modulesRes.data as Module[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load groups and modules')
    } finally {
      setLoading(false)
    }
  }

  const loadGroupPermissions = async (group: Group) => {
    try {
      const { data, error } = await supabase
        .from('group_module_permissions')
        .select('*')
        .eq('group_id', group.id)

      if (error) throw error

      const permissionsMap = new Map(
        ((data as GroupModulePermission[]) || []).map((p) => [p.module_id, p])
      )

      const matrixRows: PermissionMatrixRow[] = modules.map((module) => {
        const perm = permissionsMap.get(module.id)
        return {
          module_id: module.id,
          module_name: module.module_name,
          module_key: module.module_key,
          permissions: {
            can_create: perm?.can_create || false,
            can_read: perm?.can_read || false,
            can_update: perm?.can_update || false,
            can_delete: perm?.can_delete || false,
            can_print: perm?.can_print || false,
            can_approve: perm?.can_approve || false,
            can_export: perm?.can_export || false,
          },
        }
      })

      setPermissions(matrixRows)
      setSelectedGroup(group)
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast.error('Failed to load permissions')
    }
  }

  const handleCreateGroup = async () => {
    if (!groupForm.group_name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          group_name: groupForm.group_name,
          description: groupForm.description || null,
        } as any)
        .select()
        .single()

      if (error) throw error

      toast.success('Group created successfully')
      setGroupForm({ group_name: '', description: '' })
      setIsCreating(false)
      loadData()
    } catch (error: any) {
      console.error('Error creating group:', error)
      toast.error(error.message || 'Failed to create group')
    }
  }

  const handleUpdateGroup = async (groupId: string) => {
    if (!groupForm.group_name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      const { error } = await supabase
        .from('groups')
        .update({
          group_name: groupForm.group_name,
          description: groupForm.description || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', groupId)

      if (error) throw error

      toast.success('Group updated successfully')
      setEditingGroupId(null)
      setGroupForm({ group_name: '', description: '' })
      loadData()
    } catch (error: any) {
      console.error('Error updating group:', error)
      toast.error(error.message || 'Failed to update group')
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (
      !confirm(
        `Are you sure you want to delete "${group.group_name}"? This will remove all associated permissions.`
      )
    ) {
      return
    }

    try {
      const { error } = await supabase.from('groups').delete().eq('id', group.id)

      if (error) throw error

      toast.success('Group deleted successfully')
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(null)
        setPermissions([])
      }
      loadData()
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error(error.message || 'Failed to delete group')
    }
  }

  const togglePermission = (
    moduleId: string,
    permission: keyof PermissionMatrixRow['permissions']
  ) => {
    setPermissions((prev) =>
      prev.map((row) => {
        if (row.module_id === moduleId) {
          return {
            ...row,
            permissions: {
              ...row.permissions,
              [permission]: !row.permissions[permission],
            },
          }
        }
        return row
      })
    )
  }

  const toggleAllForModule = (moduleId: string, enabled: boolean) => {
    setPermissions((prev) =>
      prev.map((row) => {
        if (row.module_id === moduleId) {
          return {
            ...row,
            permissions: {
              can_create: enabled,
              can_read: enabled,
              can_update: enabled,
              can_delete: enabled,
              can_print: enabled,
              can_approve: enabled,
              can_export: enabled,
            },
          }
        }
        return row
      })
    )
  }

  const savePermissions = async () => {
    if (!selectedGroup) return

    try {
      setSaving(true)

      // Delete existing permissions
      await supabase
        .from('group_module_permissions')
        .delete()
        .eq('group_id', selectedGroup.id)

      // Insert new permissions
      const permissionsToInsert = permissions.map((row) => ({
        group_id: selectedGroup.id,
        module_id: row.module_id,
        ...row.permissions,
      }))

      const { error } = await supabase
        .from('group_module_permissions')
        .insert(permissionsToInsert as any)

      if (error) throw error

      toast.success('Permissions saved successfully')
    } catch (error: any) {
      console.error('Error saving permissions:', error)
      toast.error(error.message || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickSetup = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select at least one group template')
      return
    }

    try {
      setSettingUpGroups(true)

      for (const templateName of selectedTemplates) {
        const template = DEFAULT_GROUP_TEMPLATES.find((t) => t.group_name === templateName)
        if (!template) continue

        const { error: groupError } = await supabase
          .from('groups')
          .insert({
            group_name: template.group_name,
            description: template.description,
          } as any)

        if (groupError) {
          console.error(`Error creating ${template.group_name}:`, groupError)
          continue
        }
      }

      toast.success(`Successfully created ${selectedTemplates.length} group(s)!`)
      setShowQuickSetup(false)
      setSelectedTemplates([])
      loadData()
    } catch (error: any) {
      console.error('Error in quick setup:', error)
      toast.error(error.message || 'Failed to create groups')
    } finally {
      setSettingUpGroups(false)
    }
  }

  const startEditGroup = (group: Group) => {
    setEditingGroupId(group.id)
    setGroupForm({
      group_name: group.group_name,
      description: group.description || '',
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingGroupId(null)
    setIsCreating(false)
    setGroupForm({ group_name: '', description: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading groups...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Group Management</h1>
            <p className="text-slate-500 mt-1">Manage user groups and module permissions</p>
          </div>
        </div>
        <div className="flex gap-3">
          {groups.length === 0 && (
            <Button onClick={() => setShowQuickSetup(true)} variant="outline" className="gap-2">
              <Wand2 className="h-5 w-5" />
              Quick Setup
            </Button>
          )}
          <Button
            onClick={() => {
              setIsCreating(true)
              setEditingGroupId(null)
              setGroupForm({ group_name: '', description: '' })
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create New Group
          </Button>
        </div>
      </div>

      {/* Quick Setup Banner */}
      {groups.length === 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wand2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Welcome! Let's set up your first groups
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Use Quick Setup to create common group templates, or create custom groups from scratch.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowQuickSetup(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Use Quick Setup
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(true)
                      setGroupForm({ group_name: '', description: '' })
                    }}
                    variant="outline"
                    className="border-blue-600 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Group
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel: Groups List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Groups</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    if (isCreating) {
                      cancelEdit()
                    } else {
                      setIsCreating(true)
                      setEditingGroupId(null)
                      setGroupForm({ group_name: '', description: '' })
                    }
                  }}
                >
                  {isCreating ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  {isCreating ? 'Cancel' : 'New'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isCreating && (
                <div className="mb-4 p-4 border rounded-lg space-y-3 bg-slate-50">
                  <div>
                    <Label>Group Name *</Label>
                    <Input
                      value={groupForm.group_name}
                      onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                      placeholder="e.g., Audit Manager"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                      placeholder="Describe the group's role..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateGroup} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-50 border-blue-600'
                        : editingGroupId === group.id
                        ? 'bg-amber-50 border-amber-300'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {editingGroupId === group.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Group Name *</Label>
                          <Input
                            value={groupForm.group_name}
                            onChange={(e) =>
                              setGroupForm({ ...groupForm, group_name: e.target.value })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={groupForm.description}
                            onChange={(e) =>
                              setGroupForm({ ...groupForm, description: e.target.value })
                            }
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateGroup(group.id)} className="flex-1">
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1">
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => loadGroupPermissions(group)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{group.group_name}</div>
                            {group.description && (
                              <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {group.description}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditGroup(group)
                              }}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGroup(group)
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {groups.length === 0 && !isCreating && (
                  <div className="text-center py-8 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No groups found. Create one to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Permission Matrix */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permission Matrix
                  </CardTitle>
                  <CardDescription>
                    {selectedGroup
                      ? `Configuring permissions for: ${selectedGroup.group_name}`
                      : 'Select a group to configure permissions'}
                  </CardDescription>
                </div>
                {selectedGroup && (
                  <Button onClick={savePermissions} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save Permissions'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <div className="space-y-6">
                  {modules.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No modules configured yet.</p>
                      <p className="text-sm mt-1">Go to Module Management to add modules first.</p>
                      <Link href="/admin/modules">
                        <Button className="mt-4">Configure Modules</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50">
                            <th className="text-left py-3 px-3 font-semibold">Module</th>
                            <th className="text-center py-3 px-2 font-semibold">Create</th>
                            <th className="text-center py-3 px-2 font-semibold">Read</th>
                            <th className="text-center py-3 px-2 font-semibold">Update</th>
                            <th className="text-center py-3 px-2 font-semibold">Delete</th>
                            <th className="text-center py-3 px-2 font-semibold">Print</th>
                            <th className="text-center py-3 px-2 font-semibold">Approve</th>
                            <th className="text-center py-3 px-2 font-semibold">Export</th>
                            <th className="text-center py-3 px-2 font-semibold">All</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions.map((row) => {
                            const allEnabled = Object.values(row.permissions).every((v) => v)
                            return (
                              <tr key={row.module_id} className="border-b hover:bg-slate-50">
                                <td className="py-3 px-3">
                                  <div>
                                    <span className="font-medium">{row.module_name}</span>
                                    <Badge variant="outline" className="ml-2 text-xs font-mono">
                                      {row.module_key}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_create}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_create')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_read}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_read')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_update}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_update')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_delete}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_delete')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_print}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_print')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_approve}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_approve')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={row.permissions.can_export}
                                    onCheckedChange={() => togglePermission(row.module_id, 'can_export')}
                                  />
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Switch
                                    checked={allEnabled}
                                    onCheckedChange={(checked: boolean) => toggleAllForModule(row.module_id, checked)}
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Select a group from the left to configure its permissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Setup Dialog */}
      <Dialog open={showQuickSetup} onOpenChange={setShowQuickSetup}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="h-6 w-6 text-blue-600" />
              Quick Setup - Create Default Groups
            </DialogTitle>
            <DialogDescription>
              Select which groups you'd like to create. Each group comes with descriptions you can customize later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm font-medium text-slate-700">
              Select the groups you need:
            </p>

            <div className="grid gap-3">
              {DEFAULT_GROUP_TEMPLATES.map((template) => (
                <Card
                  key={template.group_name}
                  className={`cursor-pointer transition-all ${
                    selectedTemplates.includes(template.group_name)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => {
                    setSelectedTemplates((prev) =>
                      prev.includes(template.group_name)
                        ? prev.filter((name) => name !== template.group_name)
                        : [...prev, template.group_name]
                    )
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedTemplates.includes(template.group_name)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedTemplates.includes(template.group_name) && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{template.group_name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After creation, you'll need to configure permissions for each group
                  in the Permission Matrix.
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuickSetup(false)
                setSelectedTemplates([])
              }}
              disabled={settingUpGroups}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickSetup}
              disabled={selectedTemplates.length === 0 || settingUpGroups}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {settingUpGroups ? (
                <>Creating Groups...</>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create {selectedTemplates.length} Group{selectedTemplates.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
