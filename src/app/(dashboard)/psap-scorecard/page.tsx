'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Calendar, Award, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePSAPAssessments } from '@/lib/hooks/usePSAPAssessments'
import { CreatePSAPAssessmentDialog } from '@/components/dialogs/CreatePSAPAssessmentDialog'
import { exportToCSV } from '@/lib/utils/export'
import { PSAPTrendChart } from '@/components/charts/PSAPTrendChart'
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

export default function PSAPScorecardPage() {
  const {
    standards,
    ratingScales,
    assessments,
    loading,
    fetchStandards,
    fetchRatingScales,
    fetchAssessments,
    getRatingForScore
  } = usePSAPAssessments()

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchStandards()
    fetchRatingScales()
  }, [])

  const handleAssessmentCreated = () => {
    fetchAssessments(undefined, parseInt(selectedYear), selectedQuarter ? parseInt(selectedQuarter) : undefined)
  }

  const handleExportAssessments = () => {
    const exportData = assessments.map(a => ({
      'Org Unit': (a as any).org_units?.name || 'N/A',
      'Year': a.financial_year,
      'Quarter': a.quarter,
      'Assessment Date': new Date(a.assessment_date).toLocaleDateString(),
      'Overall Score': a.overall_score?.toFixed(2) || '0.00',
      'Rating': a.overall_rating || 'N/A',
      'Completed By': (a as any).completed_by_person?.full_name || 'N/A',
      'Comments': a.comments || ''
    }))
    exportToCSV(exportData, 'PSAP_Assessments')
  }

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-500'
      case 'Good':
        return 'bg-lime-500'
      case 'Fair':
        return 'bg-yellow-500'
      case 'Poor':
        return 'bg-yellow-500'
      case 'orange':
        return 'bg-orange-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    const quarter = (selectedQuarter && selectedQuarter !== 'all') ? parseInt(selectedQuarter) : undefined
    fetchAssessments(undefined, parseInt(year), quarter)
  }

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter)
    const q = (quarter && quarter !== 'all') ? parseInt(quarter) : undefined
    fetchAssessments(undefined, parseInt(selectedYear), q)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const quarters = [1, 2, 3, 4]

  const latestAssessments = assessments.slice(0, 4)
  const avgScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PSAP Financial & Governance Scorecard</h1>
          <p className="text-sm text-slate-500 mt-1">
            20 PSAP standards quarterly assessment and compliance tracking
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-slate-500">All time assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(2)}</div>
            <p className="text-xs text-slate-500">Out of 20.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full Compliance</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.filter(a => a.overall_rating === 'Excellent').length}
            </div>
            <p className="text-xs text-slate-500">18.0 - 20.0 score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards</CardTitle>
            <Award className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{standards.length}</div>
            <p className="text-xs text-slate-500">Active PSAP standards</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="standards">Standards Reference</TabsTrigger>
          <TabsTrigger value="ratings">Rating Scales</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Quarterly PSAP assessments by organizational unit</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAssessments}
                    disabled={assessments.length === 0}
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
                      <SelectValue placeholder="All quarters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      {quarters.map(q => (
                        <SelectItem key={q} value={q.toString()}>
                          Q{q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading assessments...</div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No assessments found for the selected period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Org Unit</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Assessment Date</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Completed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {(assessment as any).org_units?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{assessment.financial_year}</TableCell>
                        <TableCell>Q{assessment.quarter}</TableCell>
                        <TableCell>
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {assessment.overall_score?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-slate-400"> / 20.0</span>
                        </TableCell>
                        <TableCell>
                          {assessment.overall_rating ? (
                            <Badge className={getRatingColor(assessment.overall_rating)}>
                              {assessment.overall_rating}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(assessment as any).completed_by_person?.full_name || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Standards Reference Tab */}
        <TabsContent value="standards">
          <Card>
            <CardHeader>
              <CardTitle>PSAP Standards (20 Standards)</CardTitle>
              <CardDescription>
                Financial and governance standards with weightings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Standard Title</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standards.map((standard) => (
                    <TableRow key={standard.id}>
                      <TableCell className="font-medium">{standard.standard_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{standard.title}</div>
                          <div className="text-sm text-slate-500">{standard.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">{standard.weight.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rating Scales Tab */}
        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>PSAP Rating Scales</CardTitle>
              <CardDescription>
                Interpretation of overall assessment scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingScales.map((scale) => (
                  <div
                    key={scale.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className={`h-4 w-4 rounded-full ${getRatingColor(scale.rating)}`} />
                    <div className="flex-1">
                      <div className="font-medium">{scale.rating}</div>
                      <div className="text-sm text-slate-500">{scale.description}</div>
                    </div>
                    <div className="text-sm font-mono text-slate-600">
                      {scale.min_score.toFixed(1)} - {scale.max_score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <PSAPTrendChart />
        </TabsContent>
      </Tabs>

      <CreatePSAPAssessmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleAssessmentCreated}
      />
    </div>
  )
}
