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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Eye, Edit, Trash2, Loader2, Zap, AlertTriangle, ArrowRight } from 'lucide-react'
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

type Engagement = Database['public']['Tables']['audit_engagements']['Row']

interface RiskEvent {
  id: string
  event_code: string
  event_title: string
  event_status: string
  priority: string
  source_type: string
  audit_risk_register?: {
    risk_code: string
    risk_title: string
  } | null
}

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

  // Risk Events for linking
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const supabase = createClientComponentClient<Database>()

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    scope: string
    objectives: string
    start_date: string
    end_date: string
    status: 'Planning' | 'Fieldwork' | 'Reporting' | 'Follow-up' | 'Closed'
    risk_event_id: string
  }>({
    title: '',
    scope: '',
    objectives: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
    risk_event_id: '',
  })

  // Fetch available risk events (Approved or Allocated status)
  useEffect(() => {
    fetchRiskEvents()
  }, [])

  const fetchRiskEvents = async () => {
    setLoadingEvents(true)
    try {
      const { data, error } = await supabase
        .from('audit_risk_events')
        .select(`
          id,
          event_code,
          event_title,
          event_status,
          priority,
          source_type,
          audit_risk_register:primary_risk_id(risk_code, risk_title)
        `)
        .in('event_status', ['Approved', 'Allocated'])
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRiskEvents(data as unknown as RiskEvent[])
      }
    } catch (err) {
      console.error('Error fetching risk events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      scope: '',
      objectives: '',
      start_date: '',
      end_date: '',
      status: 'Planning',
      risk_event_id: '',
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate risk event is selected
    if (!formData.risk_event_id) {
      toast.error('You must select a Risk Event. All engagements must originate from an approved Risk Event.')
      return
    }

    setSubmitting(true)

    // Get the selected risk event to extract risk_id
    const selectedEvent = riskEvents.find(e => e.id === formData.risk_event_id)

    const { data, error } = await createEngagement({
      ...formData,
      risk_event_id: formData.risk_event_id,
    })

    if (error) {
      toast.error('Failed to create engagement: ' + error.message)
    } else {
      toast.success('Engagement created successfully')

      // Update the risk event status to In Progress
      await supabase
        .from('audit_risk_events')
        .update({ event_status: 'In Progress', updated_at: new Date().toISOString() } as any)
        .eq('id', formData.risk_event_id)

      setIsCreateOpen(false)
      resetForm()
      fetchRiskEvents() // Refresh available events
    }
    setSubmitting(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEngagement) return
    setSubmitting(true)
    const { data, error } = await updateEngagement(selectedEngagement.id, {
      title: formData.title,
      scope: formData.scope,
      objectives: formData.objectives,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
    })
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
      risk_event_id: (engagement as any).risk_event_id || '',
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
                  Create a new audit engagement from an approved Risk Event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Risk Event Selection - MANDATORY */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800">Link to Risk Event *</span>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    All engagements must originate from an approved Risk Event to maintain audit traceability.
                  </p>
                  {loadingEvents ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                    </div>
                  ) : riskEvents.length === 0 ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm text-amber-800">No approved Risk Events available</p>
                      <p className="text-xs text-amber-600 mt-1">Create and approve a Risk Event first</p>
                      <Link href="/risk-events">
                        <Button variant="outline" size="sm" className="mt-3">
                          Go to Risk Events
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Select
                      value={formData.risk_event_id}
                      onValueChange={(value) => {
                        const event = riskEvents.find(e => e.id === value)
                        setFormData({
                          ...formData,
                          risk_event_id: value,
                          title: event ? `Audit: ${event.event_title}` : formData.title,
                          scope: event ? event.event_title : formData.scope,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Risk Event" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{event.event_code}</span>
                              <span>-</span>
                              <span className="truncate max-w-[300px]">{event.event_title}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {event.event_status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.risk_event_id && (
                    <div className="mt-3 p-3 bg-white rounded border border-amber-200">
                      {(() => {
                        const event = riskEvents.find(e => e.id === formData.risk_event_id)
                        return event ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className={
                                event.priority === 'Critical' ? 'bg-red-600' :
                                event.priority === 'High' ? 'bg-orange-500' :
                                event.priority === 'Medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }>
                                {event.priority}
                              </Badge>
                              <span className="text-slate-500">{event.source_type}</span>
                            </div>
                            {event.audit_risk_register && (
                              <p className="text-xs text-slate-600 mt-2">
                                Linked Risk: {event.audit_risk_register.risk_code} - {event.audit_risk_register.risk_title}
                              </p>
                            )}
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </div>

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
                  disabled={submitting || !formData.risk_event_id}
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

      {/* Governance Notice */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Governance Requirement
            </p>
            <p className="text-sm text-amber-700 mt-1">
              All audit engagements must originate from an approved Risk Event. This ensures traceability from the Risk Register through to findings and recommendations.
            </p>
          </div>
        </div>
      </Card>

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
            <p className="text-slate-500">No engagements found. Create your first engagement from an approved Risk Event.</p>
            <Link href="/risk-events">
              <Button className="mt-4">
                <Zap className="mr-2 h-4 w-4" />
                Go to Risk Events
              </Button>
            </Link>
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
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
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
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
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
