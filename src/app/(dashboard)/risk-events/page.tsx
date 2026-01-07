'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Building2,
  ChevronRight,
  BarChart3,
  Shield,
  FileWarning,
  ArrowUpRight,
} from 'lucide-react'
import { useRiskEvents, RiskEventSource, RiskEventStatus, Priority } from '@/lib/hooks/useRiskEvents'
import { CreateRiskEventDialog } from '@/components/dialogs/CreateRiskEventDialog'
import { RiskEventDetailSheet } from '@/components/dialogs/RiskEventDetailSheet'

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

const sourceIcons: Record<RiskEventSource, typeof Zap> = {
  AAAP: Calendar,
  Secretary: FileWarning,
  External: Building2,
  Internal: Users
}

const sourceLabels: Record<RiskEventSource, string> = {
  AAAP: 'Annual Audit Activity Plan',
  Secretary: 'Secretary Directive',
  External: 'External Request',
  Internal: 'Internal Request'
}

export default function RiskEventsPage() {
  const {
    riskEvents,
    categories,
    divisions,
    stats,
    loading,
    fetchRiskEvents
  } = useRiskEvents()

  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  // Filter events
  useEffect(() => {
    const filters: any = {}
    if (sourceFilter !== 'all') filters.source_type = sourceFilter
    if (statusFilter !== 'all') filters.event_status = statusFilter
    if (priorityFilter !== 'all') filters.priority = priorityFilter
    if (searchTerm) filters.search = searchTerm

    fetchRiskEvents(filters)
  }, [sourceFilter, statusFilter, priorityFilter, searchTerm, fetchRiskEvents])

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setDetailSheetOpen(true)
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk Events</h1>
          <p className="text-slate-500 mt-1">
            Central repository for all audit triggers - the gateway between Risk Register and Audit Activities
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Risk Event
        </Button>
      </div>

      {/* Governance Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Governance Requirement
              </p>
              <p className="text-sm text-amber-700 mt-1">
                All audits, reviews, and investigations must originate from a Risk Event, which must be anchored to the Risk Register.
                This ensures full traceability from risk identification to audit closure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Total Events</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
            <div className="text-xs text-amber-600 mt-1">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-700">{stats.underReview}</div>
            <div className="text-xs text-blue-600 mt-1">Under Review</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-700">{stats.approved}</div>
            <div className="text-xs text-emerald-600 mt-1">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-700">{stats.allocated}</div>
            <div className="text-xs text-purple-600 mt-1">Allocated</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-700">{stats.inProgress}</div>
            <div className="text-xs text-orange-600 mt-1">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-xs text-green-600 mt-1">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Action
          </TabsTrigger>
          <TabsTrigger value="secretary" className="gap-2">
            <FileWarning className="h-4 w-4" />
            Secretary Directives
          </TabsTrigger>
          <TabsTrigger value="bySource" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            By Source
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search events by title, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="AAAP">AAAP</SelectItem>
                    <SelectItem value="Secretary">Secretary</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Allocated">Allocated</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Risk Events - FY {currentYear}
              </CardTitle>
              <CardDescription>
                {riskEvents.length} events found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : riskEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No risk events found</h3>
                  <p className="text-slate-500 mt-1">Create a new risk event to get started</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    New Risk Event
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Linked Risk</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskEvents.map((event) => {
                      const SourceIcon = sourceIcons[event.source_type]
                      return (
                        <TableRow key={event.id} className="cursor-pointer hover:bg-slate-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900">{event.event_code}</div>
                              <div className="text-sm text-slate-500 max-w-xs truncate">
                                {event.event_title}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <SourceIcon className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{event.source_type}</span>
                              {event.is_priority_override && (
                                <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                                  Override
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {(event.audit_risk_register as any)?.risk_code || 'N/A'}
                              </div>
                              <div className="text-slate-500 text-xs max-w-[150px] truncate">
                                {(event.audit_risk_register as any)?.risk_title || ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[event.priority]}>
                              {event.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[event.event_status]}>
                              {event.event_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">
                              {(event.target_division as any)?.name || 'Not assigned'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEvent(event.id)}
                            >
                              View
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Audit Manager Action
              </CardTitle>
              <CardDescription>
                Events awaiting review, approval, or allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskEvents
                  .filter(e => ['Pending', 'Under Review', 'Approved'].includes(e.event_status))
                  .map((event) => {
                    const SourceIcon = sourceIcons[event.source_type]
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleViewEvent(event.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${event.is_priority_override ? 'bg-red-100' : 'bg-slate-100'}`}>
                            <SourceIcon className={`h-5 w-5 ${event.is_priority_override ? 'text-red-600' : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.event_code}</span>
                              <Badge className={priorityColors[event.priority]}>
                                {event.priority}
                              </Badge>
                              {event.is_priority_override && (
                                <Badge variant="destructive" className="text-xs">
                                  Priority Override
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">{event.event_title}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              Linked to: {(event.audit_risk_register as any)?.risk_code} - {(event.audit_risk_register as any)?.risk_title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColors[event.event_status]}>
                            {event.event_status}
                          </Badge>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    )
                  })}
                {riskEvents.filter(e => ['Pending', 'Under Review', 'Approved'].includes(e.event_status)).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <p>No events pending action</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secretary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-red-500" />
                Secretary Directives
              </CardTitle>
              <CardDescription>
                Priority events from the Office of the Secretary - these override normal planning priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskEvents
                  .filter(e => e.source_type === 'Secretary')
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg cursor-pointer hover:bg-red-100"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-800">{event.event_code}</span>
                            <Badge className="bg-red-600 text-white">Secretary Directive</Badge>
                            <Badge className={priorityColors[event.priority]}>{event.priority}</Badge>
                          </div>
                          <h4 className="font-medium text-slate-900 mt-2">{event.event_title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{event.event_description}</p>
                          {event.directive_reference && (
                            <div className="mt-2 text-xs text-slate-500">
                              <span className="font-medium">Reference:</span> {event.directive_reference}
                              {event.directive_date && ` | Date: ${new Date(event.directive_date).toLocaleDateString()}`}
                              {event.directive_issuer && ` | Issued by: ${event.directive_issuer}`}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className={statusColors[event.event_status]}>
                          {event.event_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {riskEvents.filter(e => e.source_type === 'Secretary').length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileWarning className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p>No secretary directives</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bySource">
          <div className="grid md:grid-cols-2 gap-4">
            {(['AAAP', 'Secretary', 'External', 'Internal'] as RiskEventSource[]).map((source) => {
              const SourceIcon = sourceIcons[source]
              const sourceEvents = riskEvents.filter(e => e.source_type === source)
              return (
                <Card key={source}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <SourceIcon className="h-5 w-5 text-slate-500" />
                      {sourceLabels[source]}
                    </CardTitle>
                    <CardDescription>
                      {sourceEvents.length} events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sourceEvents.length === 0 ? (
                      <p className="text-sm text-slate-400 py-4 text-center">No events</p>
                    ) : (
                      <div className="space-y-2">
                        {sourceEvents.slice(0, 5).map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer"
                            onClick={() => handleViewEvent(event.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${priorityColors[event.priority]}`} />

                              <span className="text-sm font-medium">{event.event_code}</span>
                              <span className="text-sm text-slate-500 max-w-[150px] truncate">
                                {event.event_title}
                              </span>
                            </div>
                            <Badge variant="outline" className={`text-xs ${statusColors[event.event_status]}`}>
                              {event.event_status}
                            </Badge>
                          </div>
                        ))}
                        {sourceEvents.length > 5 && (
                          <Button variant="link" size="sm" className="w-full text-slate-500">
                            View all {sourceEvents.length} events
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateRiskEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => fetchRiskEvents()}
      />

      <RiskEventDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        eventId={selectedEventId}
        onUpdate={() => fetchRiskEvents()}
      />
    </div>
  )
}
