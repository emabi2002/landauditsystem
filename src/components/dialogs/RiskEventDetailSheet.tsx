'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Zap,
  Shield,
  Calendar,
  Building2,
  Users,
  FileWarning,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  ListTodo,
  History,
  Play,
  User,
  ArrowRight,
} from 'lucide-react'
import { useRiskEvents, RiskEventStatus, Priority } from '@/lib/hooks/useRiskEvents'
import { toast } from 'sonner'

interface RiskEventDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
  onUpdate?: () => void
}

const priorityColors: Record<Priority, string> = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-green-500 text-white'
}

const statusColors: Record<RiskEventStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-300',
  'Under Review': 'bg-blue-100 text-blue-700 border-blue-300',
  Approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Allocated: 'bg-purple-100 text-purple-700 border-purple-300',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-300',
  'On Hold': 'bg-gray-100 text-gray-700 border-gray-300',
  Completed: 'bg-green-100 text-green-700 border-green-300',
  Cancelled: 'bg-red-100 text-red-700 border-red-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300'
}

const sourceIcons = {
  AAAP: Calendar,
  Secretary: FileWarning,
  External: Building2,
  Internal: Users
}

export function RiskEventDetailSheet({ open, onOpenChange, eventId, onUpdate }: RiskEventDetailSheetProps) {
  const {
    fetchRiskEventById,
    reviewRiskEvent,
    allocateRiskEvent,
    updateEventStatus,
    createEngagementFromEvent
  } = useRiskEvents()

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Action modal states
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (open && eventId) {
      loadEvent()
    }
  }, [open, eventId])

  const loadEvent = async () => {
    if (!eventId) return

    setLoading(true)
    const { data, error } = await fetchRiskEventById(eventId)
    if (data) {
      setEvent(data)
    }
    if (error) {
      toast.error(error)
    }
    setLoading(false)
  }

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!eventId) return

    setActionLoading(true)
    const { error } = await reviewRiskEvent(
      eventId,
      action,
      reviewNotes,
      action === 'reject' ? rejectionReason : undefined
    )

    if (error) {
      toast.error(error)
    } else {
      toast.success(action === 'approve' ? 'Event approved' : 'Event rejected')
      await loadEvent()
      onUpdate?.()
    }
    setActionLoading(false)
    setShowReviewModal(false)
    setReviewNotes('')
    setRejectionReason('')
  }

  const handleStatusChange = async (newStatus: RiskEventStatus) => {
    if (!eventId) return

    setActionLoading(true)
    const { error } = await updateEventStatus(eventId, newStatus)

    if (error) {
      toast.error(error)
    } else {
      toast.success(`Status updated to ${newStatus}`)
      await loadEvent()
      onUpdate?.()
    }
    setActionLoading(false)
  }

  const handleCreateEngagement = async () => {
    if (!eventId || !event) return

    setActionLoading(true)
    const { data, error } = await createEngagementFromEvent(eventId, {
      title: `Audit: ${event.event_title}`,
      scope: event.event_description,
      start_date: event.requested_start_date || new Date().toISOString().split('T')[0]
    })

    if (error) {
      toast.error(error)
    } else {
      toast.success('Audit engagement created')
      await loadEvent()
      onUpdate?.()
    }
    setActionLoading(false)
  }

  if (!event && !loading) {
    return null
  }

  const SourceIcon = event?.source_type ? sourceIcons[event.source_type as keyof typeof sourceIcons] : Zap
  const risk = event?.audit_risk_register
  const category = event?.audit_categories
  const targetDivision = event?.target_division

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : event ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${event.source_type === 'Secretary' ? 'bg-red-100' : 'bg-slate-100'}`}>
                  <SourceIcon className={`h-6 w-6 ${event.source_type === 'Secretary' ? 'text-red-600' : 'text-slate-600'}`} />
                </div>
                <div>
                  <SheetTitle className="flex items-center gap-2">
                    {event.event_code}
                    {event.is_priority_override && (
                      <Badge variant="destructive" className="text-xs">Priority Override</Badge>
                    )}
                  </SheetTitle>
                  <SheetDescription>{event.source_type} Event</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`${statusColors[event.event_status as RiskEventStatus]} px-3 py-1`}>
                  {event.event_status}
                </Badge>
                <Badge className={priorityColors[event.priority as Priority]}>
                  {event.priority} Priority
                </Badge>
                {category && (
                  <Badge variant="secondary">{category.name}</Badge>
                )}
              </div>

              {/* Event Title & Description */}
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{event.event_title}</h3>
                <p className="text-slate-600 mt-2">{event.event_description}</p>
              </div>

              {/* Secretary Directive Info */}
              {event.source_type === 'Secretary' && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-800 mb-3">
                      <FileWarning className="h-5 w-5" />
                      <span className="font-medium">Secretary Directive</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {event.directive_reference && (
                        <div>
                          <span className="text-red-600">Reference:</span>
                          <span className="ml-2 font-medium text-red-900">{event.directive_reference}</span>
                        </div>
                      )}
                      {event.directive_date && (
                        <div>
                          <span className="text-red-600">Date:</span>
                          <span className="ml-2 font-medium text-red-900">
                            {new Date(event.directive_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {event.directive_issuer && (
                        <div className="col-span-2">
                          <span className="text-red-600">Issued By:</span>
                          <span className="ml-2 font-medium text-red-900">{event.directive_issuer}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Linked Risk */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    Linked Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {risk ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{risk.risk_code}</span>
                        <Badge
                          className={
                            risk.residual_risk_rating === 'Extreme' ? 'bg-red-600' :
                            risk.residual_risk_rating === 'High' ? 'bg-orange-500' :
                            risk.residual_risk_rating === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }
                        >
                          {risk.residual_risk_rating}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{risk.risk_title}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No risk linked</p>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Tabs for Details */}
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Response Type</span>
                      <p className="font-medium">{event.response_type}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Financial Year</span>
                      <p className="font-medium">FY {event.financial_year}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Target Division</span>
                      <p className="font-medium">{targetDivision?.name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Created</span>
                      <p className="font-medium">{new Date(event.created_at).toLocaleDateString()}</p>
                    </div>
                    {event.requested_start_date && (
                      <div>
                        <span className="text-slate-500">Requested Start</span>
                        <p className="font-medium">{new Date(event.requested_start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {event.requested_completion_date && (
                      <div>
                        <span className="text-slate-500">Requested Completion</span>
                        <p className="font-medium">{new Date(event.requested_completion_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {event.review_notes && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm">
                          <span className="font-medium text-blue-800">Review Notes:</span>
                          <p className="text-blue-700 mt-1">{event.review_notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {event.rejection_reason && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="text-sm">
                          <span className="font-medium text-red-800">Rejection Reason:</span>
                          <p className="text-red-700 mt-1">{event.rejection_reason}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  {event.tasks && event.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {event.tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{task.task_title}</p>
                            <p className="text-xs text-slate-500">{task.status}</p>
                          </div>
                          <Badge variant="outline">{task.progress_percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <ListTodo className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p>No tasks assigned yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  {event.activity_log && event.activity_log.length > 0 ? (
                    <div className="space-y-3">
                      {event.activity_log.map((log: any) => (
                        <div key={log.id} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-slate-400 mt-2" />
                          <div>
                            <p className="text-slate-900">{log.action_type}</p>
                            {log.action_details && (
                              <p className="text-slate-500 text-xs">{log.action_details}</p>
                            )}
                            <p className="text-slate-400 text-xs">
                              {new Date(log.performed_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <History className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p>No activity history</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Actions</h4>

                {/* Review Actions */}
                {(event.event_status === 'Pending' || event.event_status === 'Under Review') && (
                  <>
                    {!showReviewModal ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            handleStatusChange('Under Review')
                          }}
                          variant="outline"
                          disabled={event.event_status === 'Under Review' || actionLoading}
                          className="flex-1"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Start Review
                        </Button>
                        <Button
                          onClick={() => setShowReviewModal(true)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={actionLoading}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Review & Approve
                        </Button>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <Label>Review Notes</Label>
                            <Textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Enter your review notes..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Rejection Reason (if rejecting)</Label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter reason for rejection..."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowReviewModal(false)}
                              disabled={actionLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReview('reject')}
                              disabled={actionLoading || !rejectionReason}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleReview('approve')}
                              disabled={actionLoading}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Allocation Actions */}
                {event.event_status === 'Approved' && (
                  <Button
                    onClick={() => handleStatusChange('Allocated')}
                    className="w-full"
                    disabled={actionLoading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Allocate Resources
                  </Button>
                )}

                {/* Start Engagement */}
                {event.event_status === 'Allocated' && (
                  <Button
                    onClick={handleCreateEngagement}
                    className="w-full"
                    disabled={actionLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Create Audit Engagement
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {/* In Progress Actions */}
                {event.event_status === 'In Progress' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange('On Hold')}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Put On Hold
                    </Button>
                    <Button
                      onClick={() => handleStatusChange('Completed')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                )}

                {/* On Hold Actions */}
                {event.event_status === 'On Hold' && (
                  <Button
                    onClick={() => handleStatusChange('In Progress')}
                    className="w-full"
                    disabled={actionLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Event not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
