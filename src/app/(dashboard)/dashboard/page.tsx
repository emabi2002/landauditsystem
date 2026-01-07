'use client'

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

const kpiData = [
  {
    title: 'Active Engagements',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Open Findings',
    value: '34',
    change: '-5',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Pending Recommendations',
    value: '18',
    change: '+3',
    trend: 'up',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Overdue Actions',
    value: '7',
    change: '-2',
    trend: 'down',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
]

const findingsByRisk = [
  { name: 'Critical', value: 8, color: '#ef4444' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Medium', value: 14, color: '#eab308' },
  { name: 'Low', value: 6, color: '#22c55e' },
]

const engagementsByStatus = [
  { status: 'Planning', count: 3 },
  { status: 'Fieldwork', count: 5 },
  { status: 'Reporting', count: 2 },
  { status: 'Follow-up', count: 2 },
]

const recentFindings = [
  {
    id: 'FND-2024-034',
    title: 'Inadequate password policy enforcement',
    engagement: 'IT Security Audit 2024',
    risk: 'High',
    date: '2024-10-28',
  },
  {
    id: 'FND-2024-033',
    title: 'Missing approval signatures on contracts',
    engagement: 'Procurement Audit Q3',
    risk: 'Medium',
    date: '2024-10-27',
  },
  {
    id: 'FND-2024-032',
    title: 'Incomplete asset register',
    engagement: 'Asset Management Review',
    risk: 'High',
    date: '2024-10-26',
  },
]

export default function DashboardPage() {
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
                  <Badge
                    variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {kpi.change}
                  </Badge>
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={findingsByRisk}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
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
        </Card>

        {/* Engagements by Status */}
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Engagements by Status
          </h3>
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
        <div className="space-y-4">
          {recentFindings.map((finding) => (
            <div
              key={finding.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-slate-500">
                    {finding.id}
                  </span>
                  <Badge
                    variant={
                      finding.risk === 'Critical' || finding.risk === 'High'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {finding.risk}
                  </Badge>
                </div>
                <h4 className="font-medium text-slate-900 mt-2">{finding.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{finding.engagement}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">{finding.date}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
