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

// Risk Matrix Categories
const CONTEXT_CATEGORIES = [
  'External Environment',
  'Compliance',
  'Organisational Culture',
  'Business Processes',
  'Education & Skills / People'
]

const RESOURCE_CATEGORIES = [
  'Human Resources',
  'Financial Resources',
  'Information Resources',
  'Infrastructure & Physical Assets'
]

interface AddRiskItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  riskProfileId: string
  onSuccess?: () => void
}

export function AddRiskItemDialog({
  open,
  onOpenChange,
  riskProfileId,
  onSuccess,
}: AddRiskItemDialogProps) {
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(false)
  const [orgUnits, setOrgUnits] = useState<any[]>([])

  // Form state
  const [contextCategory, setContextCategory] = useState('')
  const [resourceCategory, setResourceCategory] = useState('')
  const [riskDescription, setRiskDescription] = useState('')
  const [likelihoodScore, setLikelihoodScore] = useState(3)
  const [impactScore, setImpactScore] = useState(3)
  const [existingControls, setExistingControls] = useState('')
  const [additionalControls, setAdditionalControls] = useState('')
  const [riskOwnerId, setRiskOwnerId] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [status, setStatus] = useState('Open')

  useEffect(() => {
    if (open) {
      loadOrgUnits()
    }
  }, [open])

  const loadOrgUnits = async () => {
    try {
      const { data } = await supabase
        .from('org_units')
        .select('*')
        .eq('active', true)
        .order('name')

      if (data) setOrgUnits(data)
    } catch (error) {
      console.error('Error loading org units:', error)
    }
  }

  const calculateRiskScore = () => {
    return likelihoodScore * impactScore
  }

  const getRiskLevel = (score: number) => {
    if (score >= 15) return 'Extreme'
    if (score >= 10) return 'High'
    if (score >= 5) return 'Moderate'
    return 'Low'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contextCategory || !resourceCategory || !riskDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('risk_profile_items')
        .insert({
          risk_profile_id: riskProfileId,
          context_category: contextCategory,
          resource_category: resourceCategory,
          risk_description: riskDescription,
          likelihood_score: likelihoodScore,
          impact_score: impactScore,
          existing_controls: existingControls || null,
          additional_controls: additionalControls || null,
          risk_owner_id: riskOwnerId || null,
          target_date: targetDate || null,
          status: status,
        })

      if (error) throw error

      toast.success('Risk item added successfully')
      onOpenChange(false)
      onSuccess?.()
      resetForm()
    } catch (error: any) {
      console.error('Error adding risk item:', error)
      toast.error(error.message || 'Failed to add risk item')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setContextCategory('')
    setResourceCategory('')
    setRiskDescription('')
    setLikelihoodScore(3)
    setImpactScore(3)
    setExistingControls('')
    setAdditionalControls('')
    setRiskOwnerId('')
    setTargetDate('')
    setStatus('Open')
  }

  const riskScore = calculateRiskScore()
  const riskLevel = getRiskLevel(riskScore)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Risk Item</DialogTitle>
          <DialogDescription>
            Add a new risk to the risk profile matrix
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Matrix Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="context">Context Category *</Label>
              <Select value={contextCategory} onValueChange={setContextCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select context category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTEXT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource">Resource Category *</Label>
              <Select value={resourceCategory} onValueChange={setResourceCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource category" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Risk Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Risk Description *</Label>
            <Textarea
              id="description"
              value={riskDescription}
              onChange={(e) => setRiskDescription(e.target.value)}
              placeholder="Describe the risk in detail..."
              rows={3}
            />
          </div>

          {/* Likelihood and Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likelihood">
                Likelihood Score (1-5) *
                <span className="text-xs text-slate-500 ml-2">
                  1=Rare, 5=Almost Certain
                </span>
              </Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={likelihoodScore}
                onChange={(e) => setLikelihoodScore(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">
                Impact Score (1-5) *
                <span className="text-xs text-slate-500 ml-2">
                  1=Insignificant, 5=Catastrophic
                </span>
              </Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={impactScore}
                onChange={(e) => setImpactScore(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Calculated Risk Score */}
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Risk Score (Auto-calculated)</p>
                <p className="text-2xl font-bold">
                  {riskScore} <span className="text-sm text-slate-500">/ 25</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  = Likelihood ({likelihoodScore}) × Impact ({impactScore})
                </p>
              </div>
              <Badge className={getRiskLevelColor(riskLevel)}>
                {riskLevel}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <Label htmlFor="existingControls">Existing Controls</Label>
            <Textarea
              id="existingControls"
              value={existingControls}
              onChange={(e) => setExistingControls(e.target.value)}
              placeholder="What controls are currently in place?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalControls">Additional Controls Required</Label>
            <Textarea
              id="additionalControls"
              value={additionalControls}
              onChange={(e) => setAdditionalControls(e.target.value)}
              placeholder="What additional controls are needed?"
              rows={2}
            />
          </div>

          {/* Risk Owner and Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Risk Owner</Label>
              <Select value={riskOwnerId} onValueChange={setRiskOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {orgUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Mitigating">Mitigating</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              Add Risk Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
