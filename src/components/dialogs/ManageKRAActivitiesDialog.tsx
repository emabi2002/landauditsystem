'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useKRAs } from '@/lib/hooks/useKRAs'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Target } from 'lucide-react'

interface ManageKRAActivitiesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kra: { id: string; kra_code: string; kra_title: string } | null
  onChanged?: () => void
}

export function ManageKRAActivitiesDialog({
  open,
  onOpenChange,
  kra,
  onChanged,
}: ManageKRAActivitiesDialogProps) {
  const { fetchActivities, createActivity, deleteActivity } = useKRAs()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    activity_code: '',
    description: '',
    measure: '',
    baseline: '',
    annual_target: '',
  })

  const load = useCallback(async () => {
    if (!kra) return
    setLoading(true)
    const { data } = await fetchActivities(kra.id)
    setActivities(data)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kra])

  useEffect(() => {
    if (open && kra) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kra])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kra) return
    if (!form.description.trim()) {
      toast.error('Activity description is required')
      return
    }
    setSaving(true)
    const { error } = await createActivity({
      strategic_kra_id: kra.id,
      activity_code: form.activity_code.trim() || undefined,
      description: form.description.trim(),
      measure: form.measure.trim() || undefined,
      baseline: form.baseline.trim() || undefined,
      annual_target: form.annual_target.trim() || undefined,
    })
    setSaving(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Activity added')
    setForm({ activity_code: '', description: '', measure: '', baseline: '', annual_target: '' })
    load()
    onChanged?.()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity? Its quarterly statuses will also be removed.')) return
    const { error } = await deleteActivity(id)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Activity deleted')
    load()
    onChanged?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Activities — {kra?.kra_code}
          </DialogTitle>
          <DialogDescription>{kra?.kra_title}</DialogDescription>
        </DialogHeader>

        {/* Existing activities */}
        <div className="space-y-2">
          <Label>Current Activities</Label>
          {loading ? (
            <div className="text-center py-6 text-slate-500 text-sm">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm border rounded-lg">
              No activities yet. Add the first one below.
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {a.activity_code && (
                    <Badge variant="outline" className="mt-0.5 shrink-0">
                      {a.activity_code}
                    </Badge>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.description}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      {a.measure && <span>Measure: {a.measure}</span>}
                      {a.baseline && <span>Baseline: {a.baseline}</span>}
                      {a.annual_target && <span>Target: {a.annual_target}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 shrink-0"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new activity */}
        <form onSubmit={handleAdd} className="space-y-4 border-t pt-4">
          <Label className="text-sm font-semibold">Add Activity</Label>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input
                placeholder="a)"
                value={form.activity_code}
                onChange={(e) => setForm({ ...form, activity_code: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-3">
              <Label className="text-xs">Description *</Label>
              <Input
                placeholder="e.g. Conduct DLPP audits and investigations"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Measure</Label>
              <Input
                placeholder="e.g. # audits"
                value={form.measure}
                onChange={(e) => setForm({ ...form, measure: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Baseline</Label>
              <Input
                placeholder="e.g. 4"
                value={form.baseline}
                onChange={(e) => setForm({ ...form, baseline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Annual Target</Label>
              <Input
                placeholder="e.g. 8"
                value={form.annual_target}
                onChange={(e) => setForm({ ...form, annual_target: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
