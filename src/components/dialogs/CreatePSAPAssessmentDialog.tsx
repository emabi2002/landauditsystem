'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type PSAPStandard = Database['public']['Tables']['audit_psap_standards']['Row']

interface CreatePSAPAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreatePSAPAssessmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePSAPAssessmentDialogProps) {
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(false)
  const [standards, setStandards] = useState<PSAPStandard[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])

  // Form state
  const [orgUnitId, setOrgUnitId] = useState('')
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear().toString())
  const [quarter, setQuarter] = useState('1')
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0])
  const [completedBy, setCompletedBy] = useState('')
  const [reviewedBy, setReviewedBy] = useState('')
  const [comments, setComments] = useState('')
  const [scores, setScores] = useState<Record<string, { score: number; comments: string }>>({})

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
      // Load PSAP standards
      const { data: standardsData } = await supabase
        .from('audit_psap_standards')
        .select('*')
        .order('standard_number')

      // Load org units
      const { data: orgUnitsData } = await supabase
        .from('org_units')
        .select('*')
        .eq('active', true)
        .order('name')

      // Load people
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .eq('active', true)
        .order('full_name')

      if (standardsData) setStandards(standardsData)
      if (orgUnitsData) setOrgUnits(orgUnitsData)
      if (peopleData) setPeople(peopleData)

      // Initialize scores
      const initialScores: Record<string, { score: number; comments: string }> = {}
      ;(standardsData as any[] || []).forEach((std: any) => {
        initialScores[std.id] = { score: 0, comments: '' }
      })
      setScores(initialScores)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handleScoreChange = (standardId: string, value: string) => {
    const score = Math.max(0, Math.min(10, parseFloat(value) || 0))
    setScores(prev => ({
      ...prev,
      [standardId]: { ...prev[standardId], score }
    }))
  }

  const handleScoreCommentChange = (standardId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [standardId]: { ...prev[standardId], comments: value }
    }))
  }

  const calculateTotalScore = () => {
    let total = 0
    standards.forEach(std => {
      const score = scores[std.id]?.score || 0
      total += score * std.weight
    })
    return total.toFixed(2)
  }

  const getRatingForScore = (score: number) => {
    if (score >= 18.0) return { label: 'Full Compliance', color: 'bg-green-500' }
    if (score >= 15.0) return { label: 'Substantial Compliance', color: 'bg-lime-500' }
    if (score >= 12.0) return { label: 'Partial Compliance', color: 'bg-yellow-500' }
    if (score >= 9.0) return { label: 'Low Compliance', color: 'bg-orange-500' }
    return { label: 'Non-Compliance', color: 'bg-red-500' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgUnitId || !completedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('audit_psap_assessments')
        .insert({
          org_unit_id: orgUnitId,
          financial_year: parseInt(financialYear),
          quarter: parseInt(quarter),
          assessment_date: assessmentDate,
          completed_by: completedBy,
          reviewed_by: (reviewedBy && reviewedBy !== 'none') ? reviewedBy : null,
          comments: comments || null,
        } as any)
        .select()
        .single()

      if (assessmentError) throw assessmentError

      // Create scores
      const scoreInserts = (standards as any[]).map((std: any) => ({
        psap_assessment_id: (assessment as any)?.id,
        psap_standard_id: std.id,
        raw_score: scores[std.id]?.score || 0,
        comments: scores[std.id]?.comments || null,
      }))

      const { error: scoresError } = await supabase
        .from('audit_psap_assessment_scores')
        .insert(scoreInserts as any)

      if (scoresError) throw scoresError

      toast.success('PSAP Assessment created successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating assessment:', error)
      toast.error(error.message || 'Failed to create assessment')
    } finally {
      setLoading(false)
    }
  }

  const totalScore = parseFloat(calculateTotalScore())
  const rating = getRatingForScore(totalScore)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create PSAP Assessment</DialogTitle>
          <DialogDescription>
            Complete the quarterly PSAP Financial & Governance Standards assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orgUnit">Organization Unit *</Label>
              <Select value={orgUnitId} onValueChange={setOrgUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select org unit" />
                </SelectTrigger>
                <SelectContent>
                  {orgUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Financial Year *</Label>
              <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter *</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(q => (
                    <SelectItem key={q} value={q.toString()}>
                      Q{q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Assessment Date *</Label>
              <Input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completedBy">Completed By *</Label>
              <Select value={completedBy} onValueChange={setCompletedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedBy">Reviewed By</Label>
              <Select value={reviewedBy} onValueChange={setReviewedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overall Score Display */}
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overall Score</p>
                <p className="text-2xl font-bold">{totalScore} / 20.0</p>
              </div>
              <Badge className={rating.color}>
                {rating.label}
              </Badge>
            </div>
          </div>

          {/* Standards Scoring Table */}
          <div className="space-y-2">
            <Label>PSAP Standards Scores</Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-sm font-medium">#</th>
                      <th className="text-left p-2 text-sm font-medium">Standard</th>
                      <th className="text-center p-2 text-sm font-medium">Weight</th>
                      <th className="text-center p-2 text-sm font-medium">Score (0-10)</th>
                      <th className="text-center p-2 text-sm font-medium">Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standards.map((standard) => {
                      const score = scores[standard.id]?.score || 0
                      const weighted = (score * standard.weight).toFixed(2)
                      return (
                        <tr key={standard.id} className="border-t">
                          <td className="p-2 text-sm">{standard.standard_number}</td>
                          <td className="p-2 text-sm">
                            <div className="font-medium">{standard.title}</div>
                            <div className="text-xs text-slate-500">{standard.description}</div>
                          </td>
                          <td className="p-2 text-center text-sm font-mono">{standard.weight}</td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={score}
                              onChange={(e) => handleScoreChange(standard.id, e.target.value)}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="p-2 text-center font-mono text-sm">{weighted}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Overall Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any general comments about this assessment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Assessment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
