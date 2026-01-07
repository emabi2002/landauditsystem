'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRiskRegister, type RiskWithRelations } from '@/lib/hooks/useRiskRegister'
import type { RiskRating, RiskStatus } from '@/lib/database.types'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Scale,
  Shield,
  TrendingUp,
  User,
  History,
  AlertCircle
} from 'lucide-react'

interface RiskDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk: RiskWithRelations | null
  onUpdate?: () => void
}

export function RiskDetailSheet({
  open,
  onOpenChange,
  risk,
  onUpdate
}: RiskDetailSheetProps) {
  const { updateRiskStatus, reviewRisk } = useRiskRegister()
  const [loading, setLoading] = useState(false)

  if (!risk) return null

  const getRatingColor = (rating: RiskRating | null | undefined) => {
    switch (rating) {
      case 'Extreme': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-purple-100 text-purple-800'
      case 'Mitigated': return 'bg-green-100 text-green-800'
      case 'Accepted': return 'bg-yellow-100 text-yellow-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      case 'Escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = async (newStatus: RiskStatus) => {
    setLoading(true)
    try {
      const { error } = await updateRiskStatus(risk.id, newStatus)
      if (error) throw new Error(error)
      toast.success(`Status updated to ${newStatus}`)
      onUpdate?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    setLoading(true)
    try {
      const { error } = await reviewRisk(risk.id)
      if (error) throw new Error(error)
      toast.success('Risk reviewed successfully')
      onUpdate?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to record review')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">{risk.risk_code}</Badge>
            <Badge className={getStatusColor(risk.risk_status)}>{risk.risk_status}</Badge>
            {risk.is_system_risk && (
              <Badge variant="secondary">System Risk</Badge>
            )}
          </div>
          <SheetTitle className="text-xl mt-2">{risk.risk_title}</SheetTitle>
          <SheetDescription>{risk.risk_description}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Risk Scores */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Inherent Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{risk.inherent_risk_score}</div>
                      <div className="text-xs text-slate-500">
                        L:{risk.inherent_likelihood} x I:{risk.inherent_impact}
                      </div>
                    </div>
                    <Badge className={getRatingColor(risk.inherent_risk_rating)}>
                      {risk.inherent_risk_rating}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Residual Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{risk.residual_risk_score}</div>
                      <div className="text-xs text-slate-500">
                        L:{risk.residual_likelihood || '-'} x I:{risk.residual_impact || '-'}
                      </div>
                    </div>
                    <Badge className={getRatingColor(risk.residual_risk_rating)}>
                      {risk.residual_risk_rating}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Category</div>
                      <div className="font-medium">{risk.risk_category}</div>
                    </div>
                  </div>

                  {risk.risk_subcategory && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-500">Subcategory</div>
                        <div className="font-medium">{risk.risk_subcategory}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Division</div>
                      <div className="font-medium">{(risk as any).audit_divisions?.name || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Risk Owner</div>
                      <div className="font-medium">{risk.risk_owner_role || 'Unassigned'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Oversight Body</div>
                      <div className="font-medium">{risk.oversight_body || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Identified</div>
                      <div className="font-medium">{formatDate(risk.identified_date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Last Reviewed</div>
                      <div className="font-medium">{formatDate(risk.last_reviewed_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Next Review Due</div>
                      <div className="font-medium">{formatDate(risk.next_review_due)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Review Frequency</div>
                      <div className="font-medium">{risk.review_frequency || 'Quarterly'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReview}
                disabled={loading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Reviewed
              </Button>
              {risk.risk_status === 'Active' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange('Under Review')}
                  disabled={loading}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Flag for Review
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Control Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Control Effectiveness</div>
                  <Badge variant="outline">
                    {risk.control_effectiveness || 'Not Assessed'}
                  </Badge>
                </div>

                {risk.control_description && (
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Control Description</div>
                    <p className="text-sm">{risk.control_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Matrix Visual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Score Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-slate-500">Inherent</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${getRatingColor(risk.inherent_risk_rating)}`}
                        style={{ width: `${(risk.inherent_risk_score / 25) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {risk.inherent_risk_score}/25
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-slate-500">Residual</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${getRatingColor(risk.residual_risk_rating)}`}
                        style={{ width: `${(risk.residual_risk_score / 25) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {risk.residual_risk_score}/25
                    </div>
                  </div>
                  {risk.target_risk_rating && (
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-sm text-slate-500">Target</div>
                      <div className="flex-1">
                        <Badge className={getRatingColor(risk.target_risk_rating)}>
                          {risk.target_risk_rating}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value="treatment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Treatment Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500">Treatment Approach:</div>
                  <Badge variant="outline">{risk.risk_treatment || 'Not Set'}</Badge>
                </div>

                {risk.treatment_plan && (
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Treatment Plan</div>
                    <p className="text-sm">{risk.treatment_plan}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Treatment Actions */}
            {risk.treatments && risk.treatments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Treatment Actions ({risk.treatments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risk.treatments.map((treatment: any) => (
                      <div key={treatment.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm">{treatment.description}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {treatment.treatment_type} | Due: {formatDate(treatment.target_date)}
                            </div>
                          </div>
                          <Badge variant="outline">{treatment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  No treatment actions recorded
                </CardContent>
              </Card>
            )}

            {/* Incidents */}
            {risk.incidents && risk.incidents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Risk Incidents ({risk.incidents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risk.incidents.map((incident: any) => (
                      <div key={incident.id} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm">{incident.description}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {formatDate(incident.incident_date)}
                              {incident.financial_impact && (
                                <span className="ml-2 text-amber-600">
                                  Impact: K{incident.financial_impact.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal" className="space-y-4 mt-4">
            {risk.legal_references && risk.legal_references.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Legal References ({risk.legal_references.length})</CardTitle>
                  <CardDescription>
                    Applicable Acts, Regulations, and Policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risk.legal_references.map((ref: any) => (
                      <div key={ref.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Scale className="h-4 w-4 text-slate-500 mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {ref.legal_instruments?.code} - {ref.legal_instruments?.title}
                            </div>
                            {ref.section_reference && (
                              <div className="text-xs text-slate-500 mt-1">
                                {ref.section_reference}
                              </div>
                            )}
                            <Badge variant="outline" className="mt-2">
                              {ref.compliance_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  <Scale className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No legal references linked</p>
                  <p className="text-xs">This risk should have at least one legal anchor</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Notes */}
        {risk.notes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500 mb-1">Notes</div>
            <p className="text-sm">{risk.notes}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
