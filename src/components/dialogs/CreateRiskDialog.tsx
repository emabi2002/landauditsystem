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
import { Checkbox } from '@/components/ui/checkbox'
import { useRiskRegister } from '@/lib/hooks/useRiskRegister'
import type { RiskCategory, RiskTreatment, OversightBody, ReviewFrequency, ComplianceType } from '@/lib/database.types'
import { toast } from 'sonner'
import { Loader2, Plus, X, AlertTriangle } from 'lucide-react'

interface CreateRiskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const riskCategories: RiskCategory[] = [
  'Strategic', 'Operational', 'Financial', 'Compliance',
  'Reputational', 'Technology', 'Governance', 'External'
]

const oversightBodies: OversightBody[] = [
  'Audit Committee', 'Secretary', 'Executive Management',
  'Board', 'Division Head', 'Internal Audit'
]

const riskTreatments: RiskTreatment[] = ['Mitigate', 'Transfer', 'Accept', 'Avoid']

const reviewFrequencies: ReviewFrequency[] = ['Monthly', 'Quarterly', 'Bi-annually', 'Annually']

const complianceTypes: ComplianceType[] = ['Mandatory', 'Advisory', 'Best Practice']

export function CreateRiskDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRiskDialogProps) {
  const { divisions, legalInstruments, createRisk, fetchDivisions, fetchLegalInstruments } = useRiskRegister()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Form state - Step 1: Basic Info
  const [riskCode, setRiskCode] = useState('')
  const [riskTitle, setRiskTitle] = useState('')
  const [riskDescription, setRiskDescription] = useState('')
  const [riskCategory, setRiskCategory] = useState<RiskCategory>('Operational')
  const [riskSubcategory, setRiskSubcategory] = useState('')
  const [divisionId, setDivisionId] = useState('')

  // Form state - Step 2: Risk Assessment
  const [inherentLikelihood, setInherentLikelihood] = useState(3)
  const [inherentImpact, setInherentImpact] = useState(3)
  const [controlDescription, setControlDescription] = useState('')
  const [controlEffectiveness, setControlEffectiveness] = useState<string>('Partially Effective')
  const [residualLikelihood, setResidualLikelihood] = useState(2)
  const [residualImpact, setResidualImpact] = useState(3)

  // Form state - Step 3: Ownership & Treatment
  const [riskOwnerRole, setRiskOwnerRole] = useState('')
  const [oversightBody, setOversightBody] = useState<OversightBody>('Audit Committee')
  const [riskTreatment, setRiskTreatment] = useState<RiskTreatment>('Mitigate')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [reviewFrequency, setReviewFrequency] = useState<ReviewFrequency>('Quarterly')

  // Form state - Step 4: Legal References
  const [legalReferences, setLegalReferences] = useState<{
    legal_instrument_id: string
    section_reference: string
    compliance_type: ComplianceType
  }[]>([])
  const [selectedInstrument, setSelectedInstrument] = useState('')
  const [sectionRef, setSectionRef] = useState('')
  const [complianceType, setComplianceType] = useState<ComplianceType>('Mandatory')

  useEffect(() => {
    if (open) {
      fetchDivisions()
      fetchLegalInstruments()
    }
  }, [open, fetchDivisions, fetchLegalInstruments])

  const addLegalReference = () => {
    if (!selectedInstrument) {
      toast.error('Please select a legal instrument')
      return
    }

    // Check for duplicates
    if (legalReferences.some(ref =>
      ref.legal_instrument_id === selectedInstrument &&
      ref.section_reference === sectionRef
    )) {
      toast.error('This legal reference already exists')
      return
    }

    setLegalReferences([
      ...legalReferences,
      {
        legal_instrument_id: selectedInstrument,
        section_reference: sectionRef,
        compliance_type: complianceType
      }
    ])

    // Reset
    setSelectedInstrument('')
    setSectionRef('')
    setComplianceType('Mandatory')
  }

  const removeLegalReference = (index: number) => {
    setLegalReferences(legalReferences.filter((_, i) => i !== index))
  }

  const getInstrumentName = (id: string) => {
    const instrument = legalInstruments.find(i => i.id === id)
    return instrument ? `${instrument.code} - ${instrument.title}` : id
  }

  const getRiskRating = (likelihood: number, impact: number) => {
    const score = likelihood * impact
    if (score >= 20) return { rating: 'Extreme', color: 'bg-red-600' }
    if (score >= 12) return { rating: 'High', color: 'bg-orange-500' }
    if (score >= 6) return { rating: 'Medium', color: 'bg-yellow-500' }
    return { rating: 'Low', color: 'bg-green-500' }
  }

  const inherentRating = getRiskRating(inherentLikelihood, inherentImpact)
  const residualRating = getRiskRating(residualLikelihood, residualImpact)

  const handleSubmit = async () => {
    if (!riskCode || !riskTitle || !riskDescription || !riskCategory) {
      toast.error('Please fill in all required fields')
      return
    }

    if (legalReferences.length === 0) {
      toast.error('At least one legal reference is required')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await createRisk(
        {
          risk_code: riskCode,
          risk_title: riskTitle,
          risk_description: riskDescription,
          risk_category: riskCategory,
          risk_subcategory: riskSubcategory || null,
          division_id: divisionId || null,
          inherent_likelihood: inherentLikelihood,
          inherent_impact: inherentImpact,
          control_description: controlDescription || null,
          control_effectiveness: controlEffectiveness as any,
          residual_likelihood: residualLikelihood,
          residual_impact: residualImpact,
          risk_owner_role: riskOwnerRole || null,
          oversight_body: oversightBody,
          risk_treatment: riskTreatment,
          treatment_plan: treatmentPlan || null,
          review_frequency: reviewFrequency,
          risk_status: 'Active',
          is_system_risk: false
        },
        legalReferences
      )

      if (error) throw new Error(error)

      toast.success('Risk created successfully')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating risk:', error)
      toast.error(error.message || 'Failed to create risk')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setRiskCode('')
    setRiskTitle('')
    setRiskDescription('')
    setRiskCategory('Operational')
    setRiskSubcategory('')
    setDivisionId('')
    setInherentLikelihood(3)
    setInherentImpact(3)
    setControlDescription('')
    setControlEffectiveness('Partially Effective')
    setResidualLikelihood(2)
    setResidualImpact(3)
    setRiskOwnerRole('')
    setOversightBody('Audit Committee')
    setRiskTreatment('Mitigate')
    setTreatmentPlan('')
    setReviewFrequency('Quarterly')
    setLegalReferences([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Risk to Register</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 ? 'Basic Information' : step === 2 ? 'Risk Assessment' : step === 3 ? 'Ownership & Treatment' : 'Legal References'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${s <= step ? 'bg-slate-900' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskCode">Risk Code *</Label>
                <Input
                  id="riskCode"
                  value={riskCode}
                  onChange={(e) => setRiskCode(e.target.value.toUpperCase())}
                  placeholder="e.g., DLPP-LT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={riskCategory} onValueChange={(v) => setRiskCategory(v as RiskCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Risk Title *</Label>
              <Input
                id="title"
                value={riskTitle}
                onChange={(e) => setRiskTitle(e.target.value)}
                placeholder="Short descriptive title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Risk Description *</Label>
              <Textarea
                id="description"
                value={riskDescription}
                onChange={(e) => setRiskDescription(e.target.value)}
                placeholder="Detailed description of the risk..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={riskSubcategory}
                  onChange={(e) => setRiskSubcategory(e.target.value)}
                  placeholder="e.g., Title Integrity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select value={divisionId} onValueChange={setDivisionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map(div => (
                      <SelectItem key={div.id} value={div.id}>{div.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Risk Assessment */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Inherent Risk */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Inherent Risk (Before Controls)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Likelihood (1-5)</Label>
                  <Select value={inherentLikelihood.toString()} onValueChange={(v) => setInherentLikelihood(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Rare</SelectItem>
                      <SelectItem value="2">2 - Unlikely</SelectItem>
                      <SelectItem value="3">3 - Possible</SelectItem>
                      <SelectItem value="4">4 - Likely</SelectItem>
                      <SelectItem value="5">5 - Almost Certain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impact (1-5)</Label>
                  <Select value={inherentImpact.toString()} onValueChange={(v) => setInherentImpact(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Insignificant</SelectItem>
                      <SelectItem value="2">2 - Minor</SelectItem>
                      <SelectItem value="3">3 - Moderate</SelectItem>
                      <SelectItem value="4">4 - Major</SelectItem>
                      <SelectItem value="5">5 - Catastrophic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="pt-2">
                    <Badge className={`${inherentRating.color} text-white`}>
                      {inherentRating.rating} ({inherentLikelihood * inherentImpact})
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <Label>Existing Controls</Label>
              <Textarea
                value={controlDescription}
                onChange={(e) => setControlDescription(e.target.value)}
                placeholder="Describe existing controls..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Control Effectiveness</Label>
              <Select value={controlEffectiveness} onValueChange={setControlEffectiveness}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Effective">Effective</SelectItem>
                  <SelectItem value="Partially Effective">Partially Effective</SelectItem>
                  <SelectItem value="Ineffective">Ineffective</SelectItem>
                  <SelectItem value="Not Tested">Not Tested</SelectItem>
                  <SelectItem value="No Controls">No Controls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Residual Risk */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Residual Risk (After Controls)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Likelihood (1-5)</Label>
                  <Select value={residualLikelihood.toString()} onValueChange={(v) => setResidualLikelihood(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Rare</SelectItem>
                      <SelectItem value="2">2 - Unlikely</SelectItem>
                      <SelectItem value="3">3 - Possible</SelectItem>
                      <SelectItem value="4">4 - Likely</SelectItem>
                      <SelectItem value="5">5 - Almost Certain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impact (1-5)</Label>
                  <Select value={residualImpact.toString()} onValueChange={(v) => setResidualImpact(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Insignificant</SelectItem>
                      <SelectItem value="2">2 - Minor</SelectItem>
                      <SelectItem value="3">3 - Moderate</SelectItem>
                      <SelectItem value="4">4 - Major</SelectItem>
                      <SelectItem value="5">5 - Catastrophic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="pt-2">
                    <Badge className={`${residualRating.color} text-white`}>
                      {residualRating.rating} ({residualLikelihood * residualImpact})
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Ownership & Treatment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Owner Role</Label>
                <Input
                  value={riskOwnerRole}
                  onChange={(e) => setRiskOwnerRole(e.target.value)}
                  placeholder="e.g., Registrar of Titles"
                />
              </div>
              <div className="space-y-2">
                <Label>Oversight Body</Label>
                <Select value={oversightBody} onValueChange={(v) => setOversightBody(v as OversightBody)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {oversightBodies.map(body => (
                      <SelectItem key={body} value={body}>{body}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Treatment</Label>
                <Select value={riskTreatment} onValueChange={(v) => setRiskTreatment(v as RiskTreatment)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskTreatments.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Review Frequency</Label>
                <Select value={reviewFrequency} onValueChange={(v) => setReviewFrequency(v as ReviewFrequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewFrequencies.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Treatment Plan</Label>
              <Textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Describe the treatment plan for this risk..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Legal References */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Legal Reference Required</p>
                <p className="text-sm text-amber-700">
                  Every risk must be anchored to at least one legal instrument (Act, Regulation, or Policy).
                </p>
              </div>
            </div>

            {/* Add Legal Reference */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Add Legal Reference</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Legal Instrument</Label>
                  <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalInstruments.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.code} - {inst.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Compliance Type</Label>
                  <Select value={complianceType} onValueChange={(v) => setComplianceType(v as ComplianceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Section Reference</Label>
                <Input
                  value={sectionRef}
                  onChange={(e) => setSectionRef(e.target.value)}
                  placeholder="e.g., Section 45(2)(a)"
                />
              </div>
              <Button type="button" variant="outline" onClick={addLegalReference}>
                <Plus className="mr-2 h-4 w-4" />
                Add Reference
              </Button>
            </div>

            {/* Current References */}
            {legalReferences.length > 0 && (
              <div className="space-y-2">
                <Label>Current Legal References ({legalReferences.length})</Label>
                <div className="space-y-2">
                  {legalReferences.map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                      <div>
                        <div className="font-medium text-sm">{getInstrumentName(ref.legal_instrument_id)}</div>
                        {ref.section_reference && (
                          <div className="text-xs text-slate-500">{ref.section_reference}</div>
                        )}
                        <Badge variant="outline" className="mt-1">{ref.compliance_type}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLegalReference(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {legalReferences.length === 0 && (
              <div className="text-center py-4 text-slate-500 border border-dashed rounded-lg">
                No legal references added yet. Add at least one to proceed.
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || legalReferences.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Risk
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
