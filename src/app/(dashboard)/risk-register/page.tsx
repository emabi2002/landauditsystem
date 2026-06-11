'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download, RefreshCw, AlertTriangle, ShieldAlert, FileText, Building2, Scale, Eye, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRiskRegister, type RiskWithRelations } from '@/lib/hooks/useRiskRegister'
import { CreateRiskDialog } from '@/components/dialogs/CreateRiskDialog'
import { RiskDetailSheet } from '@/components/dialogs/RiskDetailSheet'
import type { RiskRating, RiskStatus, RiskCategory } from '@/lib/database.types'

const riskCategories: RiskCategory[] = [
  'Strategic', 'Operational', 'Financial', 'Compliance',
  'Reputational', 'Technology', 'Governance', 'External'
]

const riskStatuses: RiskStatus[] = [
  'Active', 'Under Review', 'Mitigated', 'Accepted', 'Closed', 'Escalated'
]

const riskRatings: RiskRating[] = ['Extreme', 'High', 'Medium', 'Low']

export default function RiskRegisterPage() {
  const {
    risks,
    divisions,
    legalInstruments,
    stats,
    loading,
    error,
    fetchRisks,
    fetchRiskById
  } = useRiskRegister()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [filterDivision, setFilterDivision] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<RiskWithRelations | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  // Apply filters
  useEffect(() => {
    const filters: any = {}
    if (filterStatus !== 'all') filters.status = filterStatus
    if (filterCategory !== 'all') filters.category = filterCategory
    if (filterRating !== 'all') filters.rating = filterRating
    if (filterDivision !== 'all') filters.division_id = filterDivision
    if (searchTerm) filters.search = searchTerm

    fetchRisks(Object.keys(filters).length > 0 ? filters : undefined)
  }, [filterCategory, filterStatus, filterRating, filterDivision, searchTerm, fetchRisks])

  const getRatingColor = (rating: RiskRating | null | undefined) => {
    switch (rating) {
      case 'Extreme': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-purple-100 text-purple-800'
      case 'Mitigated': return 'bg-green-100 text-green-800'
      case 'Accepted': return 'bg-yellow-100 text-yellow-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      case 'Escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewRisk = async (risk: RiskWithRelations) => {
    const { data } = await fetchRiskById(risk.id)
    if (data) {
      setSelectedRisk(data)
      setDetailSheetOpen(true)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Risk Code', 'Title', 'Category', 'Division', 'Inherent Rating', 'Residual Rating', 'Status', 'Owner']
    const rows = risks.map(r => [
      r.risk_code,
      r.risk_title,
      r.risk_category,
      r.audit_divisions?.name || 'N/A',
      r.inherent_risk_rating,
      r.residual_risk_rating,
      r.risk_status,
      r.risk_owner_role || 'N/A'
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DLPP_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Risk Heat Map Data
  const heatMapData = {
    'Almost Certain': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    'Likely': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    'Possible': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    'Unlikely': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    'Rare': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }

  const likelihoodLabels = ['Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare']

  risks.forEach(risk => {
    const likelihood = risk.residual_likelihood || risk.inherent_likelihood
    const impact = risk.residual_impact || risk.inherent_impact
    const likelihoodLabel = likelihoodLabels[5 - likelihood] || 'Possible'
    if (heatMapData[likelihoodLabel as keyof typeof heatMapData]) {
      heatMapData[likelihoodLabel as keyof typeof heatMapData][impact as 1|2|3|4|5]++
    }
  })

  const getHeatMapColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact
    if (score >= 20) return 'bg-red-600'
    if (score >= 12) return 'bg-orange-500'
    if (score >= 6) return 'bg-yellow-400'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Register</h1>
          <p className="text-slate-500 mt-1">
            Authoritative risk landscape for DLPP - The spine of the Audit & Compliance System
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchRisks()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">In register</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extreme</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.extreme}</div>
            <p className="text-xs text-slate-500">Immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
            <p className="text-xs text-slate-500">Priority mitigation</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <p className="text-xs text-slate-500">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.low}</div>
            <p className="text-xs text-slate-500">Acceptable level</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">Risk Register</TabsTrigger>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="by-division">By Division</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="legal">Legal Compliance</TabsTrigger>
        </TabsList>

        {/* Risk Register Tab */}
        <TabsContent value="register" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search by code, title, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {riskCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    {riskRatings.map(rating => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {riskStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterDivision} onValueChange={setFilterDivision}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {divisions.map(div => (
                      <SelectItem key={div.id} value={div.id}>{div.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Risk Table */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading risks...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : risks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No risks found. {filterCategory !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first risk to get started.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Risk Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead className="text-center">Inherent</TableHead>
                      <TableHead className="text-center">Residual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((risk) => (
                      <TableRow key={risk.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell className="font-mono text-sm font-medium">
                          {risk.risk_code}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{risk.risk_title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[300px]">
                            {risk.risk_description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{risk.risk_category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {risk.audit_divisions?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getRatingColor(risk.inherent_risk_rating)}>
                            {risk.inherent_risk_rating}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getRatingColor(risk.residual_risk_rating)}>
                            {risk.residual_risk_rating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(risk.risk_status)}>
                            {risk.risk_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {risk.risk_owner_role || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRisk(risk)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heat Map Tab */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Risk Heat Map</CardTitle>
              <CardDescription>
                Visual representation of risk distribution by likelihood and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Likelihood
                      </th>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Insignificant (1)
                      </th>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Minor (2)
                      </th>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Moderate (3)
                      </th>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Major (4)
                      </th>
                      <th className="border border-slate-300 p-3 bg-slate-100 text-sm font-semibold text-slate-700">
                        Catastrophic (5)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Almost Certain (5)', likelihood: 5 },
                      { label: 'Likely (4)', likelihood: 4 },
                      { label: 'Possible (3)', likelihood: 3 },
                      { label: 'Unlikely (2)', likelihood: 2 },
                      { label: 'Rare (1)', likelihood: 1 }
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="border border-slate-300 p-3 bg-slate-50 font-medium text-sm">
                          {row.label}
                        </td>
                        {[1, 2, 3, 4, 5].map((impact) => {
                          const likelihoodLabel = likelihoodLabels[5 - row.likelihood]
                          const count = heatMapData[likelihoodLabel as keyof typeof heatMapData]?.[impact as 1|2|3|4|5] || 0
                          return (
                            <td
                              key={impact}
                              className={`border border-slate-300 p-6 text-center ${getHeatMapColor(row.likelihood, impact)}`}
                            >
                              <span className="text-white font-bold text-lg">{count}</span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-sm">Extreme (20-25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">High (12-19)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-sm">Medium (6-11)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Low (1-5)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Division Tab */}
        <TabsContent value="by-division">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.byDivision).map(([division, count]) => (
              <Card key={division}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{division}</CardTitle>
                  <Building2 className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="flex gap-2 mt-2">
                    {risks.filter(r => r.audit_divisions?.name === division).slice(0, 3).map(r => (
                      <Badge key={r.id} className={`${getRatingColor(r.residual_risk_rating)} text-xs`}>
                        {r.risk_code}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="by-category">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category}</CardTitle>
                  <FileText className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="mt-2 space-y-1">
                    {risks
                      .filter(r => r.risk_category === category)
                      .slice(0, 2)
                      .map(r => (
                        <div key={r.id} className="text-xs text-slate-600 flex justify-between">
                          <span className="truncate flex-1">{r.risk_code}</span>
                          <Badge className={`${getRatingColor(r.residual_risk_rating)} text-xs ml-2`}>
                            {r.residual_risk_rating}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Legal Compliance Tab */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Regulatory Exposure</CardTitle>
              <CardDescription>
                Risks mapped to applicable legal instruments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalInstruments.slice(0, 10).map(instrument => {
                  const linkedRisks = risks.filter(r =>
                    r.legal_references?.some((ref: any) => ref.legal_instrument_id === instrument.id)
                  )
                  return (
                    <div key={instrument.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">{instrument.title}</span>
                            <Badge variant="outline">{instrument.code}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{instrument.description}</p>
                        </div>
                        <Badge variant="secondary">{linkedRisks.length} risks</Badge>
                      </div>
                      {linkedRisks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {linkedRisks.slice(0, 5).map(risk => (
                            <Badge
                              key={risk.id}
                              className={`${getRatingColor(risk.residual_risk_rating)} cursor-pointer`}
                              onClick={() => handleViewRisk(risk)}
                            >
                              {risk.risk_code}
                            </Badge>
                          ))}
                          {linkedRisks.length > 5 && (
                            <Badge variant="outline">+{linkedRisks.length - 5} more</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Risk Dialog */}
      <CreateRiskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => fetchRisks()}
      />

      {/* Risk Detail Sheet */}
      <RiskDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        risk={selectedRisk}
        onUpdate={() => fetchRisks()}
      />
    </div>
  )
}
