'use client'

import { useState } from 'react'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEngagements } from '@/lib/hooks/useEngagements'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Database } from '@/lib/database.types'

type Engagement = Database['public']['Tables']['engagements']['Row']

const statusColors = {
  Planning: 'bg-blue-100 text-blue-700',
  Fieldwork: 'bg-purple-100 text-purple-700',
  Reporting: 'bg-orange-100 text-orange-700',
  'Follow-up': 'bg-yellow-100 text-yellow-700',
  Closed: 'bg-green-100 text-green-700',
}

export default function EngagementsPage() {
  const { engagements, loading, createEngagement, updateEngagement, deleteEngagement } = useEngagements()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    scope: string
    objectives: string
    start_date: string
    end_date: string
    status: 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed'
  }>({
    title: '',
    scope: '',
    objectives: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
  })

  const resetForm = () => {
    setFormData({
      title: '',
      scope: '',
      objectives: '',
      start_date: '',
      end_date: '',
      status: 'Planning',
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data, error } = await createEngagement(formData)

    if (error) {
      toast.error('Failed to create engagement: ' + error.message)
    } else {
      toast.success('Engagement created successfully')
      setIsCreateOpen(false)
      resetForm()
    }
    setSubmitting(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEngagement) return

    setSubmitting(true)
    const { data, error } = await updateEngagement(selectedEngagement.id, formData)

    if (error) {
      toast.error('Failed to update engagement: ' + error.message)
    } else {
      toast.success('Engagement updated successfully')
      setIsEditOpen(false)
      setSelectedEngagement(null)
      resetForm()
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedEngagement) return

    setSubmitting(true)
    const { error } = await deleteEngagement(selectedEngagement.id)

    if (error) {
      toast.error('Failed to delete engagement: ' + error.message)
    } else {
      toast.success('Engagement deleted successfully')
      setIsDeleteOpen(false)
      setSelectedEngagement(null)
    }
    setSubmitting(false)
  }

  const openEdit = (engagement: Engagement) => {
    setSelectedEngagement(engagement)
    setFormData({
      title: engagement.title,
      scope: engagement.scope || '',
      objectives: engagement.objectives || '',
      start_date: engagement.start_date,
      end_date: engagement.end_date || '',
      status: engagement.status,
    })
    setIsEditOpen(true)
  }

  const openView = (engagement: Engagement) => {
    setSelectedEngagement(engagement)
    setIsViewOpen(true)
  }

  const openDelete = (engagement: Engagement) => {
    setSelectedEngagement(engagement)
    setIsDeleteOpen(true)
  }

  const filteredEngagements = engagements.filter(eng =>
    eng.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Engagements</h1>
          <p className="text-slate-500 mt-1">
            Manage audit engagements and their lifecycle
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              New Engagement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Engagement</DialogTitle>
                <DialogDescription>
                  Set up a new audit engagement with scope and objectives
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Title *</label>
                  <Input
                    required
                    placeholder="e.g., IT Security Audit 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date *</label>
                    <Input
                      required
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                      <SelectItem value="Reporting">Reporting</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Scope</label>
                  <Textarea
                    placeholder="Define the scope of the audit..."
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Objectives</label>
                  <Textarea
                    placeholder="Define the objectives of the audit..."
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetForm()
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Engagement'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search engagements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </Card>

      {/* Engagements Table */}
      <Card className="bg-white border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredEngagements.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-slate-500">No engagements found. Create your first engagement to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Timeline</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEngagements.map((engagement) => (
                <TableRow key={engagement.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{engagement.title}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[engagement.status as keyof typeof statusColors]}>
                      {engagement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {engagement.start_date} to {engagement.end_date || 'Ongoing'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {engagement.created_at ? format(new Date(engagement.created_at), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openView(engagement)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(engagement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => openDelete(engagement)}>
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

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEngagement?.title}</DialogTitle>
            <DialogDescription>Engagement Details</DialogDescription>
          </DialogHeader>
          {selectedEngagement && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="mt-1">
                  <Badge className={statusColors[selectedEngagement.status as keyof typeof statusColors]}>
                    {selectedEngagement.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedEngagement.start_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedEngagement.end_date || 'Ongoing'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Scope</label>
                <p className="mt-1 text-sm text-slate-900">{selectedEngagement.scope || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Objectives</label>
                <p className="mt-1 text-sm text-slate-900">{selectedEngagement.objectives || 'Not specified'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Engagement</DialogTitle>
              <DialogDescription>Update engagement details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date *</label>
                  <Input
                    required
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                    <SelectItem value="Reporting">Reporting</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Scope</label>
                <Textarea
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Objectives</label>
                <Textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false)
                  setSelectedEngagement(null)
                  resetForm()
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Engagement'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Engagement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEngagement?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedEngagement(null)
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
