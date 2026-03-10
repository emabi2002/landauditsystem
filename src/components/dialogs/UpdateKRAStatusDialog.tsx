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

interface UpdateKRAStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateKRAStatusDialog({
  open,
  onOpenChange,
  onSuccess,
}: UpdateKRAStatusDialogProps) {
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(false)
  const [kras, setKRAs] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [selectedKRA, setSelectedKRA] = useState('')
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear().toString())
  const [quarter, setQuarter] = useState('1')
  const [statusUpdates, setStatusUpdates] = useState<Record<string, {
    status: string
    narrative: string
    challenges: string
    revision: string
  }>>({})

  useEffect(() => {
    if (open) {
      loadKRAs()
    }
  }, [open])

  useEffect(() => {
    if (selectedKRA) {
      loadActivities(selectedKRA)
    }
  }, [selectedKRA])

  const loadKRAs = async () => {
    try {
      const { data } = await supabase
        .from('audit_strategic_kras')
        .select('*, org_units(name)')
        .order('kra_code')

      if (data) setKRAs(data)
    } catch (error) {
      console.error('Error loading KRAs:', error)
      toast.error('Failed to load KRAs')
    }
  }

  const loadActivities = async (kraId: string) => {
    try {
      const { data } = await supabase
        .from('audit_kra_activities')
        .select('*')
        .eq('strategic_kra_id', kraId)
        .order('activity_code')

      if (data) {
        setActivities(data)

        // Initialize status updates
        const updates: Record<string, any> = {}
        ;(data as any[]).forEach((activity: any) => {
          updates[activity.id] = {
            status: 'Not Started',
            narrative: '',
            challenges: '',
            revision: ''
          }
        })
        setStatusUpdates(updates)

        // Load existing status for this quarter if any
        const { data: existingStatus } = await supabase
          .from('audit_kra_activity_quarterly_status')
          .select('*')
          .in('kra_activity_id', (data as any[]).map((a: any) => a.id))
          .eq('financial_year', parseInt(financialYear))
          .eq('quarter', parseInt(quarter))

        if (existingStatus && existingStatus.length > 0) {
          const loadedUpdates = { ...updates }
          ;(existingStatus as any[]).forEach((status: any) => {
            loadedUpdates[status.kra_activity_id] = {
              status: status.status,
              narrative: status.narrative_status || '',
              challenges: status.challenges || '',
              revision: status.revision_next_year || ''
            }
          })
          setStatusUpdates(loadedUpdates)
        }
      }
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    }
  }

  const handleStatusChange = (activityId: string, field: string, value: string) => {
    setStatusUpdates(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [field]: value
      }
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500'
      case 'Ongoing': return 'bg-blue-500'
      case 'Delayed': return 'bg-red-500'
      case 'Not Measurable': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedKRA || activities.length === 0) {
      toast.error('Please select a KRA with activities')
      return
    }

    setLoading(true)
    try {
      const statusInserts = (activities as any[]).map((activity: any) => ({
        kra_activity_id: activity.id,
        financial_year: parseInt(financialYear),
        quarter: parseInt(quarter),
        status: statusUpdates[activity.id]?.status || 'Not Started',
        narrative_status: statusUpdates[activity.id]?.narrative || null,
        challenges: statusUpdates[activity.id]?.challenges || null,
        revision_next_year: statusUpdates[activity.id]?.revision || null,
      }))

      // Upsert (insert or update)
      const { error } = await supabase
        .from('audit_kra_activity_quarterly_status')
        .upsert(statusInserts as any, {
          onConflict: 'kra_activity_id,financial_year,quarter'
        })

      if (error) throw error

      toast.success('KRA status updated successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating KRA status:', error)
      toast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = activities.filter(a =>
    statusUpdates[a.id]?.status === 'Completed'
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update KRA Quarterly Status</DialogTitle>
          <DialogDescription>
            Update the quarterly status for all activities under a KRA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Financial Year</Label>
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
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(q => (
                    <SelectItem key={q} value={q.toString()}>
                      Q{q} {financialYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kra">Select KRA</Label>
              <Select value={selectedKRA} onValueChange={setSelectedKRA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a KRA" />
                </SelectTrigger>
                <SelectContent>
                  {kras.map(kra => (
                    <SelectItem key={kra.id} value={kra.id}>
                      {kra.kra_code}: {kra.kra_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Summary */}
          {activities.length > 0 && (
            <div className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Activities Completed</p>
                  <p className="text-2xl font-bold">{completedCount} / {activities.length}</p>
                </div>
                <Badge className="bg-blue-500">
                  {activities.length > 0
                    ? `${Math.round((completedCount / activities.length) * 100)}%`
                    : '0%'
                  }
                </Badge>
              </div>
            </div>
          )}

          {/* Activities Status Table */}
          {activities.length > 0 && (
            <div className="space-y-2">
              <Label>Activity Status Updates</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-b p-4 hover:bg-slate-50">
                      <div className="flex items-start gap-4 mb-3">
                        <Badge variant="outline" className="mt-1">
                          {activity.activity_code}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Measure: {activity.measure || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 ml-14">
                        <div className="space-y-1">
                          <Label className="text-xs">Status</Label>
                          <Select
                            value={statusUpdates[activity.id]?.status}
                            onValueChange={(value) => handleStatusChange(activity.id, 'status', value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="Delayed">Delayed</SelectItem>
                              <SelectItem value="Not Measurable">Not Measurable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Narrative Status</Label>
                          <Textarea
                            value={statusUpdates[activity.id]?.narrative}
                            onChange={(e) => handleStatusChange(activity.id, 'narrative', e.target.value)}
                            placeholder="e.g., 6 routine audits completed"
                            rows={2}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Challenges</Label>
                          <Textarea
                            value={statusUpdates[activity.id]?.challenges}
                            onChange={(e) => handleStatusChange(activity.id, 'challenges', e.target.value)}
                            placeholder="Any challenges encountered..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Revision for Next Year</Label>
                          <Textarea
                            value={statusUpdates[activity.id]?.revision}
                            onChange={(e) => handleStatusChange(activity.id, 'revision', e.target.value)}
                            placeholder="Planned changes or improvements..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activities.length === 0 && selectedKRA && (
            <div className="text-center py-8 text-slate-500">
              No activities found for this KRA. Please add activities first.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || activities.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
