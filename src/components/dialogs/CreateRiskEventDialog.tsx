'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  FileWarning,
  Building2,
  Users,
  AlertTriangle,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
} from 'lucide-react'
import { useRiskEvents, RiskEventSource } from '@/lib/hooks/useRiskEvents'
import { toast } from 'sonner'

interface CreateRiskEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const sourceOptions: { value: RiskEventSource; label: string; icon: typeof Calendar; description: string }[] = [
  {
    value: 'AAAP',
    label: 'Annual Audit Activity Plan',
    icon: Calendar,
    description: 'Planned audit from the annual risk-based audit plan'
  },
  {
    value: 'Secretary',
    label: 'Secretary Directive',
    icon: FileWarning,
    description: 'Directive from the Office of the Secretary - overrides normal priority'
  },
  {
    value: 'External',
    label: 'External Request',
    icon: Building2,
    description: 'Request from Auditor-General, oversight bodies, or external stakeholders'
  },
  {
    value: 'Internal',
    label: 'Internal Request',
    icon: Users,
    description: 'Request from divisions, sections, or management'
  }
]

const responseTypes = [
  { value: 'Audit', label: 'Audit' },
  { value: 'Review', label: 'Review' },
  { value: 'Investigation', label: 'Investigation' },
  { value: 'Information Request', label: 'Information Request' }
]

const priorities = [
  { value: 'Critical', label: 'Critical', color: 'bg-red-600' },
  { value: 'High', label: 'High', color: 'bg-orange-500' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'Low', label: 'Low', color: 'bg-green-500' }
]

