'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react'

const reportTemplates = [
  {
    id: 1,
    title: 'Engagement Summary Report',
    description: 'Overview of all active and completed engagements',
    icon: Briefcase,
    frequency: 'Monthly',
  },
  {
    id: 2,
    title: 'Findings & Recommendations',
    description: 'Comprehensive findings report by risk rating',
    icon: FileText,
    frequency: 'Quarterly',
  },
  {
    id: 3,
    title: 'Action Plans Status',
    description: 'Progress tracking of all action plans',
    icon: TrendingUp,
    frequency: 'Weekly',
  },
  {
    id: 4,
    title: 'Compliance Dashboard',
    description: 'Compliance obligations and control effectiveness',
    icon: BarChart3,
    frequency: 'Monthly',
  },
]

import { Briefcase } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">
            Generate and export audit reports and analytics
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Custom Report</h3>
          <p className="text-sm text-slate-600 mt-2">
            Create a custom report with selected date range and filters
          </p>
          <Button variant="outline" className="w-full mt-4">
            Create Report
          </Button>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Download className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Export Data</h3>
          <p className="text-sm text-slate-600 mt-2">
            Export raw data to CSV or Excel format
          </p>
          <Button variant="outline" className="w-full mt-4">
            Export Data
          </Button>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Analytics</h3>
          <p className="text-sm text-slate-600 mt-2">
            View advanced analytics and trends
          </p>
          <Button variant="outline" className="w-full mt-4">
            View Analytics
          </Button>
        </Card>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Report Templates
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="p-6 bg-white border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <template.icon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{template.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {template.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Frequency: {template.frequency}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
