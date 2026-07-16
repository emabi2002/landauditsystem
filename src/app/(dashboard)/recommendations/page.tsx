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
import { Plus, Search, Edit, Trash2, Loader2, CheckCircle, Send, ListChecks } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { useRecommendations } from '@/lib/hooks/useRecommendations'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Recommendation = Database['public']['Tables']['audit_recommendations']['Row']

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Draft', 'In Progress', 'Accepted', 'Published']

const priorityColors: Record<string, string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}
const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Accepted: 'bg-violet-100 text-violet-700',
  Published: 'bg-green-100 text-green-700',
}

interface FindingLite {
  id: string
  title: string
}

const emptyForm = {
  finding_id: '',
  recommendation_text: '',
  priority: 'Medium',
  status: 'Draft',
  target_date: '',
}

export default function RecommendationsPage() {
  const { recommendations, loading, createRecommendation, updateRecommendation, deleteRecommendation } =
    useRecommendations()
  const supabase = createClientComponentClient<Database>()

  const [findings, setFindings] = useState<FindingLite[]>([])
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Recommendation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recommendation | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    supabase
      .from('audit_findings')
      .select('id, title')
      .order('created_at', { ascending: false })
      .then(({ data }) => setFindings((data as FindingLite[]) || []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findingTitle = (id: string | null) =>
    id ? findings.find((f) => f.id === id)?.title || '—' : '—'

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (r: Recommendation) => {
    setEditing(r)
    setForm({
      finding_id: r.finding_id || '',
      recommendation_text: r.recommendation_text || '',
      priority: r.priority || 'Medium',
      status: r.status || 'Draft',
      target_date: r.target_date || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.finding_id) return toast.error('Please select a finding')
    if (!form.recommendation_text.trim()) return toast.error('Recommendation text is required')

    setSubmitting(true)
    const payload = {
      finding_id: form.finding_id,
      recommendation_text: form.recommendation_text.trim(),
      priority: form.priority,
      status: form.status,
      target_date: form.target_date || null,
    }
    const res = editing
      ? await updateRecommendation(editing.id, payload)
      : await createRecommendation(payload)
    setSubmitting(false)
    if (res.error) return toast.error(res.error.message)
    toast.success(editing ? 'Recommendation updated' : 'Recommendation created')
    setDialogOpen(false)
  }

  const handlePublish = async (r: Recommendation) => {
    const res = await updateRecommendation(r.id, {
      status: 'Published',
      published_at: new Date().toISOString(),
    } as Partial<Recommendation>)
    if (res.error) return toast.error(res.error.message)
    toast.success('Recommendation published')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const { error } = await deleteRecommendation(deleteTarget.id)
    setSubmitting(false)
    if (error) return toast.error(error.message)
    toast.success('Recommendation deleted')
    setDeleteTarget(null)
  }

  const filtered = recommendations.filter((r) =>
    (r.recommendation_text || '').toLowerCase().includes(search.toLowerCase()),
  )

  const criticalHigh = recommendations.filter((r) => ['Critical', 'High'].includes(r.priority)).length
  const published = recommendations.filter((r) => r.status === 'Published').length
  const inProgress = recommendations.filter((r) => r.status === 'In Progress').length

  return (
    <>
      <PageHeader
        icon={CheckCircle}
        title="Recommendations"
        subtitle="Create, prioritise and publish actionable recommendations"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Recommendation
            </Button>
            <HelpTooltip tooltipKey="recommendations-new" label="New Recommendation" side="left" />
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
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{recommendations.length}</p>
                </div>
                <ListChecks className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Critical / High</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{criticalHigh}</p>
                </div>
                <ListChecks className="h-8 w-8 text-red-400" />
              </div>
            </Card>
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
                  <p className="text-sm text-slate-600">Published</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{published}</p>
                </div>
                <Send className="h-8 w-8 text-green-400" />
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card data-tour="filters" className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search recommendations..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <HelpTooltip tooltipKey="recommendations-search" label="Search recommendations" side="left" />
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
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>{recommendations.length === 0 ? 'No recommendations yet. Create your first one.' : 'No matches.'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Recommendation</TableHead>
                    <TableHead className="font-semibold">Finding</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Target Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium max-w-sm">
                        <p className="line-clamp-2">{r.recommendation_text}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[180px] truncate">
                        {findingTitle(r.finding_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[r.priority] || 'bg-slate-100 text-slate-700'}>
                          {r.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[r.status] || 'bg-slate-100 text-slate-700'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {r.target_date ? format(new Date(r.target_date), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status !== 'Published' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Publish"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handlePublish(r)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget(r)}
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
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Recommendation' : 'New Recommendation'}</DialogTitle>
              <DialogDescription>Recommendations are anchored to an audit finding.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Finding *</Label>
                <Select value={form.finding_id} onValueChange={(v) => setForm({ ...form, finding_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select finding" />
                  </SelectTrigger>
                  <SelectContent>
                    {findings.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-slate-500">No findings yet.</div>
                    ) : (
                      findings.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recommendation *</Label>
                <Textarea
                  placeholder="Describe the recommended action..."
                  rows={4}
                  value={form.recommendation_text}
                  onChange={(e) => setForm({ ...form, recommendation_text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Priority</Label>
                    <HelpTooltip tooltipKey="recommendation-priority" label="Priority" />
                  </div>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
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
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Recommendation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recommendation</DialogTitle>
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