export function CreateRiskEventDialog({ open, onOpenChange, onSuccess }: CreateRiskEventDialogProps) {
  const { risks, categories, divisions, createRiskEvent } = useRiskEvents()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [sourceType, setSourceType] = useState<RiskEventSource | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [primaryRiskId, setPrimaryRiskId] = useState('')
  const [additionalRiskIds, setAdditionalRiskIds] = useState<string[]>([])
  const [responseType, setResponseType] = useState<string>('Audit')
  const [priority, setPriority] = useState<string>('Medium')
  const [auditCategoryId, setAuditCategoryId] = useState('')
  const [targetDivisionId, setTargetDivisionId] = useState('')
  const [requestedStartDate, setRequestedStartDate] = useState('')
  const [requestedCompletionDate, setRequestedCompletionDate] = useState('')

  // Secretary directive specific
  const [directiveReference, setDirectiveReference] = useState('')
  const [directiveDate, setDirectiveDate] = useState('')
  const [directiveIssuer, setDirectiveIssuer] = useState('')
  const [isPriorityOverride, setIsPriorityOverride] = useState(false)

  const resetForm = () => {
    setStep(1)
    setSourceType(null)
    setEventTitle('')
    setEventDescription('')
    setPrimaryRiskId('')
    setAdditionalRiskIds([])
    setResponseType('Audit')
    setPriority('Medium')
    setAuditCategoryId('')
    setTargetDivisionId('')
    setRequestedStartDate('')
    setRequestedCompletionDate('')
    setDirectiveReference('')
    setDirectiveDate('')
    setDirectiveIssuer('')
    setIsPriorityOverride(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!sourceType || !primaryRiskId || !eventTitle || !eventDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const eventData: any = {
        event_title: eventTitle,
        event_description: eventDescription,
        source_type: sourceType,
        primary_risk_id: primaryRiskId,
        response_type: responseType,
        priority: priority,
        audit_category_id: auditCategoryId || null,
        target_division_id: targetDivisionId || null,
        requested_start_date: requestedStartDate || null,
        requested_completion_date: requestedCompletionDate || null,
        event_status: 'Pending'
      }

      // Add secretary directive fields if applicable
      if (sourceType === 'Secretary') {
        eventData.directive_reference = directiveReference || null
        eventData.directive_date = directiveDate || null
        eventData.directive_issuer = directiveIssuer || null
        eventData.is_priority_override = isPriorityOverride
        if (isPriorityOverride) {
          eventData.priority = 'Critical'
        }
      }

      const { error } = await createRiskEvent(eventData, additionalRiskIds)

      if (error) {
        toast.error(error)
        return
      }

      toast.success('Risk Event created successfully')
      handleClose()
      onSuccess?.()
    } catch (err) {
      toast.error('Failed to create risk event')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!sourceType
      case 2: return !!primaryRiskId
      case 3: return !!eventTitle && !!eventDescription
      case 4: return true
      default: return false
    }
  }

  const selectedRisk = risks.find(r => r.id === primaryRiskId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Create Risk Event
          </DialogTitle>
          <DialogDescription>
            Create a new risk event to initiate an audit, review, or investigation.
            All audit activities must originate from a risk event.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-slate-900 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Source */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Step 1: Select Event Source</h3>
            <p className="text-sm text-slate-500">
              Choose how this audit activity was initiated
            </p>
            <div className="grid grid-cols-1 gap-3">
              {sourceOptions.map((option) => {
                const Icon = option.icon
                const isSelected = sourceType === option.value
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900'
                        : 'hover:border-slate-400'
                    }`}
                    onClick={() => setSourceType(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">{option.label}</span>
                            {option.value === 'Secretary' && (
                              <Badge variant="destructive" className="text-xs">
                                Priority Override
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Link to Risk Register */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Step 2: Link to Risk Register</h3>
            <p className="text-sm text-slate-500">
              Select the primary risk this event addresses. All events must be anchored to the Risk Register.
            </p>

            <div className="space-y-2">
              <Label>Primary Risk *</Label>
              <Select value={primaryRiskId} onValueChange={setPrimaryRiskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a risk from the register" />
                </SelectTrigger>
                <SelectContent>
                  {risks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{risk.risk_code}</span>
                        <span className="text-slate-500">-</span>
                        <span className="truncate max-w-[300px]">{risk.risk_title}</span>
                        <Badge
                          className={
                            risk.residual_risk_rating === 'Extreme' ? 'bg-red-600' :
                            risk.residual_risk_rating === 'High' ? 'bg-orange-500' :
                            risk.residual_risk_rating === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }
                        >
                          {risk.residual_risk_rating}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRisk && (
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{selectedRisk.risk_code}: {selectedRisk.risk_title}</div>
                      <p className="text-sm text-slate-600 mt-1">{selectedRisk.risk_description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Category: {selectedRisk.risk_category}</span>
                        <span>Rating: {selectedRisk.residual_risk_rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="pt-4">
              <Label className="text-sm text-slate-500">Additional Linked Risks (Optional)</Label>
              <p className="text-xs text-slate-400 mb-2">Select additional risks this event will address</p>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {risks
                  .filter(r => r.id !== primaryRiskId)
                  .map((risk) => (
                    <label
                      key={risk.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={additionalRiskIds.includes(risk.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAdditionalRiskIds([...additionalRiskIds, risk.id])
                          } else {
                            setAdditionalRiskIds(additionalRiskIds.filter(id => id !== risk.id))
                          }
                        }}
                      />
                      <span className="text-sm font-medium">{risk.risk_code}</span>
                      <span className="text-sm text-slate-500 truncate">{risk.risk_title}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Event Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Step 3: Event Details</h3>
            <p className="text-sm text-slate-500">
              Provide details about the audit activity
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter a descriptive title for this event"
                />
              </div>

              <div>
                <Label htmlFor="eventDescription">Description *</Label>
                <Textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe the objective and scope of this audit activity"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Response Type</Label>
                  <Select value={responseType} onValueChange={setResponseType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Audit Category</Label>
                  <Select value={auditCategoryId} onValueChange={setAuditCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secretary Directive Fields */}
              {sourceType === 'Secretary' && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <FileWarning className="h-5 w-5" />
                      <span className="font-medium">Secretary Directive Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Directive Reference</Label>
                        <Input
                          value={directiveReference}
                          onChange={(e) => setDirectiveReference(e.target.value)}
                          placeholder="e.g., SEC/DIR/2024/001"
                        />
                      </div>
                      <div>
                        <Label>Directive Date</Label>
                        <Input
                          type="date"
                          value={directiveDate}
                          onChange={(e) => setDirectiveDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Issued By</Label>
                      <Input
                        value={directiveIssuer}
                        onChange={(e) => setDirectiveIssuer(e.target.value)}
                        placeholder="Name or title of issuer"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={isPriorityOverride}
                        onCheckedChange={(checked) => setIsPriorityOverride(checked as boolean)}
                      />
                      <span className="text-sm font-medium text-red-800">
                        Priority Override - This directive overrides normal audit planning priorities
                      </span>
                    </label>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Scheduling & Allocation */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Step 4: Scheduling & Priority</h3>
            <p className="text-sm text-slate-500">
              Set priority level and target dates (optional - can be set later by Audit Manager)
            </p>

            <div className="space-y-4">
              <div>
                <Label>Priority Level</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {priorities.map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant={priority === p.value ? "default" : "outline"}
                      className={priority === p.value ? p.color : ''}
                      onClick={() => setPriority(p.value)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Division</Label>
                <Select value={targetDivisionId} onValueChange={setTargetDivisionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested Start Date</Label>
                  <Input
                    type="date"
                    value={requestedStartDate}
                    onChange={(e) => setRequestedStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Requested Completion Date</Label>
                  <Input
                    type="date"
                    value={requestedCompletionDate}
                    onChange={(e) => setRequestedCompletionDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-slate-50 mt-6">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Event Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source:</span>
                      <span className="font-medium">{sourceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Risk:</span>
                      <span className="font-medium">{selectedRisk?.risk_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Response Type:</span>
                      <span className="font-medium">{responseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Priority:</span>
                      <Badge className={priorities.find(p => p.value === priority)?.color || ''}>
                        {priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Create Risk Event
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
