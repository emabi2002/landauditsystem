'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils/export'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { AddRiskItemDialog } from '@/components/dialogs/AddRiskItemDialog'
import { toast } from 'sonner'

type RiskProfile = Database['public']['Tables']['audit_risk_profiles']['Row']
type RiskProfileItem = Database['public']['Tables']['audit_risk_profile_items']['Row']

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

export default function RiskProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const [profile, setProfile] = useState<any>(null)
  const [riskItems, setRiskItems] = useState<RiskProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [params.id])

  const loadProfile = async () => {
    try {
      setLoading(true)

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('audit_risk_profiles')
        .select(`
          *,
          prepared_by_person:people!audit_risk_profiles_prepared_by_fkey(full_name),
          reviewed_by_person:people!audit_risk_profiles_reviewed_by_fkey(full_name)
        `)
        .eq('id', params.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Load risk items
      const { data: itemsData, error: itemsError } = await supabase
        .from('audit_risk_profile_items')
        .select(`
          *,
          risk_owner_person:people!audit_risk_profile_items_risk_owner_id_fkey(full_name)
        `)
        .eq('risk_profile_id', params.id)
        .order('created_at')

      if (itemsError) throw itemsError
      setRiskItems(itemsData || [])

    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load risk profile')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (score: number | null): string => {
    if (!score) return 'Unknown'
    if (score >= 15) return 'Extreme'
    if (score >= 10) return 'High'
    if (score >= 5) return 'Moderate'
    return 'Low'
  }

  const getRiskLevelColor = (level: string | null) => {
    switch (level) {
      case 'Extreme': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getMatrixCellRisks = (context: string, resource: string) => {
    return riskItems.filter(
      item => item.context_category === context && item.resource_category === resource
    )
  }

  const getRiskStats = () => {
    const stats = {
      total: riskItems.length,
      extreme: riskItems.filter(r => getRiskLevel(r.risk_score) === 'Extreme').length,
      high: riskItems.filter(r => getRiskLevel(r.risk_score) === 'High').length,
      moderate: riskItems.filter(r => getRiskLevel(r.risk_score) === 'Moderate').length,
      low: riskItems.filter(r => getRiskLevel(r.risk_score) === 'Low').length,
      open: riskItems.filter(r => r.status === 'Open').length,
    }
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading risk profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Risk profile not found</p>
      </div>
    )
  }

  const handleExportRisks = () => {
    const exportData = riskItems.map(item => ({
      'Context Category': item.context_category,
      'Resource Category': item.resource_category,
      'Risk Description': item.risk_description,
      'Likelihood (1-5)': item.likelihood_score,
      'Impact (1-5)': item.impact_score,
      'Risk Score': item.risk_score,
      'Risk Level': getRiskLevel(item.risk_score),
      'Existing Controls': item.existing_controls || '',
      'Additional Controls': item.additional_controls || '',
      'Risk Owner': (item as any).risk_owner_person?.full_name || '',
      'Target Date': item.target_date || '',
      'Status': item.status,
    }))
    exportToCSV(exportData, `Risk_Profile_${profile.org_units?.code}_${profile.profile_date}`)
  }

  const stats = getRiskStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/risk-profiles')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              {profile.org_units?.name} - {new Date(profile.profile_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportRisks}
            disabled={riskItems.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk Item
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Organization Unit</p>
              <p className="font-medium">{profile.org_units?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Project</p>
              <p className="font-medium">{profile.project_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Profile Date</p>
              <p className="font-medium">{new Date(profile.profile_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Overall Level</p>
              {profile.overall_level ? (
                <Badge className={getRiskLevelColor(profile.overall_level)}>
                  {profile.overall_level}
                </Badge>
              ) : (
                <p className="text-slate-400">Not set</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Prepared By</p>
              <p className="font-medium">{profile.prepared_by_person?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Reviewed By</p>
              <p className="font-medium">{profile.reviewed_by_person?.full_name || 'N/A'}</p>
            </div>
            {profile.remarks && (
              <div className="col-span-2">
                <p className="text-sm text-slate-500">Remarks</p>
                <p className="font-medium">{profile.remarks}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Statistics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Extreme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.extreme}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Moderate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.moderate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.low}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>
            Risks organized by context and resource categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-slate-50 text-left font-medium w-48">
                    Context ↓ / Resource →
                  </th>
                  {RESOURCE_CATEGORIES.map(resource => (
                    <th key={resource} className="border p-2 bg-slate-50 text-left font-medium">
                      {resource}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTEXT_CATEGORIES.map(context => (
                  <tr key={context}>
                    <td className="border p-2 bg-slate-50 font-medium">
                      {context}
                    </td>
                    {RESOURCE_CATEGORIES.map(resource => {
                      const cellRisks = getMatrixCellRisks(context, resource)
                      return (
                        <td key={resource} className="border p-2 align-top">
                          {cellRisks.length > 0 ? (
                            <div className="space-y-2">
                              {cellRisks.map(risk => (
                                <div
                                  key={risk.id}
                                  className="p-2 border rounded bg-white hover:bg-slate-50"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {risk.risk_description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`${getRiskLevelColor(getRiskLevel(risk.risk_score))} text-xs`}>
                                          {getRiskLevel(risk.risk_score)} ({risk.risk_score})
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                          L:{risk.likelihood_score} × I:{risk.impact_score}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-4">
                              No risks
                            </p>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Risks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Risk Items ({riskItems.length})</CardTitle>
          <CardDescription>
            Complete list of all identified risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskItems.length > 0 ? (
            <div className="space-y-3">
              {riskItems.map(risk => (
                <div key={risk.id} className="border rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Badge className={getRiskLevelColor(getRiskLevel(risk.risk_score))}>
                          {getRiskLevel(risk.risk_score)}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{risk.risk_description}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Context:</span> {risk.context_category}
                            </div>
                            <div>
                              <span className="font-medium">Resource:</span> {risk.resource_category}
                            </div>
                            <div>
                              <span className="font-medium">Score:</span> {risk.risk_score}
                              <span className="text-xs ml-1">
                                (L:{risk.likelihood_score} × I:{risk.impact_score})
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {risk.status}
                            </div>
                            {(risk as any).risk_owner_person && (
                              <div>
                                <span className="font-medium">Owner:</span> {(risk as any).risk_owner_person?.full_name}
                              </div>
                            )}
                            {risk.target_date && (
                              <div>
                                <span className="font-medium">Target:</span> {new Date(risk.target_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {risk.existing_controls && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Existing Controls:</span>
                              <p className="text-slate-600 mt-1">{risk.existing_controls}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No risks added yet. Click "Add Risk Item" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AddRiskItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        riskProfileId={params.id as string}
        onSuccess={loadProfile}
      />
    </div>
  )
}
