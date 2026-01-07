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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreateRiskProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateRiskProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRiskProfileDialogProps) {
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(false)
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])

  // Form state
  const [orgUnitId, setOrgUnitId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [profileDate, setProfileDate] = useState(new Date().toISOString().split('T')[0])
  const [preparedBy, setPreparedBy] = useState('')
  const [reviewedBy, setReviewedBy] = useState('')
  const [overallLevel, setOverallLevel] = useState<string>('')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
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

      if (orgUnitsData) setOrgUnits(orgUnitsData)
      if (peopleData) setPeople(peopleData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgUnitId || !preparedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_risk_profiles')
        .insert({
          org_unit_id: orgUnitId,
          project_name: projectName || null,
          profile_date: profileDate,
          prepared_by: preparedBy,
          reviewed_by: (reviewedBy && reviewedBy !== 'none') ? reviewedBy : null,
          overall_level: (overallLevel && overallLevel !== 'not_set') ? overallLevel as any : null,
          remarks: remarks || null,
        } as any)
        .select()
        .single()

      if (error) throw error

      toast.success('Risk Profile created successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating risk profile:', error)
      toast.error(error.message || 'Failed to create risk profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Risk Profile</DialogTitle>
          <DialogDescription>
            Create a new risk assessment profile for an organizational unit or project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="projectName">Project Name (Optional)</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., IT Security Audit 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileDate">Profile Date *</Label>
              <Input
                type="date"
                value={profileDate}
                onChange={(e) => setProfileDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overallLevel">Overall Risk Level</Label>
              <Select value={overallLevel} onValueChange={setOverallLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_set">Not Set</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedBy">Prepared By *</Label>
              <Select value={preparedBy} onValueChange={setPreparedBy}>
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any general remarks about this risk profile..."
                rows={3}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Next Steps:</strong>
            </p>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li>Create the risk profile</li>
              <li>Add individual risks using the matrix editor</li>
              <li>Set likelihood and impact for each risk</li>
              <li>Risk scores and levels will be calculated automatically</li>
            </ol>
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
              Create Risk Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
