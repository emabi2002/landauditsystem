'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  FolderOpen,
  Edit,
  Trash2,
  Loader2,
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { useWorkpapers, type WorkpaperWithEngagement } from '@/lib/hooks/useWorkpapers'
import { useEngagements } from '@/lib/hooks/useEngagements'
import { CreateWorkpaperDialog } from '@/components/dialogs/CreateWorkpaperDialog'

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'In Review': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
}

const ratingColors: Record<string, string> = {
  Effective: 'bg-green-100 text-green-800 border-green-200',
  'Partially Effective': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Ineffective: 'bg-red-100 text-red-800 border-red-200',
  'Not Concluded': 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function FieldworkPage() {
  const {
    workpapers,
    loading,
    stats,
    fetchWorkpapers,
    createWorkpaper,
    updateWorkpaper,
    deleteWorkpaper,
    fetchEvidence,
    uploadEvidence,
    getEvidenceUrl,
    deleteEvidence,
  } = useWorkpapers()
  const { engagements } = useEngagements()

  const [search, setSearch] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkpaperWithEngagement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkpaperWithEngagement | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    return workpapers.filter((w) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (w.wp_number || '').toLowerCase().includes(q) ||
        (w.audit_engagements?.title || '').toLowerCase().includes(q)
      const matchesEngagement = engagementFilter === 'all' || w.engagement_id === engagementFilter
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter
      return matchesSearch && matchesEngagement && matchesStatus
    })
  }, [workpapers, search, engagementFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (wp: WorkpaperWithEngagement) => {
    setEditing(wp)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await deleteWorkpaper(deleteTarget.id)
    if (error) {
      toast.error('Failed to delete workpaper: ' + error.message)
    } else {
      toast.success('Workpaper deleted')
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <>
      <PageHeader
        icon={FolderOpen}
        title="Fieldwork"
        subtitle="Document workpapers, procedures, conclusions and evidence"
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Workpaper
            </Button>
            <HelpTooltip tooltipKey="fieldwork-new" label="New Workpaper" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Workpapers</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Draft</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.draft}</p>
                </div>
                <FileEdit className="h-8 w-8 text-slate-400" />
              </div>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Review</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inReview}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card data-tour="filters" className="p-4 bg-white border-slate-200">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search workpapers by title, number or engagement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <HelpTooltip tooltipKey="fieldwork-search" label="Search workpapers" />
              <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Engagement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engagements</SelectItem>
                  {engagements.map((eng) => (
                    <SelectItem key={eng.id} value={eng.id}>
                      {eng.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <HelpTooltip tooltipKey="fieldwork-filter" label="Filter by engagement" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card data-tour="table" className="bg-white border-slate-200">
            <div className="flex items-center gap-1.5 px-6 pt-5">
              <h3 className="text-sm font-semibold text-slate-800">Workpapers</h3>
              <HelpTooltip tooltipKey="fieldwork-table" label="Workpapers" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-12">
                <FolderOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">
                  {workpapers.length === 0
                    ? 'No workpapers yet. Create your first workpaper for an engagement.'
                    : 'No workpapers match your filters.'}
                </p>
                {workpapers.length === 0 && (
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Workpaper
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">WP #</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Engagement</TableHead>
                    <TableHead className="font-semibold">Conclusion</TableHead>
                    <TableHead className="font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        Status <HelpTooltip content="Draft → In Review → Completed workflow state of this workpaper." label="Status" />
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold">Prepared By</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((wp) => (
                    <TableRow key={wp.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-xs text-slate-600">
                        {wp.wp_number || '—'}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{wp.title}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {wp.audit_engagements?.title || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ratingColors[wp.conclusion_rating]}>
                          {wp.conclusion_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[wp.status]}>{wp.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {wp.prepared_by || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(wp)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setDeleteTarget(wp)}
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

      {/* Create / Edit dialog */}
      <CreateWorkpaperDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchWorkpapers}
        engagements={engagements}
        workpaper={editing}
        createWorkpaper={createWorkpaper}
        updateWorkpaper={updateWorkpaper}
        fetchEvidence={fetchEvidence}
        uploadEvidence={uploadEvidence}
        getEvidenceUrl={getEvidenceUrl}
        deleteEvidence={deleteEvidence}
      />

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workpaper</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This also removes its
              linked evidence records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
