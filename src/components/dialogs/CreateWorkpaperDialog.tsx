'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, Paperclip, Trash2, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import type {
  WorkpaperWithEngagement,
  WorkpaperEvidence,
} from '@/lib/hooks/useWorkpapers'

interface EngagementOption {
  id: string
  title: string
  engagement_number?: string | null
}

interface CreateWorkpaperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  engagements: EngagementOption[]
  /** When provided, the dialog operates in edit mode. */
  workpaper?: WorkpaperWithEngagement | null
  createWorkpaper: (
    payload: Record<string, unknown>
  ) => Promise<{ data: WorkpaperWithEngagement | null; error: Error | null }>
  updateWorkpaper: (
    id: string,
    updates: Record<string, unknown>
  ) => Promise<{ data: WorkpaperWithEngagement | null; error: Error | null }>
  fetchEvidence: (
    workpaperId: string
  ) => Promise<{ data: WorkpaperEvidence[]; error: Error | null }>
  uploadEvidence: (
    workpaperId: string,
    file: File,
    description?: string
  ) => Promise<{ data: WorkpaperEvidence | null; error: Error | null }>
  getEvidenceUrl: (filePath: string) => Promise<string | null>
  deleteEvidence: (evidence: WorkpaperEvidence) => Promise<{ error: Error | null }>
}

const CONCLUSION_RATINGS = ['Effective', 'Partially Effective', 'Ineffective', 'Not Concluded']
const STATUSES = ['Draft', 'In Review', 'Completed']

const emptyForm = {
  engagement_id: '',
  title: '',
  test_objective: '',
  procedure_performed: '',
  sample_population: '',
  result: '',
  conclusion: '',
  conclusion_rating: 'Not Concluded',
  status: 'Draft',
  prepared_by: '',
}

