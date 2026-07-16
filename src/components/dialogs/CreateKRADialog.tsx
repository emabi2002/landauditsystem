'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export interface KRAToEdit {
  id: string
  org_unit_id?: string | null
  kra_code: string
  kra_title: string
  purpose: string | null
  start_year: number
  end_year: number | null
}

interface CreateKRADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  kra?: KRAToEdit | null
}

export function CreateKRADialog({ open, onOpenChange, onSuccess, kra }: CreateKRADialogProps) {
  const supabase = createClientComponentClient<Database>()
  const isEdit = !!kra
  const currentYear = new Date().getFullYear()

  const [loading, setLoading] = useState(false)
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [form, setForm] = useState({
    org_unit_id: 'none',
    kra_code: '',
    kra_title: '',
    purpose: '',
    start_year: currentYear.toString(),
    end_year: 'ongoing',
  })

  useEffect(() => {
    if (!open) return
    supabase
      .from('org_units')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setOrgUnits((data as any[]) || []))

    if (isEdit && kra) {
      setForm({
        org_unit_id: kra.org_unit_id || 'none',
        kra_code: kra.kra_code,
        kra_title: kra.kra_title,
        purpose: kra.purpose || '',
        start_year: String(kra.start_year || currentYear),
        end_year: kra.end_year ? String(kra.end_year) : 'ongoing',
      })
    } else {
      setForm({
        org_unit_id: 'none',
        kra_code: '',
        kra_title: '',
        purpose: '',
        start_year: currentYear.toString(),
        end_year: 'ongoing',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.kra_code.trim() || !form.kra_title.trim()) {
      toast.error('KRA code and title are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        org_unit_id: form.org_unit_id !== 'none' ? form.org_unit_id : null,
        kra_code: form.kra_code.toUpperCase().trim(),
        kra_title: form.kra_title.trim(),
        purpose: form.purpose.trim() || null,
        start_year: parseInt(form.start_year),
        end_year: form.end_year !== 'ongoing' ? parseInt(form.end_year) : null,
      }
      if (isEdit && kra) {
        const { error } = await supabase
          .from('audit_strategic_kras')
          .update({ ...payload, updated_at: new Date().toISOString() } as any)
          .eq('id', kra.id)
        if (error) throw error
        toast.success('KRA updated')
      } else {
        const { error } = await supabase.from('audit_strategic_kras').insert(payload as any)
        if (error) {
          if (error.code === '23505') {
            toast.error('A KRA with this code already exists')
            return
          }
          throw error
        }
        toast.success('KRA created')
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to save KRA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit KRA' : 'New Key Result Area'}</DialogTitle>
          <DialogDescription>
            Define a Key Result Area for an organizational unit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>KRA Code *</Label>
                <Input
                  placeholder="e.g. KRA-1"
                  value={form.kra_code}
                  onChange={(e) => setForm({ ...form, kra_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Org Unit</Label>
                <Select value={form.org_unit_id} onValueChange={(v) => setForm({ ...form, org_unit_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select org unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {orgUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>KRA Title *</Label>
              <Input
                placeholder="e.g. Strengthen internal audit & governance"
                value={form.kra_title}
                onChange={(e) => setForm({ ...form, kra_title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                placeholder="What this KRA aims to achieve..."
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Year *</Label>
                <Select value={form.start_year} onValueChange={(v) => setForm({ ...form, start_year: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Year</Label>
                <Select value={form.end_year} onValueChange={(v) => setForm({ ...form, end_year: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create KRA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
