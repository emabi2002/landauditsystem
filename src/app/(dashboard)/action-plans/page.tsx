'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Search, Edit, Trash2, Loader2, ClipboardCheck, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { useActionPlans } from '@/lib/hooks/useActionPlans'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { format } from 'date-fns'

type ActionPlan = Database['public']['Tables']['audit_action_plans']['Row']

const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Overdue']

const statusColors: Record<string, string> = {
  'Not Started': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
}

interface Lookup {
  id: string
  label: string
}

const emptyForm = {
  recommendation_id: '',
  planned_action: '',
  action_owner_id: 'none',
  progress_percentage: 0,
  status: 'Not Started',
  actual_completion_date: '',
  notes: '',
}

export default function ActionPlansPage() {
  const { actionPlans, loading, createActionPlan, updateActionPlan, deleteActionPlan } = useActionPlans()
  const supabase = createClientComponentClient<Database>()

  const [recs, setRecs] = useState<Lookup[]>([])
  const [people, setPeople] = useState<Lookup[]>([])
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ActionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActionPlan | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    supabase
      .from('audit_recommendations')
      .select('id, recommendation_text')
      .order('created_at', { ascending: false })
      .then(({ data }) =>
        setRecs(((data as any[]) || []).map((r) => ({ id: r.id, label: r.recommendation_text }))),
      )
    supabase
      .from('people')
      .select('id, full_name')
      .eq('active', true)
      .order('full_name')
      .then(({ data }) =>
        setPeople(((data as any[]) || []).map((p) => ({ id: p.id, label: p.full_name }))),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recText = (id: string | null) =>
    id ? recs.find((r) => r.id === id)?.label || '—' : '—'
  const ownerName = (id: string | null) =>
    id ? people.find((p) => p.id === id)?.label || '—' : '—'

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (p: ActionPlan) => {
    setEditing(p)
    setForm({
      recommendation_id: p.recommendation_id || '',
      planned_action: p.planned_action || '',
      action_owner_id: p.action_owner_id || 'none',
      progress_percentage: p.progress_percentage ?? 0,
      status: p.status || 'Not Started',
      actual_completion_date: p.actual_completion_date || '',
      notes: p.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recommendation_id) return toast.error('Please select a recommendation')
    if (!form.planned_action.trim()) return toast.error('Planned action is required')

    setSubmitting(true)
    const payload = {
      recommendation_id: form.recommendation_id,
      planned_action: form.planned_action.trim(),
      action_owner_id: form.action_owner_id !== 'none' ? form.action_owner_id : null,
      progress_percentage: Math.max(0, Math.min(100, Number(form.progress_percentage) || 0)),
      status: form.status,
      actual_completion_date: form.actual_completion_date || null,
      notes: form.notes.trim() || null,
    }
    const res = editing
      ? await updateActionPlan(editing.id, payload)
      : await createActionPlan(payload)
    setSubmitting(false)
    if (res.error) return toast.error(res.error.message)
    toast.success(editing ? 'Action plan updated' : 'Action plan created')
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const { error } = await deleteActionPlan(deleteTarget.id)
    setSubmitting(false)
    if (error) return toast.error(error.message)
    toast.success('Action plan deleted')
    setDeleteTarget(null)
  }

  const filtered = actionPlans.filter((p) =>
    (p.planned_action || '').toLowerCase().includes(search.toLowerCase()),
  )

  const inProgress = actionPlans.filter((p) => p.status === 'In Progress').length
  const completed = actionPlans.filter((p) => p.status === 'Completed').length
  const overdue = actionPlans.filter((p) => p.status === 'Overdue').length
  const avgProgress =
    actionPlans.length > 0
      ? Math.round(actionPlans.reduce((s, p) => s + (p.progress_percentage || 0), 0) / actionPlans.length)
      : 0

  return (
    <>
      <PageHeader
        icon={ClipboardCheck}
        title="Action Plans"
        subtitle="Monitor implementation progress against recommendations"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Action Plan
            </Button>
            <HelpTooltip tooltipKey="action-plans-new" label="New Action Plan" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{inProgress}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{avgProgress}%</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card data-tour="filters" className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search action plans..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <HelpTooltip tooltipKey="action-plans-search" label="Search action plans" side="left" />
            </div>
          </Card>

          {/* Table */}
          <Card data-tour="table">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>{actionPlans.length === 0 ? 'No action plans yet. Create your first one.' : 'No matches.'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Recommendation</TableHead>
                    <TableHead className="font-semibold">Owner</TableHead>
                    <TableHead className="font-semibold w-[160px]">Progress</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium max-w-xs">
                        <p className="line-clamp-2">{p.planned_action}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[180px] truncate">
                        {recText(p.recommendation_id)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{ownerName(p.action_owner_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (p.progress_percentage || 0) >= 100
                                  ? 'bg-green-500'
                                  : p.status === 'Overdue'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, p.progress_percentage || 0)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-9 text-right">
                            {p.progress_percentage || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[p.status] || 'bg-slate-100 text-slate-700'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget(p)}
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
          </Card>
        </div>
      </PageContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Action Plan' : 'New Action Plan'}</DialogTitle>
              <DialogDescription>Track implementation of a published recommendation.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Recommendation *</Label>
                <Select value={form.recommendation_id} onValueChange={(v) => setForm({ ...form, recommendation_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    {recs.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-slate-500">No recommendations yet.</div>
                    ) : (
                      recs.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="line-clamp-1">{r.label}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Planned Action *</Label>
                <Textarea
                  placeholder="Describe the action to be taken..."
                  rows={3}
                  value={form.planned_action}
                  onChange={(e) => setForm({ ...form, planned_action: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Action Owner</Label>
                    <HelpTooltip tooltipKey="action-owner" label="Action Owner" />
                  </div>
                  <Select value={form.action_owner_id} onValueChange={(v) => setForm({ ...form, action_owner_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Progress (%)</Label>
                    <HelpTooltip tooltipKey="action-progress" label="Progress" />
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.progress_percentage}
                    onChange={(e) => setForm({ ...form, progress_percentage: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Completion Date</Label>
                  <Input
                    type="date"
                    value={form.actual_completion_date}
                    onChange={(e) => setForm({ ...form, actual_completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Progress notes, blockers, evidence references..."
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Action Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action Plan</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
