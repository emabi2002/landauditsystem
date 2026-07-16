'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, CheckCircle, Clock, XCircle, Download, Pencil, Trash2, ListTree } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils/export'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKRAs } from '@/lib/hooks/useKRAs'
import { UpdateKRAStatusDialog } from '@/components/dialogs/UpdateKRAStatusDialog'
import { CreateKRADialog, type KRAToEdit } from '@/components/dialogs/CreateKRADialog'
import { ManageKRAActivitiesDialog } from '@/components/dialogs/ManageKRAActivitiesDialog'
import { KRATrendChart } from '@/components/charts/KRATrendChart'
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
import { HelpTooltip } from '@/components/help/HelpTooltip'

export default function KRAWorkplanPage() {
  const { kras, loading, fetchKRAs, fetchKRAStatusSummary, deleteKRA } = useKRAs()
  const [statusSummary, setStatusSummary] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedQuarter, setSelectedQuarter] = useState<string>('1')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [kraDialogOpen, setKraDialogOpen] = useState(false)
  const [editingKRA, setEditingKRA] = useState<KRAToEdit | null>(null)
  const [activitiesKRA, setActivitiesKRA] = useState<{ id: string; kra_code: string; kra_title: string } | null>(null)

  const handleStatusUpdated = () => {
    loadStatusSummary()
  }

  const handleDeleteKRA = async (kra: any) => {
    if (!confirm(`Delete KRA "${kra.kra_code} — ${kra.kra_title}"? This removes its activities and statuses.`)) return
    const { error } = await deleteKRA(kra.id)
    if (error) {
      toast.error(error)
    } else {
      toast.success('KRA deleted')
      loadStatusSummary()
    }
  }

  const handleExportStatus = () => {
    const exportData = statusSummary.map(s => ({
      'Org Unit': s.org_unit_name,
      'KRA Code': s.kra_code,
      'KRA Title': s.kra_title,
      'Year': s.financial_year || selectedYear,
      'Quarter': s.quarter || selectedQuarter,
      'Total Activities': s.total_activities || 0,
      'Completed': s.completed || 0,
      'Ongoing': s.ongoing || 0,
      'Delayed': s.delayed || 0,
      'Not Started': s.not_started || 0,
    }))
    exportToCSV(exportData, `KRA_Status_${selectedYear}_Q${selectedQuarter}`)
  }

  useEffect(() => {
    loadStatusSummary()
  }, [selectedYear, selectedQuarter])

  const loadStatusSummary = async () => {
    const { data } = await fetchKRAStatusSummary(
      undefined,
      parseInt(selectedYear),
      parseInt(selectedQuarter)
    )
    if (data) {
      setStatusSummary(data)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500'
      case 'Ongoing':
        return 'bg-blue-500'
      case 'Delayed':
        return 'bg-red-500'
      case 'Not Started':
        return 'bg-gray-500'
      case 'Not Measurable':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
  }

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const quarters = [1, 2, 3, 4]

  const totalActivities = statusSummary.reduce((sum, s) => sum + (s.total_activities || 0), 0)
  const completedActivities = statusSummary.reduce((sum, s) => sum + (s.completed || 0), 0)
  const ongoingActivities = statusSummary.reduce((sum, s) => sum + (s.ongoing || 0), 0)
  const delayedActivities = statusSummary.reduce((sum, s) => sum + (s.delayed || 0), 0)

  return (
    <>
      <PageHeader
        icon={Target}
        title="KRA & Workplan Performance"
        subtitle="Key Result Areas and quarterly workplan tracking"
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingKRA(null)
                setKraDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New KRA
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStatusDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Update Status
            </Button>
            <HelpTooltip tooltipKey="kra-new" label="New KRA" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Target className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-slate-500">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities}</div>
            <p className="text-xs text-slate-500">
              {totalActivities > 0
                ? `${((completedActivities / totalActivities) * 100).toFixed(0)}% completion rate`
                : '0% completion rate'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingActivities}</div>
            <p className="text-xs text-slate-500">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delayedActivities}</div>
            <p className="text-xs text-slate-500">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="status" className="space-y-4">
        <div className="flex items-center gap-2">
          <TabsList data-tour="tabs">
            <TabsTrigger value="status">Quarterly Status</TabsTrigger>
            <TabsTrigger value="kras">KRA Management</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <HelpTooltip tooltipKey="kra-tabs" label="Workplan views" />
        </div>

        {/* Quarterly Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card data-tour="table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-1.5">
                    Quarterly Performance Report
                    <HelpTooltip tooltipKey="kra-table" label="Workplan status" />
                  </CardTitle>
                  <CardDescription>
                    KRA activity status for {selectedYear} Q{selectedQuarter}
                  </CardDescription>
                </div>
                <div data-tour="filters" className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportStatus}
                    disabled={statusSummary.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedQuarter} onValueChange={handleQuarterChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(q => (
                        <SelectItem key={q} value={q.toString()}>
                          Q{q} {selectedYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <HelpTooltip tooltipKey="kra-quarter-filter" label="Period filter" side="left" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading KRA status...</div>
              ) : statusSummary.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No KRA status data found for the selected period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Org Unit</TableHead>
                      <TableHead>KRA Code</TableHead>
                      <TableHead>KRA Title</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Completed</TableHead>
                      <TableHead className="text-center">Ongoing</TableHead>
                      <TableHead className="text-center">Delayed</TableHead>
                      <TableHead className="text-center">Not Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusSummary.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.org_unit_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.kra_code}</Badge>
                        </TableCell>
                        <TableCell>{item.kra_title}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {item.total_activities || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500">
                            {item.completed || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-500">
                            {item.ongoing || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-500">
                            {item.delayed || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-gray-500">
                            {item.not_started || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KRA Management Tab */}
        <TabsContent value="kras">
          <Card>
            <CardHeader>
              <CardTitle>Strategic KRAs</CardTitle>
              <CardDescription>
                Manage Key Result Areas for organizational units
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading KRAs...</div>
              ) : kras.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No KRAs defined. Create your first KRA to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Org Unit</TableHead>
                      <TableHead>KRA Code</TableHead>
                      <TableHead>KRA Title</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kras.map((kra) => (
                      <TableRow key={kra.id}>
                        <TableCell className="font-medium">
                          {(kra as any).org_units?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{kra.kra_code}</Badge>
                        </TableCell>
                        <TableCell>{kra.kra_title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {kra.purpose || '-'}
                        </TableCell>
                        <TableCell>
                          {kra.start_year} - {kra.end_year || 'Ongoing'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Manage activities"
                              onClick={() =>
                                setActivitiesKRA({
                                  id: kra.id,
                                  kra_code: kra.kra_code,
                                  kra_title: kra.kra_title,
                                })
                              }
                            >
                              <ListTree className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit KRA"
                              onClick={() => {
                                setEditingKRA({
                                  id: kra.id,
                                  org_unit_id: (kra as any).org_unit_id ?? null,
                                  kra_code: kra.kra_code,
                                  kra_title: kra.kra_title,
                                  purpose: kra.purpose ?? null,
                                  start_year: kra.start_year,
                                  end_year: kra.end_year ?? null,
                                })
                                setKraDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              title="Delete KRA"
                              onClick={() => handleDeleteKRA(kra)}
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

        {/* Trends Tab */}
        <TabsContent value="trends">
          <KRATrendChart />
        </TabsContent>
      </Tabs>

      <UpdateKRAStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={handleStatusUpdated}
      />

      <CreateKRADialog
        open={kraDialogOpen}
        onOpenChange={(o) => {
          setKraDialogOpen(o)
          if (!o) setEditingKRA(null)
        }}
        onSuccess={() => {
          fetchKRAs()
          loadStatusSummary()
        }}
        kra={editingKRA}
      />

      <ManageKRAActivitiesDialog
        open={!!activitiesKRA}
        onOpenChange={(o) => {
          if (!o) setActivitiesKRA(null)
        }}
        kra={activitiesKRA}
        onChanged={() => loadStatusSummary()}
      />
        </div>
      </PageContainer>
    </>
  )
}
