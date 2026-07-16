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
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { useFindings } from '@/lib/hooks/useFindings'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Finding = Database['public']['Tables']['audit_findings']['Row']

const RISK_RATINGS = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Draft', 'Under Review', 'Closed']

const ratingColors: Record<string, string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}
const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Closed: 'bg-green-100 text-green-700',
}

interface EngagementLite {
  id: string
  title: string
}

const emptyForm = {
  engagement_id: '',
  title: '',
  condition_found: '',
  criteria: '',
  cause: '',
  effect: '',
  risk_rating: 'Medium',
  status: 'Draft',
}

export default function FindingsPage() {
  const { findings, loading, createFinding, updateFinding, deleteFinding } = useFindings()
  const supabase = createClientComponentClient<Database>()

  const [engagements, setEngagements] = useState<EngagementLite[]>([])
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Finding | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Finding | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    supabase
      .from('audit_engagements')
      .select('id, title')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEngagements((data as EngagementLite[]) || []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const engagementTitle = (id: string | null) =>
    id ? engagements.find((e) => e.id === id)?.title || '—' : '—'

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (f: Finding) => {
    setEditing(f)
    setForm({
      engagement_id: f.engagement_id || '',
      title: f.title || '',
      condition_found: f.condition_found || '',
      criteria: f.criteria || '',
      cause: f.cause || '',
      effect: f.effect || '',
      risk_rating: f.risk_rating || 'Medium',
      status: f.status || 'Draft',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.engagement_id) return toast.error('Please select an engagement')
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.condition_found.trim()) return toast.error('Condition (what was found) is required')

    setSubmitting(true)
    const payload = {
      engagement_id: form.engagement_id,
      title: form.title.trim(),
      condition_found: form.condition_found.trim(),
      criteria: form.criteria.trim() || null,
      cause: form.cause.trim() || null,
      effect: form.effect.trim() || null,
      risk_rating: form.risk_rating,
      status: form.status,
    }
    const res = editing
      ? await updateFinding(editing.id, payload)
      : await createFinding(payload)
    setSubmitting(false)
    if (res.error) return toast.error(res.error.message)
    toast.success(editing ? 'Finding updated' : 'Finding created')
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const { error } = await deleteFinding(deleteTarget.id)
    setSubmitting(false)
    if (error) return toast.error(error.message)
    toast.success('Finding deleted')
    setDeleteTarget(null)
  }

  const filtered = findings.filter(
    (f) =>
      (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.condition_found || '').toLowerCase().includes(search.toLowerCase()),
  )

  const criticalHigh = findings.filter((f) => ['Critical', 'High'].includes(f.risk_rating)).length
  const underReview = findings.filter((f) => f.status === 'Under Review').length
  const closed = findings.filter((f) => f.status === 'Closed').length

  return (
    <>
      <PageHeader
        icon={AlertTriangle}
        title="Findings"
        subtitle="Register and track audit findings with risk ratings"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Finding
            </Button>
            <HelpTooltip tooltipKey="findings-new" label="New Finding" side="left" />
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
                  <p className="text-sm text-slate-600">Total Findings</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{findings.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Critical / High</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{criticalHigh}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{underReview}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Closed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{closed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card data-tour="filters" className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search findings..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <HelpTooltip tooltipKey="findings-search" label="Search findings" side="left" />
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
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>{findings.length === 0 ? 'No findings yet. Create your first one.' : 'No matches.'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Finding</TableHead>
                    <TableHead className="font-semibold">Engagement</TableHead>
                    <TableHead className="font-semibold">Risk Rating</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f) => (
                    <TableRow key={f.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium max-w-sm">
                        {f.title}
                        {f.condition_found && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{f.condition_found}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                        {engagementTitle(f.engagement_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={ratingColors[f.risk_rating] || 'bg-slate-100 text-slate-700'}>
                          {f.risk_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[f.status] || 'bg-slate-100 text-slate-700'}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {f.created_at ? format(new Date(f.created_at), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget(f)}
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
              <DialogTitle>{editing ? 'Edit Finding' : 'New Finding'}</DialogTitle>
              <DialogDescription>
                A finding follows the audit structure: Condition, Criteria, Cause and Effect.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Engagement *</Label>
                  <Select value={form.engagement_id} onValueChange={(v) => setForm({ ...form, engagement_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engagement" />
                    </SelectTrigger>
                    <SelectContent>
                      {engagements.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500">No engagements yet.</div>
                      ) : (
                        engagements.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Risk Rating *</Label>
                    <HelpTooltip tooltipKey="finding-rating" label="Risk Rating" />
                  </div>
                  <Select value={form.risk_rating} onValueChange={(v) => setForm({ ...form, risk_rating: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_RATINGS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Short descriptive title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Condition — what was found *</Label>
                <Textarea
                  placeholder="Describe the condition observed during the audit..."
                  rows={2}
                  value={form.condition_found}
                  onChange={(e) => setForm({ ...form, condition_found: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Criteria — what should be</Label>
                <Textarea
                  placeholder="The standard, policy or regulation that applies..."
                  rows={2}
                  value={form.criteria}
                  onChange={(e) => setForm({ ...form, criteria: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cause</Label>
                  <Textarea
                    placeholder="Why the condition occurred..."
                    rows={2}
                    value={form.cause}
                    onChange={(e) => setForm({ ...form, cause: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effect</Label>
                  <Textarea
                    placeholder="The impact or risk..."
                    rows={2}
                    value={form.effect}
                    onChange={(e) => setForm({ ...form, effect: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 max-w-[220px]">
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
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Finding'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Finding</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
            </DialogDescription>
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
