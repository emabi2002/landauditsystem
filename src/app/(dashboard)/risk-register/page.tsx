'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

const riskMatrix = [
  { likelihood: 'Almost Certain', critical: 3, high: 5, medium: 2, low: 0 },
  { likelihood: 'Likely', critical: 2, high: 4, medium: 3, low: 1 },
  { likelihood: 'Possible', critical: 1, high: 2, medium: 4, low: 2 },
  { likelihood: 'Unlikely', critical: 0, high: 1, medium: 2, low: 3 },
  { likelihood: 'Rare', critical: 0, high: 0, medium: 1, low: 2 },
]

export default function RiskRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Register</h1>
          <p className="text-slate-500 mt-1">
            View risk landscape and heat map analysis
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Critical Risks</p>
              <p className="text-2xl font-bold text-red-600 mt-1">6</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">High Risks</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">12</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Medium Risks</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">12</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Low Risks</p>
              <p className="text-2xl font-bold text-green-600 mt-1">8</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Heat Map */}
      <Card className="p-6 bg-white border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Heat Map</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 p-3 bg-slate-50 text-sm font-semibold text-slate-700">
                  Likelihood
                </th>
                <th className="border border-slate-300 p-3 bg-slate-50 text-sm font-semibold text-slate-700">
                  Critical Impact
                </th>
                <th className="border border-slate-300 p-3 bg-slate-50 text-sm font-semibold text-slate-700">
                  High Impact
                </th>
                <th className="border border-slate-300 p-3 bg-slate-50 text-sm font-semibold text-slate-700">
                  Medium Impact
                </th>
                <th className="border border-slate-300 p-3 bg-slate-50 text-sm font-semibold text-slate-700">
                  Low Impact
                </th>
              </tr>
            </thead>
            <tbody>
              {riskMatrix.map((row) => (
                <tr key={row.likelihood}>
                  <td className="border border-slate-300 p-3 bg-slate-50 font-medium text-sm">
                    {row.likelihood}
                  </td>
                  <td className="border border-slate-300 p-8 bg-red-100 text-center">
                    <Badge className="bg-red-600 text-white text-lg">
                      {row.critical}
                    </Badge>
                  </td>
                  <td className="border border-slate-300 p-8 bg-orange-100 text-center">
                    <Badge className="bg-orange-600 text-white text-lg">
                      {row.high}
                    </Badge>
                  </td>
                  <td className="border border-slate-300 p-8 bg-yellow-100 text-center">
                    <Badge className="bg-yellow-600 text-white text-lg">
                      {row.medium}
                    </Badge>
                  </td>
                  <td className="border border-slate-300 p-8 bg-green-100 text-center">
                    <Badge className="bg-green-600 text-white text-lg">
                      {row.low}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