export function CreateWorkpaperDialog({
  open,
  onOpenChange,
  onSuccess,
  engagements,
  workpaper,
  createWorkpaper,
  updateWorkpaper,
  fetchEvidence,
  uploadEvidence,
  getEvidenceUrl,
  deleteEvidence,
}: CreateWorkpaperDialogProps) {
  const isEdit = Boolean(workpaper)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Evidence
  const [existingEvidence, setExistingEvidence] = useState<WorkpaperEvidence[]>([])
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [uploadingEvidence, setUploadingEvidence] = useState(false)

  const loadEvidence = useCallback(
    async (id: string) => {
      const { data } = await fetchEvidence(id)
      setExistingEvidence(data)
    },
    [fetchEvidence]
  )

  useEffect(() => {
    if (!open) return
    if (workpaper) {
      setForm({
        engagement_id: workpaper.engagement_id || '',
        title: workpaper.title || '',
        test_objective: workpaper.test_objective || '',
        procedure_performed: workpaper.procedure_performed || '',
        sample_population: workpaper.sample_population || '',
        result: workpaper.result || '',
        conclusion: workpaper.conclusion || '',
        conclusion_rating: workpaper.conclusion_rating || 'Not Concluded',
        status: workpaper.status || 'Draft',
        prepared_by: workpaper.prepared_by || '',
      })
      loadEvidence(workpaper.id)
    } else {
      setForm(emptyForm)
      setExistingEvidence([])
    }
    setQueuedFiles([])
    setEvidenceDescription('')
  }, [open, workpaper, loadEvidence])

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setQueuedFiles((prev) => [...prev, ...Array.from(files)])
    e.target.value = ''
  }

  const removeQueued = (index: number) =>
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))

  const handleImmediateUpload = async () => {
    if (!workpaper || queuedFiles.length === 0) return
    setUploadingEvidence(true)
    let ok = 0
    for (const file of queuedFiles) {
      const { error } = await uploadEvidence(workpaper.id, file, evidenceDescription)
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`)
      } else {
        ok++
      }
    }
    if (ok > 0) toast.success(`Uploaded ${ok} evidence file(s)`)
    setQueuedFiles([])
    setEvidenceDescription('')
    await loadEvidence(workpaper.id)
    setUploadingEvidence(false)
  }

  const handleDownload = async (ev: WorkpaperEvidence) => {
    const url = await getEvidenceUrl(ev.file_path)
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('Could not generate a download link (is the storage bucket set up?)')
    }
  }

  const handleDeleteEvidence = async (ev: WorkpaperEvidence) => {
    const { error } = await deleteEvidence(ev)
    if (error) {
      toast.error('Failed to delete evidence: ' + error.message)
    } else {
      toast.success('Evidence removed')
      if (workpaper) loadEvidence(workpaper.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.engagement_id) {
      toast.error('Please select the engagement this workpaper belongs to.')
      return
    }
    if (!form.title.trim()) {
      toast.error('A workpaper title is required.')
      return
    }

    setSubmitting(true)

    const payload = {
      engagement_id: form.engagement_id,
      title: form.title.trim(),
      test_objective: form.test_objective || null,
      procedure_performed: form.procedure_performed || null,
      sample_population: form.sample_population || null,
      result: form.result || null,
      conclusion: form.conclusion || null,
      conclusion_rating: form.conclusion_rating,
      status: form.status,
      prepared_by: form.prepared_by || null,
    }

    if (isEdit && workpaper) {
      const { error } = await updateWorkpaper(workpaper.id, payload)
      if (error) {
        toast.error('Failed to update workpaper: ' + error.message)
        setSubmitting(false)
        return
      }
      toast.success('Workpaper updated')
    } else {
      const wpNumber = `WP-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`
      const { data, error } = await createWorkpaper({ ...payload, wp_number: wpNumber })
      if (error || !data) {
        toast.error('Failed to create workpaper: ' + (error?.message ?? 'unknown error'))
        setSubmitting(false)
        return
      }
      // Upload any queued evidence now that we have an id.
      if (queuedFiles.length > 0) {
        let ok = 0
        for (const file of queuedFiles) {
          const res = await uploadEvidence(data.id, file, evidenceDescription)
          if (!res.error) ok++
        }
        if (ok > 0) toast.success(`Created workpaper with ${ok} evidence file(s)`)
        else toast.success('Workpaper created')
      } else {
        toast.success('Workpaper created')
      }
    }

    setSubmitting(false)
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Workpaper' : 'New Workpaper'}</DialogTitle>
            <DialogDescription>
              Document the objective, procedure, result and conclusion for a test, then attach the
              evidence that supports it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Engagement */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Engagement *
                <HelpTooltip content="Select the audit engagement this workpaper belongs to. Workpapers are the evidence file for that engagement." label="Engagement" />
              </Label>
              <Select value={form.engagement_id} onValueChange={(v) => update('engagement_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an engagement" />
                </SelectTrigger>
                <SelectContent>
                  {engagements.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500">No engagements available</div>
                  ) : (
                    engagements.map((eng) => (
                      <SelectItem key={eng.id} value={eng.id}>
                        {eng.engagement_number ? `${eng.engagement_number} — ` : ''}
                        {eng.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label>Workpaper Title *</Label>
              <Input
                placeholder="e.g., Test of land-title fee banking within 24 hours"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </div>

            {/* Test objective */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Test Objective
                <HelpTooltip tooltipKey="test-objective" label="Test Objective" />
              </Label>
              <Textarea
                placeholder="State what this test is designed to confirm..."
                value={form.test_objective}
                onChange={(e) => update('test_objective', e.target.value)}
                rows={2}
              />
            </div>

            {/* Procedure */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Procedure Performed
                <HelpTooltip tooltipKey="procedure-performed" label="Procedure Performed" />
              </Label>
              <Textarea
                placeholder="Document the exact steps you carried out so the test can be re-performed..."
                value={form.procedure_performed}
                onChange={(e) => update('procedure_performed', e.target.value)}
                rows={3}
              />
            </div>

            {/* Sample / population */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Sample / Population
                <HelpTooltip tooltipKey="sample-population" label="Sample / Population" />
              </Label>
              <Textarea
                placeholder="Describe what was examined and how the sample was selected..."
                value={form.sample_population}
                onChange={(e) => update('sample_population', e.target.value)}
                rows={2}
              />
            </div>

            {/* Result */}
            <div className="space-y-1.5">
              <Label>Result</Label>
              <Textarea
                placeholder="What the test showed, including any exceptions..."
                value={form.result}
                onChange={(e) => update('result', e.target.value)}
                rows={2}
              />
            </div>

            {/* Conclusion */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Conclusion
                <HelpTooltip tooltipKey="conclusion" label="Conclusion" />
              </Label>
              <Textarea
                placeholder="Your professional conclusion on whether the control operated effectively..."
                value={form.conclusion}
                onChange={(e) => update('conclusion', e.target.value)}
                rows={2}
              />
            </div>

            {/* Rating + status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Conclusion Rating</Label>
                <Select
                  value={form.conclusion_rating}
                  onValueChange={(v) => update('conclusion_rating', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCLUSION_RATINGS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prepared by */}
            <div className="space-y-1.5">
              <Label>Prepared By</Label>
              <Input
                placeholder="Auditor name"
                value={form.prepared_by}
                onChange={(e) => update('prepared_by', e.target.value)}
              />
            </div>

            {/* Evidence */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-800">Evidence</span>
                <HelpTooltip tooltipKey="evidence-upload" label="Evidence upload" />
              </div>

              {/* Existing evidence (edit mode) */}
              {isEdit && existingEvidence.length > 0 && (
                <div className="space-y-1.5">
                  {existingEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-700">{ev.file_name}</p>
                        {ev.description && (
                          <p className="truncate text-xs text-slate-500">{ev.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(ev)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(ev)}
                        className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Queued files (create mode, or pending in edit mode) */}
              {queuedFiles.length > 0 && (
                <div className="space-y-1.5">
                  {queuedFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-slate-700">{file.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {isEdit ? 'ready to upload' : 'attaches on save'}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeQueued(i)}
                        className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Input
                placeholder="Optional: describe what this evidence proves"
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">
                  <Upload className="h-3.5 w-3.5" />
                  Choose files
                  <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                </label>
                {isEdit && queuedFiles.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleImmediateUpload}
                    disabled={uploadingEvidence}
                  >
                    {uploadingEvidence ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Uploading…
                      </>
                    ) : (
                      <>Upload {queuedFiles.length} file(s)</>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Files are stored privately in the <code>workpaper-evidence</code> bucket and linked
                to this workpaper.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Workpaper'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
