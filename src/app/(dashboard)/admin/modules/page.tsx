'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Shield,
  Zap,
  Briefcase,
  BarChart3,
  Settings,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { MODULE_CATEGORIES } from '@/lib/rbac-types'
import type { Module } from '@/lib/rbac-types'

// Icon mapping for categories
const categoryIcons: Record<string, typeof Package> = {
  core: Zap,
  audit_workflow: Briefcase,
  risk_governance: Shield,
  management: BarChart3,
  administration: Settings,
}

// Default modules for the audit system
const DEFAULT_MODULES = [
  // Core
  { module_name: 'Dashboard', module_key: 'dashboard', category: 'core', description: 'Main dashboard with KPIs and overview' },
  { module_name: 'Risk Register', module_key: 'risk_register', category: 'core', description: 'Authoritative risk landscape for DLPP' },
  { module_name: 'Risk Events', module_key: 'risk_events', category: 'core', description: 'Central repository for audit triggers' },

  // Audit Workflow
  { module_name: 'Engagements', module_key: 'engagements', category: 'audit_workflow', description: 'Audit engagement management' },
  { module_name: 'Fieldwork', module_key: 'fieldwork', category: 'audit_workflow', description: 'Fieldwork and evidence collection' },
  { module_name: 'Findings', module_key: 'findings', category: 'audit_workflow', description: 'Audit findings documentation' },
  { module_name: 'Recommendations', module_key: 'recommendations', category: 'audit_workflow', description: 'Audit recommendations' },
  { module_name: 'Action Plans', module_key: 'action_plans', category: 'audit_workflow', description: 'Action plan tracking and follow-up' },

  // Risk & Governance
  { module_name: 'Risk Profiles', module_key: 'risk_profiles', category: 'risk_governance', description: 'Division risk profiles' },
  { module_name: 'PSAP Scorecard', module_key: 'psap_scorecard', category: 'risk_governance', description: 'Performance assessment scorecard' },
  { module_name: 'KRA & Workplan', module_key: 'kra_workplan', category: 'risk_governance', description: 'Key result areas and work planning' },

  // Management
  { module_name: 'Compliance', module_key: 'compliance', category: 'management', description: 'Compliance monitoring' },
  { module_name: 'Reports', module_key: 'reports', category: 'management', description: 'Audit reports generation' },

  // Administration
  { module_name: 'User Management', module_key: 'users', category: 'administration', description: 'Manage system users' },
  { module_name: 'Group Management', module_key: 'groups', category: 'administration', description: 'Manage user groups and permissions' },
  { module_name: 'Module Management', module_key: 'modules', category: 'administration', description: 'Configure system modules' },
  { module_name: 'Division Management', module_key: 'divisions', category: 'administration', description: 'Manage DLPP divisions' },
]

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [moduleForm, setModuleForm] = useState({
    module_name: '',
    module_key: '',
    description: '',
    category: 'core',
  })
  const [seeding, setSeeding] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('module_name')

      if (error) throw error
      setModules((data as Module[]) || [])
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async () => {
    if (!moduleForm.module_name.trim() || !moduleForm.module_key.trim()) {
      toast.error('Module name and key are required')
      return
    }

    const sanitizedKey = moduleForm.module_key
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')

    try {
      const { error } = await supabase.from('modules').insert({
        module_name: moduleForm.module_name,
        module_key: sanitizedKey,
        description: moduleForm.description || null,
        category: moduleForm.category,
      } as any)

      if (error) {
        if (error.code === '23505') {
          toast.error('A module with this key already exists')
        } else {
          throw error
        }
        return
      }

      toast.success('Module created successfully')
      setModuleForm({ module_name: '', module_key: '', description: '', category: 'core' })
      setIsCreating(false)
      loadModules()
    } catch (error: any) {
      console.error('Error creating module:', error)
      toast.error(error.message || 'Failed to create module')
    }
  }

  const handleUpdateModule = async (moduleId: string) => {
    if (!moduleForm.module_name.trim() || !moduleForm.module_key.trim()) {
      toast.error('Module name and key are required')
      return
    }

    const sanitizedKey = moduleForm.module_key
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')

    try {
      const { error } = await supabase
        .from('modules')
        .update({
          module_name: moduleForm.module_name,
          module_key: sanitizedKey,
          description: moduleForm.description || null,
          category: moduleForm.category,
        } as any)
        .eq('id', moduleId)

      if (error) throw error

      toast.success('Module updated successfully')
      setEditingModuleId(null)
      setModuleForm({ module_name: '', module_key: '', description: '', category: 'core' })
      loadModules()
    } catch (error: any) {
      console.error('Error updating module:', error)
      toast.error(error.message || 'Failed to update module')
    }
  }

  const handleDeleteModule = async (module: Module) => {
    if (
      !confirm(
        `Are you sure you want to delete "${module.module_name}"? This will remove all associated permissions.`
      )
    ) {
      return
    }

    try {
      const { error } = await supabase.from('modules').delete().eq('id', module.id)

      if (error) throw error

      toast.success('Module deleted successfully')
      loadModules()
    } catch (error: any) {
      console.error('Error deleting module:', error)
      toast.error(error.message || 'Failed to delete module')
    }
  }

  const handleSeedModules = async () => {
    if (modules.length > 0) {
      if (!confirm('This will add default modules. Existing modules will not be affected. Continue?')) {
        return
      }
    }

    try {
      setSeeding(true)

      // Get existing module keys
      const existingKeys = modules.map((m) => m.module_key)

      // Filter out modules that already exist
      const modulesToInsert = DEFAULT_MODULES.filter((m) => !existingKeys.includes(m.module_key))

      if (modulesToInsert.length === 0) {
        toast.info('All default modules already exist')
        return
      }

      const { error } = await supabase.from('modules').insert(modulesToInsert as any)

      if (error) throw error

      toast.success(`Successfully created ${modulesToInsert.length} module(s)!`)
      loadModules()
    } catch (error: any) {
      console.error('Error seeding modules:', error)
      toast.error(error.message || 'Failed to seed modules')
    } finally {
      setSeeding(false)
    }
  }

  const startEditModule = (module: Module) => {
    setEditingModuleId(module.id)
    setModuleForm({
      module_name: module.module_name,
      module_key: module.module_key,
      description: module.description || '',
      category: module.category || 'core',
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingModuleId(null)
    setIsCreating(false)
    setModuleForm({ module_name: '', module_key: '', description: '', category: 'core' })
  }

  // Group modules by category
  const groupedModules = modules.reduce((acc, module) => {
    const category = module.category || 'core'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(module)
    return acc
  }, {} as Record<string, Module[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading modules...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Module Management</h1>
            <p className="text-slate-500 mt-1">Configure system modules and features</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSeedModules}
            variant="outline"
            className="gap-2"
            disabled={seeding}
          >
            <Wand2 className="h-4 w-4" />
            {seeding ? 'Seeding...' : 'Seed Default Modules'}
          </Button>
          <Button
            onClick={() => {
              setIsCreating(true)
              setEditingModuleId(null)
              setModuleForm({ module_name: '', module_key: '', description: '', category: 'core' })
            }}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
            Create Module
          </Button>
        </div>
      </div>

      {/* Create Module Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Module</CardTitle>
            <CardDescription>Add a new module to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Module Name *</Label>
                <Input
                  value={moduleForm.module_name}
                  onChange={(e) => setModuleForm({ ...moduleForm, module_name: e.target.value })}
                  placeholder="e.g., Risk Register"
                />
              </div>
              <div className="space-y-2">
                <Label>Module Key *</Label>
                <Input
                  value={moduleForm.module_key}
                  onChange={(e) => setModuleForm({ ...moduleForm, module_key: e.target.value })}
                  placeholder="e.g., risk_register"
                />
                <p className="text-xs text-slate-500">
                  Lowercase letters, numbers, and underscores only
                </p>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={moduleForm.category}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreateModule} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-1" />
                Create Module
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle>System Modules ({modules.length})</CardTitle>
          <CardDescription>
            Modules represent different features of the system that can be assigned permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="mb-4">No modules found. Create some or seed default modules.</p>
              <Button onClick={handleSeedModules} disabled={seeding}>
                <Wand2 className="h-4 w-4 mr-2" />
                Seed Default Modules
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {MODULE_CATEGORIES.map((category) => {
                const categoryModules = groupedModules[category.value] || []
                if (categoryModules.length === 0) return null

                const CategoryIcon = categoryIcons[category.value] || Package

                return (
                  <div key={category.value} className="space-y-3">
                    <div className={`flex items-center gap-2 p-2 rounded-lg border ${category.color}`}>
                      <CategoryIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{category.label}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {categoryModules.length}
                      </Badge>
                    </div>

                    <div className="space-y-2 pl-4">
                      {categoryModules.map((module) => (
                        <div
                          key={module.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            editingModuleId === module.id
                              ? 'bg-amber-50 border-amber-300'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {editingModuleId === module.id ? (
                            <div className="space-y-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <Label className="text-xs">Module Name *</Label>
                                  <Input
                                    value={moduleForm.module_name}
                                    onChange={(e) =>
                                      setModuleForm({ ...moduleForm, module_name: e.target.value })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Module Key *</Label>
                                  <Input
                                    value={moduleForm.module_key}
                                    onChange={(e) =>
                                      setModuleForm({ ...moduleForm, module_key: e.target.value })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <Label className="text-xs">Category</Label>
                                  <Select
                                    value={moduleForm.category}
                                    onValueChange={(value) =>
                                      setModuleForm({ ...moduleForm, category: value })
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MODULE_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                          {cat.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Description</Label>
                                  <Input
                                    value={moduleForm.description}
                                    onChange={(e) =>
                                      setModuleForm({ ...moduleForm, description: e.target.value })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateModule(module.id)}
                                  className="flex-1"
                                >
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
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Package className="h-5 w-5 text-purple-600" />
                                  <h3 className="font-semibold text-lg">{module.module_name}</h3>
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {module.module_key}
                                  </Badge>
                                </div>
                                {module.description && (
                                  <p className="text-sm text-slate-600 mt-2 ml-7">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditModule(module)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteModule(module)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">About Modules</p>
              <ul className="text-sm text-purple-700 mt-2 space-y-1">
                <li>• Modules represent different features or sections of your system</li>
                <li>• Each module can have 7 types of permissions: Create, Read, Update, Delete, Print, Approve, Export</li>
                <li>• Groups are assigned permissions for specific modules</li>
                <li>• Module keys should be unique and use lowercase_with_underscores format</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
