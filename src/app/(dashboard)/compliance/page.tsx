'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, Search, Shield, FileText, ListChecks, Edit, Trash2, Loader2 } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { useCompliance, type Obligation, type Control } from '@/lib/hooks/useCompliance'
import { toast } from 'sonner'

const SOURCES = ['Act', 'Regulation', 'Policy', 'Standard', 'Directive', 'Guideline', 'Other']
const CATEGORIES = ['National', 'Internal', 'International', 'Sector', 'Departmental']
const CONTROL_TYPES = ['Preventive', 'Detective', 'Corrective', 'Directive', 'Compensating']
const FREQUENCIES = ['Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Ad-hoc']
const EFFECTIVENESS = ['Effective', 'Partially Effective', 'Ineffective', 'Not Tested']

export default function CompliancePage() {
  const { obligations, controls, orgUnits, loading, create, update, remove } = useCompliance()
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Obligation dialog
  const [oblOpen, setOblOpen] = useState(false)
  const [editingObl, setEditingObl] = useState<Obligation | null>(null)
  const [oblForm, setOblForm] = useState({
    title: '',
    source: 'Act',
    category: 'National',
    description: '',
    owner_unit_id: 'none',
  })

  // Control dialog
  const [ctrlOpen, setCtrlOpen] = useState(false)
  const [editingCtrl, setEditingCtrl] = useState<Control | null>(null)
  const [ctrlForm, setCtrlForm] = useState({
    title: '',
    control_type: 'Preventive',
    frequency: 'Quarterly',
    effectiveness: 'Not Tested',
    description: '',
    owner_unit_id: 'none',
    obligation_id: 'none',
  })

  const orgName = (id: string | null) =>
    id ? orgUnits.find((u) => u.id === id)?.name || '—' : '—'
  const oblTitle = (id: string | null) =>
    id ? obligations.find((o) => o.id === id)?.title || '—' : '—'

  const controlsByObligation = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of controls) {
      if (c.obligation_id) map.set(c.obligation_id, (map.get(c.obligation_id) || 0) + 1)
    }
    return map
  }, [controls])

  const filteredObligations = obligations.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.source || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.category || '').toLowerCase().includes(search.toLowerCase()),
  )
  const filteredControls = controls.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.control_type || '').toLowerCase().includes(search.toLowerCase()),
  )

  const nationalCount = obligations.filter((o) => o.category === 'National').length
  const internalCount = obligations.filter((o) => o.category === 'Internal').length

  // ---- Obligation handlers --------------------------------------------------
  const openCreateObl = () => {
    setEditingObl(null)
    setOblForm({ title: '', source: 'Act', category: 'National', description: '', owner_unit_id: 'none' })
    setOblOpen(true)
  }
  const openEditObl = (o: Obligation) => {
    setEditingObl(o)
    setOblForm({
      title: o.title,
      source: o.source || 'Act',
      category: o.category || 'National',
      description: o.description || '',
      owner_unit_id: o.owner_unit_id || 'none',
    })
    setOblOpen(true)
  }
  const submitObl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oblForm.title.trim()) return toast.error('Title is required')
    setSubmitting(true)
    const values = {
      title: oblForm.title.trim(),
      source: oblForm.source,
      category: oblForm.category,
      description: oblForm.description,
      owner_unit_id: oblForm.owner_unit_id !== 'none' ? oblForm.owner_unit_id : null,
    }
    const res = editingObl
      ? await update('obligation', editingObl.id, values)
      : await create('obligation', values)
    setSubmitting(false)
    if (res.error) return toast.error(res.error)
    toast.success(editingObl ? 'Obligation updated' : 'Obligation created')
    setOblOpen(false)
  }
  const deleteObl = async (o: Obligation) => {
    if (!confirm(`Delete obligation "${o.title}"? Linked controls will be detached.`)) return
    const res = await remove('obligation', o.id)
    if (res.error) return toast.error(res.error)
    toast.success('Obligation deleted')
  }

  // ---- Control handlers -----------------------------------------------------
  const openCreateCtrl = () => {
    setEditingCtrl(null)
    setCtrlForm({
      title: '',
      control_type: 'Preventive',
      frequency: 'Quarterly',
      effectiveness: 'Not Tested',
      description: '',
      owner_unit_id: 'none',
      obligation_id: 'none',
    })
    setCtrlOpen(true)
  }
  const openEditCtrl = (c: Control) => {
    setEditingCtrl(c)
    setCtrlForm({
      title: c.title,
      control_type: c.control_type || 'Preventive',
      frequency: c.frequency || 'Quarterly',
      effectiveness: c.effectiveness || 'Not Tested',
      description: c.description || '',
      owner_unit_id: c.owner_unit_id || 'none',
      obligation_id: c.obligation_id || 'none',
    })
    setCtrlOpen(true)
  }
  const submitCtrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctrlForm.title.trim()) return toast.error('Title is required')
    setSubmitting(true)
    const values = {
      title: ctrlForm.title.trim(),
      control_type: ctrlForm.control_type,
      frequency: ctrlForm.frequency,
      effectiveness: ctrlForm.effectiveness,
      description: ctrlForm.description,
      owner_unit_id: ctrlForm.owner_unit_id !== 'none' ? ctrlForm.owner_unit_id : null,
      obligation_id: ctrlForm.obligation_id !== 'none' ? ctrlForm.obligation_id : null,
    }
    const res = editingCtrl
      ? await update('control', editingCtrl.id, values)
      : await create('control', values)
    setSubmitting(false)
    if (res.error) return toast.error(res.error)
    toast.success(editingCtrl ? 'Control updated' : 'Control created')
    setCtrlOpen(false)
  }
  const deleteCtrl = async (c: Control) => {
    if (!confirm(`Delete control "${c.title}"?`)) return
    const res = await remove('control', c.id)
    if (res.error) return toast.error(res.error)
    toast.success('Control deleted')
  }

  const effColor = (e: string | null) => {
    switch (e) {
      case 'Effective':
        return 'bg-green-100 text-green-700'
      case 'Partially Effective':
        return 'bg-yellow-100 text-yellow-700'
      case 'Ineffective':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <>
      <PageHeader
        icon={Shield}
        title="Compliance Obligations"
        subtitle="Manage legal and regulatory obligations and their controls"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreateObl}>
              <Plus className="mr-2 h-4 w-4" />
              New Obligation
            </Button>
            <HelpTooltip tooltipKey="compliance-new" label="New Obligation" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Obligations</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{obligations.length}</p>
                </div>
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Controls</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{controls.length}</p>
                </div>
                <ListChecks className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">National Level</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{nationalCount}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Internal Level</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{internalCount}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card data-tour="filters" className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search obligations and controls..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <HelpTooltip tooltipKey="compliance-search" label="Search obligations" side="left" />
            </div>
          </Card>

          <Tabs defaultValue="obligations" className="space-y-4">
            <TabsList data-tour="tabs">
              <TabsTrigger value="obligations">Obligations ({obligations.length})</TabsTrigger>
              <TabsTrigger value="controls">Controls ({controls.length})</TabsTrigger>
            </TabsList>

            {/* Obligations */}
            <TabsContent value="obligations">
              <Card data-tour="table">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Legal &amp; Regulatory Obligations</CardTitle>
                    <CardDescription>Requirements the department must comply with</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={openCreateObl}>
                    <Plus className="mr-2 h-4 w-4" /> Add Obligation
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading obligations...</div>
                  ) : filteredObligations.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>{obligations.length === 0 ? 'No obligations yet. Add your first one.' : 'No matches.'}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Title</TableHead>
                          <TableHead className="font-semibold">Source</TableHead>
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold">Owner Unit</TableHead>
                          <TableHead className="font-semibold text-center">Controls</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredObligations.map((o) => (
                          <TableRow key={o.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">
                              {o.title}
                              {o.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{o.description}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{o.source || '—'}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{o.category || '—'}</TableCell>
                            <TableCell className="text-sm text-slate-600">{orgName(o.owner_unit_id)}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-slate-100 text-sm font-medium">
                                {controlsByObligation.get(o.id) || 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEditObl(o)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => deleteObl(o)}
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
            </TabsContent>

            {/* Controls */}
            <TabsContent value="controls">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Controls</CardTitle>
                    <CardDescription>Controls that mitigate compliance obligations</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={openCreateCtrl}>
                    <Plus className="mr-2 h-4 w-4" /> Add Control
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading controls...</div>
                  ) : filteredControls.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <ListChecks className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>{controls.length === 0 ? 'No controls yet. Add your first one.' : 'No matches.'}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Title</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Frequency</TableHead>
                          <TableHead className="font-semibold">Obligation</TableHead>
                          <TableHead className="font-semibold">Effectiveness</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredControls.map((c) => (
                          <TableRow key={c.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">
                              {c.title}
                              {c.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{c.control_type || '—'}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{c.frequency || '—'}</TableCell>
                            <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                              {oblTitle(c.obligation_id)}
                            </TableCell>
                            <TableCell>
                              <Badge className={effColor(c.effectiveness)}>{c.effectiveness || 'Not Tested'}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEditCtrl(c)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => deleteCtrl(c)}
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
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>

      {/* Obligation Dialog */}
      <Dialog open={oblOpen} onOpenChange={setOblOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingObl ? 'Edit Obligation' : 'New Obligation'}</DialogTitle>
            <DialogDescription>A legal or regulatory requirement to comply with.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitObl}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g. Public Finances (Management) Act"
                  value={oblForm.title}
                  onChange={(e) => setOblForm({ ...oblForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source *</Label>
                  <Select value={oblForm.source} onValueChange={(v) => setOblForm({ ...oblForm, source: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={oblForm.category} onValueChange={(v) => setOblForm({ ...oblForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Owner Unit</Label>
                <Select
                  value={oblForm.owner_unit_id}
                  onValueChange={(v) => setOblForm({ ...oblForm, owner_unit_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {orgUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What does this obligation require?"
                  value={oblForm.description}
                  onChange={(e) => setOblForm({ ...oblForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOblOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingObl ? 'Save Changes' : 'Create Obligation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Control Dialog */}
      <Dialog open={ctrlOpen} onOpenChange={setCtrlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCtrl ? 'Edit Control' : 'New Control'}</DialogTitle>
            <DialogDescription>A control that mitigates a compliance obligation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCtrl}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g. Monthly bank reconciliation"
                  value={ctrlForm.title}
                  onChange={(e) => setCtrlForm({ ...ctrlForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Control Type</Label>
                  <Select
                    value={ctrlForm.control_type}
                    onValueChange={(v) => setCtrlForm({ ...ctrlForm, control_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTROL_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={ctrlForm.frequency}
                    onValueChange={(v) => setCtrlForm({ ...ctrlForm, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effectiveness</Label>
                  <Select
                    value={ctrlForm.effectiveness}
                    onValueChange={(v) => setCtrlForm({ ...ctrlForm, effectiveness: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EFFECTIVENESS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Owner Unit</Label>
                  <Select
                    value={ctrlForm.owner_unit_id}
                    onValueChange={(v) => setCtrlForm({ ...ctrlForm, owner_unit_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {orgUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Linked Obligation</Label>
                <Select
                  value={ctrlForm.obligation_id}
                  onValueChange={(v) => setCtrlForm({ ...ctrlForm, obligation_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {obligations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the control..."
                  value={ctrlForm.description}
                  onChange={(e) => setCtrlForm({ ...ctrlForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCtrlOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCtrl ? 'Save Changes' : 'Create Control'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
