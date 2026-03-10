'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Briefcase,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { RiskProfileWidget } from '@/components/widgets/RiskProfileWidget'
import { PSAPRatingsWidget } from '@/components/widgets/PSAPRatingsWidget'
import { KRACompletionWidget } from '@/components/widgets/KRACompletionWidget'
import { PendingRiskEventsWidget } from '@/components/widgets/PendingRiskEventsWidget'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

interface KPIData {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof Briefcase
  color: string
  bgColor: string
}

interface Finding {
  id: string
  finding_number: string
  finding_title: string
  risk_rating: string
  created_at: string
  engagement?: {
    engagement_title: string
  } | null
}

interface EngagementsByStatus {
  status: string
  count: number
}

interface FindingsByRisk {
  name: string
  value: number
  color: string
  [key: string]: string | number  // Add index signature for recharts compatibility
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [findingsByRisk, setFindingsByRisk] = useState<FindingsByRisk[]>([])
  const [engagementsByStatus, setEngagementsByStatus] = useState<EngagementsByStatus[]>([])
  const [recentFindings, setRecentFindings] = useState<Finding[]>([])

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [
        engagementsRes,
        findingsRes,
        recommendationsRes,
        riskEventsRes,
        recentFindingsRes,
      ] = await Promise.all([
        // Active engagements count
        supabase
          .from('audit_engagements')
          .select('id, status', { count: 'exact' })
          .in('status', ['Planning', 'Fieldwork', 'Reporting', 'In Progress']),

        // Open findings count
        supabase
          .from('audit_findings')
          .select('id, risk_rating, status', { count: 'exact' })
          .neq('status', 'Closed'),

        // Pending recommendations count
        supabase
          .from('audit_recommendations')
          .select('id, status, target_date', { count: 'exact' })
          .neq('status', 'Implemented'),

        // Risk events for pending actions count
        supabase
          .from('audit_risk_events')
          .select('id, event_status')
          .in('event_status', ['Pending', 'Under Review']),

        // Recent findings with engagement info
        supabase
          .from('audit_findings')
          .select(`
            id,
            finding_number,
            finding_title,
            risk_rating,
            created_at,
            audit_engagements(engagement_title)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      // Calculate KPIs
      const activeEngagements = engagementsRes.count || 0
      const openFindings = findingsRes.count || 0
      const pendingRecommendations = recommendationsRes.count || 0

      // Calculate overdue actions (recommendations past target date)
      const overdueActions = (recommendationsRes.data as any[] || []).filter((r: any) => {
        if (!r.target_date) return false
        return new Date(r.target_date) < new Date() && r.status !== 'Implemented'
      }).length

      // Set KPI data
      setKpiData([
        {
          title: 'Active Engagements',
          value: String(activeEngagements),
          change: activeEngagements > 0 ? `${activeEngagements}` : '0',
          trend: 'up',
          icon: Briefcase,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          title: 'Open Findings',
          value: String(openFindings),
          change: openFindings > 0 ? `${openFindings}` : '0',
          trend: openFindings > 10 ? 'up' : 'down',
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
        {
          title: 'Pending Recommendations',
          value: String(pendingRecommendations),
          change: pendingRecommendations > 0 ? `${pendingRecommendations}` : '0',
          trend: pendingRecommendations > 5 ? 'up' : 'down',
          icon: FileText,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          title: 'Overdue Actions',
          value: String(overdueActions),
          change: overdueActions > 0 ? `${overdueActions}` : '0',
          trend: overdueActions > 0 ? 'up' : 'down',
          icon: Clock,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
      ])

      // Calculate findings by risk rating
      const findingsData = (findingsRes.data as any[]) || []
      const riskCounts = {
        Critical: findingsData.filter((f: any) => f.risk_rating === 'Critical').length,
        High: findingsData.filter((f: any) => f.risk_rating === 'High').length,
        Medium: findingsData.filter((f: any) => f.risk_rating === 'Medium').length,
        Low: findingsData.filter((f: any) => f.risk_rating === 'Low').length,
      }

      setFindingsByRisk([
        { name: 'Critical', value: riskCounts.Critical, color: '#ef4444' },
        { name: 'High', value: riskCounts.High, color: '#f97316' },
        { name: 'Medium', value: riskCounts.Medium, color: '#eab308' },
        { name: 'Low', value: riskCounts.Low, color: '#22c55e' },
      ])

      // Calculate engagements by status
      const engagementsData = (engagementsRes.data as any[]) || []
      const statusCounts: Record<string, number> = {}
      engagementsData.forEach((e: any) => {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
      })

      const statusOrder = ['Planning', 'Fieldwork', 'Reporting', 'Follow-up']
      setEngagementsByStatus(
        statusOrder.map((status) => ({
          status,
          count: statusCounts[status] || 0,
        }))
      )

      // Set recent findings
      setRecentFindings(
        (recentFindingsRes.data as any[] || []).map((f: any) => ({
          id: f.finding_number || f.id,
          finding_number: f.finding_number || `FND-${f.id?.substring(0, 8)}`,
          finding_title: f.finding_title,
          risk_rating: f.risk_rating,
          created_at: f.created_at,
          engagement: f.audit_engagements
            ? { engagement_title: f.audit_engagements.engagement_title }
            : null,
        }))
      )
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto" />
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of audit activities and compliance status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                  {Number(kpi.value) > 0 && (
                    <Badge
                      variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {kpi.trend === 'up' ? '+' : ''}{kpi.change}
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Risk Events - Audit Manager Priority */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Risk Event Gateway</h3>
                  <p className="text-sm text-slate-600">All audits must originate from a Risk Event</p>
                </div>
              </div>
              <Link href="/risk-events">
                <Button>
                  Manage Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/80 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">AAAP</div>
                <div className="text-sm text-slate-600 mt-1">Annual Audit Plan</div>
                <p className="text-xs text-slate-500 mt-2">Risk-based planning from Risk Register</p>
              </div>
              <div className="bg-white/80 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">Secretary</div>
                <div className="text-sm text-slate-600 mt-1">Priority Directives</div>
                <p className="text-xs text-slate-500 mt-2">Override normal planning priorities</p>
              </div>
              <div className="bg-white/80 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">Requests</div>
                <div className="text-sm text-slate-600 mt-1">External & Internal</div>
                <p className="text-xs text-slate-500 mt-2">From divisions & stakeholders</p>
              </div>
            </div>
          </Card>
        </div>
        <PendingRiskEventsWidget />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Findings by Risk Rating */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Findings by Risk Rating
          </h3>
          {findingsByRisk.some(f => f.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={findingsByRisk}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {findingsByRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p>No findings data available</p>
                <p className="text-sm text-slate-400 mt-1">Findings will appear here once created</p>
              </div>
            </div>
          )}
        </Card>

        {/* Engagements by Status */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Engagements by Status
          </h3>
          {engagementsByStatus.some(e => e.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <div className="text-center">
                <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p>No engagements data available</p>
                <p className="text-sm text-slate-400 mt-1">Engagements will appear here once created</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Risk & Governance Widgets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Risk & Governance</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <RiskProfileWidget />
          <PSAPRatingsWidget />
          <KRACompletionWidget />
        </div>
      </div>

      {/* Recent Findings */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Findings</h3>
          <Link href="/findings">
            <Button variant="ghost" size="sm" className="text-slate-600">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {recentFindings.length > 0 ? (
          <div className="space-y-4">
            {recentFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-500">
                      {finding.finding_number}
                    </span>
                    <Badge
                      variant={
                        finding.risk_rating === 'Critical' || finding.risk_rating === 'High'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {finding.risk_rating}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-slate-900 mt-2">{finding.finding_title}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {finding.engagement?.engagement_title || 'No engagement assigned'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {new Date(finding.created_at).toLocaleDateString()}
                  </p>
                  <Link href="/findings">
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>No findings yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Findings will appear here as audits are completed
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
