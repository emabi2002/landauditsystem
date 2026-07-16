'use client'

import { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Plus, Edit, Trash2, Search, Network, CheckCircle2 } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { toast } from 'sonner'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

interface OrgUnit {
  id: string
  code: string
  name: string
  unit_type: string | null
  parent_id: string | null
  is_active: boolean
  created_at: string
}

const UNIT_TYPES = ['Division', 'Section', 'Unit', 'Branch', 'Office', 'Directorate']

export default function OrgUnitsPage() {
  const supabase = createClientComponentClient<Database>()

  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OrgUnit | null>(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    unit_type: 'Division',
    parent_id: 'none',
    is_active: true,
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('org_units').select('*').order('name')
      if (error) throw error
      setOrgUnits((data as OrgUnit[]) || [])
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load organizational units')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ code: '', name: '', unit_type: 'Division', parent_id: 'none', is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (unit: OrgUnit) => {
    setEditing(unit)
    setForm({
      code: unit.code || '',
      name: unit.name || '',
      unit_type: unit.unit_type || 'Division',
      parent_id: unit.parent_id || 'none',
      is_active: unit.is_active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        name: form.name.trim(),
        unit_type: form.unit_type,
        parent_id: form.parent_id !== 'none' ? form.parent_id : null,
        is_active: form.is_active,
      }
      if (editing) {
        const { error } = await supabase
          .from('org_units')
          .update({ ...payload, updated_at: new Date().toISOString() } as any)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Organizational unit updated')
      } else {
        const { error } = await supabase.from('org_units').insert(payload as any)
        if (error) {
          if (error.code === '23505') {
            toast.error('A unit with this code already exists')
            return
          }
          throw error
        }
        toast.success('Organizational unit created')
      }
      setDialogOpen(false)
      loadData()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to save unit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (unit: OrgUnit) => {
    const children = orgUnits.filter((u) => u.parent_id === unit.id)
    if (children.length > 0) {
      toast.error(`Cannot delete "${unit.name}" — it has ${children.length} child unit(s).`)
      return
    }
    if (!confirm(`Delete "${unit.name}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('org_units').delete().eq('id', unit.id)
      if (error) throw error
      toast.success('Organizational unit deleted')
      loadData()
    } catch (e: any) {
      console.error(e)
      // FK violations (unit referenced by assessments/KRAs) surface here.
      toast.error(
        e.message?.includes('violates foreign key')
          ? 'Cannot delete: this unit is referenced by assessments or KRAs.'
          : e.message || 'Failed to delete unit',
      )
    }
  }

  const filtered = orgUnits.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.code || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const parentName = (id: string | null) =>
    id ? orgUnits.find((u) => u.id === id)?.name || '—' : '—'
  const activeCount = orgUnits.filter((u) => u.is_active).length

  return (
    <>
      <PageHeader
        icon={Building2}
        title="Organizational Units"
        subtitle="Manage the org units used across PSAP, KRA and Compliance"
        backHref="/admin"
        actions={
          <Button size="sm" onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Org Unit
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Units</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{orgUnits.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Divisions</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {orgUnits.filter((u) => u.unit_type === 'Division').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Network className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search units by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Units ({filtered.length})</CardTitle>
              <CardDescription>
                These units populate the Organization Unit dropdowns in PSAP Scorecard, KRA &amp;
                Workplan and Compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading units...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>{orgUnits.length === 0 ? 'No units yet. Add your first one.' : 'No matches.'}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Parent</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {unit.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        <TableCell className="text-slate-600">{unit.unit_type || '—'}</TableCell>
                        <TableCell className="text-slate-600">{parentName(unit.parent_id)}</TableCell>
                        <TableCell>
                          {unit.is_active ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(unit)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(unit)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Organizational Unit' : 'New Organizational Unit'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this unit.' : 'Create a unit for assessments, KRAs and compliance.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    placeholder="e.g. LTR"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.unit_type} onValueChange={(v) => setForm({ ...form, unit_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Land Titles Registry"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Unit</Label>
                <Select value={form.parent_id} onValueChange={(v) => setForm({ ...form, parent_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="None (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {orgUnits
                      .filter((u) => !editing || u.id !== editing.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.is_active ? 'active' : 'inactive'}
                  onValueChange={(v) => setForm({ ...form, is_active: v === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
