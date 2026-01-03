'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Briefcase,
  ArrowRight,
  Zap,
  Loader2,
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

interface DashboardStats {
  activeEngagements: number
  openFindings: number
  pendingRecommendations: number
  overdueActions: number
  findingsByRisk: { name: string; value: number; color: string }[]
  engagementsByStatus: { status: string; count: number }[]
  recentFindings: {
    id: string
    finding_code: string
    title: string
    engagement_title: string
    risk_rating: string
    created_at: string
  }[]
}

export default function DashboardPage() {
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    activeEngagements: 0,
    openFindings: 0,
    pendingRecommendations: 0,
    overdueActions: 0,
    findingsByRisk: [],
    engagementsByStatus: [],
    recentFindings: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch active engagements count
      const { count: engagementCount } = await supabase
        .from('audit_engagements')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Planning', 'Fieldwork', 'Reporting'])

      // Fetch open findings count
      const { count: findingsCount } = await supabase
        .from('audit_findings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Draft', 'Open'])

      // Fetch pending recommendations count
      const { count: recsCount } = await supabase
        .from('audit_recommendations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Draft', 'Published', 'Accepted', 'In Progress'])

      // Fetch overdue action plans count
      const { count: overdueCount } = await supabase
        .from('audit_action_plans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Overdue')

      // Fetch findings by risk rating
      const { data: findingsData } = await supabase
        .from('audit_findings')
        .select('risk_rating')

      const riskCounts = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
      }
      findingsData?.forEach((f: { risk_rating: string | null }) => {
        if (f.risk_rating && f.risk_rating in riskCounts) {
          riskCounts[f.risk_rating as keyof typeof riskCounts]++
        }
      })
      const findingsByRisk = [
        { name: 'Critical', value: riskCounts.Critical, color: '#ef4444' },
        { name: 'High', value: riskCounts.High, color: '#f97316' },
        { name: 'Medium', value: riskCounts.Medium, color: '#eab308' },
        { name: 'Low', value: riskCounts.Low, color: '#22c55e' },
      ]

      // Fetch engagements by status
      const { data: engData } = await supabase
        .from('audit_engagements')
        .select('status')

      const statusCounts: Record<string, number> = {}
      engData?.forEach((e: { status: string | null }) => {
        if (e.status) {
          statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
        }
      })
      const engagementsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }))

      // Fetch recent findings
      const { data: recentFindingsData } = await supabase
        .from('audit_findings')
        .select(`
          id,
          finding_code,
          title,
          risk_rating,
          created_at,
          audit_engagements(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const recentFindings = (recentFindingsData || []).map((f: any) => ({
        id: f.finding_code || f.id,
        finding_code: f.finding_code,
        title: f.title,
        engagement_title: f.audit_engagements?.title || 'Unknown Engagement',
        risk_rating: f.risk_rating,
        created_at: f.created_at,
      }))

      setStats({
        activeEngagements: engagementCount || 0,
        openFindings: findingsCount || 0,
        pendingRecommendations: recsCount || 0,
        overdueActions: overdueCount || 0,
        findingsByRisk,
        engagementsByStatus,
        recentFindings,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpiData = [
    {
      title: 'Active Engagements',
      value: stats.activeEngagements.toString(),
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Open Findings',
      value: stats.openFindings.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Recommendations',
      value: stats.pendingRecommendations.toString(),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Overdue Actions',
      value: stats.overdueActions.toString(),
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-500">Loading dashboard data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of audit activities and compliance status</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Risk Event Gateway Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Risk Event Gateway</h3>
                <p className="text-sm text-slate-600">All audits must originate from a Risk Event</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/risk-events">
                Manage Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">AAAP</p>
              <p className="text-sm font-medium text-slate-700">Annual Audit Plan</p>
              <p className="text-xs text-slate-500 mt-1">Risk-based planning from Risk Register</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-red-600">Secretary</p>
              <p className="text-sm font-medium text-slate-700">Priority Directives</p>
              <p className="text-xs text-slate-500 mt-1">Override normal planning priorities</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">Requests</p>
              <p className="text-sm font-medium text-slate-700">External & Internal</p>
              <p className="text-xs text-slate-500 mt-1">From divisions & stakeholders</p>
            </div>
          </div>
        </Card>

        {/* Pending Risk Events Widget */}
        <PendingRiskEventsWidget />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings by Risk */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Findings by Risk Rating</h3>
          {stats.findingsByRisk.some(f => f.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.findingsByRisk.filter(f => f.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.findingsByRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400">
              No findings data available
            </div>
          )}
        </Card>

        {/* Engagements by Status */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Engagements by Status</h3>
          {stats.engagementsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.engagementsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400">
              No engagement data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Findings & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Findings */}
        <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Findings</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/findings">View All</Link>
            </Button>
          </div>
          {stats.recentFindings.length > 0 ? (
            <div className="space-y-4">
              {stats.recentFindings.map((finding) => (
                <div key={finding.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{finding.title}</p>
                    <p className="text-sm text-slate-500">{finding.engagement_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(finding.risk_rating)}>
                      {finding.risk_rating}
                    </Badge>
                    <span className="text-xs text-slate-400">{finding.finding_code}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400">
              No recent findings
            </div>
          )}
        </Card>

        {/* Risk Profile Widget */}
        <RiskProfileWidget />
      </div>

      {/* Bottom Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PSAPRatingsWidget />
        <KRACompletionWidget />
      </div>
    </div>
  )
}
