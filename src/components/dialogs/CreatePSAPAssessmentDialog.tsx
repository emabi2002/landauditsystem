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
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { HelpTooltip } from '@/components/help/HelpTooltip'

type PSAPStandard = Database['public']['Tables']['audit_psap_standards']['Row']

interface AssessmentToEdit {
  id: string
  org_unit_id: string | null
  financial_year: number
  quarter: number | null
  assessment_date: string
  completed_by?: string | null
  reviewed_by?: string | null
  comments: string | null
}

interface CreatePSAPAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  assessment?: AssessmentToEdit | null
}

/**
 * PSAP standards are scored 0-100 (percent compliance). The overall score is a
 * weighted average on a 0-100 scale (standard weights sum to 100), matching the
 * `audit_psap_rating_scales` bands: Excellent >=90, Good >=75, Fair >=60, else Poor.
 */
function ratingForScore(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'bg-green-600' }
  if (score >= 75) return { label: 'Good', color: 'bg-lime-600' }
  if (score >= 60) return { label: 'Fair', color: 'bg-yellow-500' }
  return { label: 'Poor', color: 'bg-red-500' }
}

export function CreatePSAPAssessmentDialog({
  open,
  onOpenChange,
  onSuccess,
  assessment,
}: CreatePSAPAssessmentDialogProps) {
  const supabase = createClientComponentClient<Database>()
  const isEdit = !!assessment

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

  // Inline quick-add state
  const [addOrgOpen, setAddOrgOpen] = useState(false)
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [newOrg, setNewOrg] = useState({ code: '', name: '', unit_type: 'Division' })
  const [newPerson, setNewPerson] = useState({ full_name: '', email: '', role: '' })
  const [savingInline, setSavingInline] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const loadData = async () => {
    try {
      const [{ data: standardsData }, { data: orgUnitsData }, { data: peopleData }] =
        await Promise.all([
          supabase.from('audit_psap_standards').select('*').order('standard_number'),
          // FIX: org_units uses `is_active` (not `active`) — the old query 400'd,
          // which left the Organization Unit dropdown permanently empty.
          supabase.from('org_units').select('*').eq('is_active', true).order('name'),
          supabase.from('people').select('*').eq('active', true).order('full_name'),
        ])

      const stds = (standardsData as PSAPStandard[]) || []
      setStandards(stds)
      setOrgUnits((orgUnitsData as any[]) || [])
      setPeople((peopleData as any[]) || [])

      if (isEdit && assessment) {
        // Pre-fill header
        setOrgUnitId(assessment.org_unit_id || '')
        setFinancialYear(String(assessment.financial_year))
        setQuarter(String(assessment.quarter ?? 1))
        setAssessmentDate(assessment.assessment_date?.split('T')[0] || assessmentDate)
        setCompletedBy(assessment.completed_by || '')
        setReviewedBy(assessment.reviewed_by || 'none')
        setComments(assessment.comments || '')
        // Load existing scores
        const { data: existingScores } = await supabase
          .from('audit_psap_assessment_scores')
          .select('psap_standard_id, raw_score, comments')
          .eq('psap_assessment_id', assessment.id)
        const map: Record<string, { score: number; comments: string }> = {}
        for (const std of stds) map[std.id] = { score: 0, comments: '' }
        for (const s of (existingScores as any[]) || []) {
          map[s.psap_standard_id] = {
            score: Number(s.raw_score) || 0,
            comments: s.comments || '',
          }
        }
        setScores(map)
      } else {
        const initial: Record<string, { score: number; comments: string }> = {}
        for (const std of stds) initial[std.id] = { score: 0, comments: '' }
        setScores(initial)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handleScoreChange = (standardId: string, value: string) => {
    const score = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setScores((prev) => ({ ...prev, [standardId]: { ...prev[standardId], score } }))
  }

  const totalWeight = standards.reduce((sum, s) => sum + (Number(s.weight) || 0), 0) || 1

  const calculateOverall = () => {
    let total = 0
    for (const std of standards) {
      const score = scores[std.id]?.score || 0
      total += score * (Number(std.weight) || 0)
    }
    return total / totalWeight // weighted average, 0-100
  }

  const overall = calculateOverall()
  const rating = ratingForScore(overall)

  const handleQuickAddOrg = async () => {
    if (!newOrg.code.trim() || !newOrg.name.trim()) {
      toast.error('Org unit code and name are required')
      return
    }
    setSavingInline(true)
    try {
      const { data, error } = await supabase
        .from('org_units')
        .insert({
          code: newOrg.code.toUpperCase().trim(),
          name: newOrg.name.trim(),
          unit_type: newOrg.unit_type || 'Division',
          is_active: true,
        } as any)
        .select()
        .single()
      if (error) throw error
      toast.success('Organization unit added')
      setOrgUnits((prev) => [...prev, data].sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setOrgUnitId((data as any).id)
      setNewOrg({ code: '', name: '', unit_type: 'Division' })
      setAddOrgOpen(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to add organization unit')
    } finally {
      setSavingInline(false)
    }
  }

  const handleQuickAddPerson = async () => {
    if (!newPerson.full_name.trim()) {
      toast.error('Person name is required')
      return
    }
    setSavingInline(true)
    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          full_name: newPerson.full_name.trim(),
          email: newPerson.email.trim() || null,
          role: newPerson.role.trim() || null,
          active: true,
        } as any)
        .select()
        .single()
      if (error) throw error
      toast.success('Person added')
      setPeople((prev) =>
        [...prev, data].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')),
      )
      setCompletedBy((data as any).id)
      setNewPerson({ full_name: '', email: '', role: '' })
      setAddPersonOpen(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to add person')
    } finally {
      setSavingInline(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgUnitId || !completedBy) {
      toast.error('Please select an Organization Unit and who Completed the assessment')
      return
    }

    setLoading(true)
    try {
      const overallScore = Number(calculateOverall().toFixed(2))
      const overallRating = ratingForScore(overallScore).label

      let assessmentId = assessment?.id

      if (isEdit && assessmentId) {
        const { error: updErr } = await supabase
          .from('audit_psap_assessments')
          .update({
            org_unit_id: orgUnitId,
            financial_year: parseInt(financialYear),
            quarter: parseInt(quarter),
            assessment_date: assessmentDate,
            completed_by: completedBy,
            reviewed_by: reviewedBy && reviewedBy !== 'none' ? reviewedBy : null,
            comments: comments || null,
            overall_score: overallScore,
            overall_rating: overallRating,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', assessmentId)
        if (updErr) throw updErr
        // Replace scores
        await supabase
          .from('audit_psap_assessment_scores')
          .delete()
          .eq('psap_assessment_id', assessmentId)
      } else {
        const { data: created, error: insErr } = await supabase
          .from('audit_psap_assessments')
          .insert({
            org_unit_id: orgUnitId,
            financial_year: parseInt(financialYear),
            quarter: parseInt(quarter),
            assessment_date: assessmentDate,
            completed_by: completedBy,
            reviewed_by: reviewedBy && reviewedBy !== 'none' ? reviewedBy : null,
            comments: comments || null,
          } as any)
          .select()
          .single()
        if (insErr) throw insErr
        assessmentId = (created as any)?.id
      }

      if (!assessmentId) {
        throw new Error('Could not determine the assessment to save scores against')
      }

      // Insert scores (raw_score 0-100 + weighted contribution to the 0-100 total)
      const scoreInserts = standards.map((std) => {
        const raw = scores[std.id]?.score || 0
        return {
          psap_assessment_id: assessmentId,
          psap_standard_id: std.id,
          raw_score: raw,
          weighted_score: Number((raw * ((Number(std.weight) || 0) / totalWeight)).toFixed(2)),
          comments: scores[std.id]?.comments || null,
        }
      })
      const { error: scoresError } = await supabase
        .from('audit_psap_assessment_scores')
        .insert(scoreInserts as any)
      if (scoresError) throw scoresError

      // A DB trigger recomputes overall_score from raw scores on a different
      // scale; re-apply our correct 0-100 value via a parent UPDATE (the trigger
      // fires on the scores table, not on this update, so it sticks).
      await supabase
        .from('audit_psap_assessments')
        .update({ overall_score: overallScore, overall_rating: overallRating } as any)
        .eq('id', assessmentId)

      toast.success(isEdit ? 'PSAP assessment updated' : 'PSAP assessment created')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving assessment:', error)
      const msg = String(error?.message || '')
      // The table has a UNIQUE(org_unit_id, financial_year, quarter) constraint.
      // Turn the raw Postgres 23505 error into a friendly, actionable message.
      const isDuplicate =
        error?.code === '23505' ||
        /duplicate key|already exists|org_unit_id_financial_year_quarter/i.test(msg)
      if (isDuplicate) {
        const unitName =
          orgUnits.find((u) => u.id === orgUnitId)?.name || 'this organization unit'
        toast.error(
          `An assessment for ${unitName} already exists for Q${quarter} ${financialYear}. Open it from the list to edit instead.`,
        )
      } else {
        toast.error(msg || 'Failed to save assessment')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit PSAP Assessment' : 'Create PSAP Assessment'}</DialogTitle>
          <DialogDescription>
            Complete the quarterly PSAP Financial &amp; Governance Standards assessment. Each
            standard is scored 0-100; the overall is a weighted average.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="orgUnit">Organization Unit *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-emerald-700 hover:text-emerald-800"
                  onClick={() => setAddOrgOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" /> New
                </Button>
              </div>
              <Select value={orgUnitId} onValueChange={setOrgUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select org unit" />
                </SelectTrigger>
                <SelectContent>
                  {orgUnits.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-slate-500">
                      No org units — click “New”.
                    </div>
                  ) : (
                    orgUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))
                  )}
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
                  {[2024, 2025, 2026, 2027].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="quarter">Quarter *</Label>
                <HelpTooltip tooltipKey="assessment-period" label="Assessment Period" />
              </div>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((q) => (
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
              <div className="flex items-center justify-between">
                <Label htmlFor="completedBy">Completed By *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-emerald-700 hover:text-emerald-800"
                  onClick={() => setAddPersonOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" /> New
                </Button>
              </div>
              <Select value={completedBy} onValueChange={setCompletedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {people.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-slate-500">
                      No people — click “New”.
                    </div>
                  ) : (
                    people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))
                  )}
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
                  {people.map((person) => (
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
                <p className="text-sm text-slate-600">Overall Score (weighted average)</p>
                <p className="text-2xl font-bold">{overall.toFixed(2)} / 100</p>
              </div>
              <Badge className={rating.color}>{rating.label}</Badge>
            </div>
          </div>

          {/* Standards Scoring Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>PSAP Standards Scores</Label>
              <HelpTooltip tooltipKey="psap-score" label="PSAP Score" />
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-sm font-medium">#</th>
                      <th className="text-left p-2 text-sm font-medium">Standard</th>
                      <th className="text-center p-2 text-sm font-medium">Weight</th>
                      <th className="text-center p-2 text-sm font-medium">Score (0-100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standards.map((standard) => {
                      const score = scores[standard.id]?.score ?? 0
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
                              max="100"
                              step="1"
                              value={score}
                              onChange={(e) => handleScoreChange(standard.id, e.target.value)}
                              className="w-24 text-center"
                            />
                          </td>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Assessment'}
            </Button>
          </DialogFooter>
        </form>

        {/* Inline: Add Organization Unit */}
        <Dialog open={addOrgOpen} onOpenChange={setAddOrgOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Organization Unit</DialogTitle>
              <DialogDescription>Add a unit that can be assessed.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    placeholder="e.g. LTR"
                    value={newOrg.code}
                    onChange={(e) => setNewOrg({ ...newOrg, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newOrg.unit_type}
                    onValueChange={(v) => setNewOrg({ ...newOrg, unit_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Division', 'Section', 'Unit', 'Branch', 'Office'].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Land Titles Registry"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOrgOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleQuickAddOrg} disabled={savingInline}>
                {savingInline && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inline: Add Person */}
        <Dialog open={addPersonOpen} onOpenChange={setAddPersonOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Officer / Person</DialogTitle>
              <DialogDescription>Add someone who can complete or review assessments.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={newPerson.full_name}
                  onChange={(e) => setNewPerson({ ...newPerson, full_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="jane@dlpp.gov.pg"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    placeholder="e.g. Senior Auditor"
                    value={newPerson.role}
                    onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddPersonOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleQuickAddPerson} disabled={savingInline}>
                {savingInline && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Person
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
