'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Edit, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRiskProfiles } from '@/lib/hooks/useRiskProfiles'
import { CreateRiskProfileDialog } from '@/components/dialogs/CreateRiskProfileDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RiskProfilesPage() {
  const router = useRouter()
  const { riskProfiles, loading, fetchRiskProfiles } = useRiskProfiles()
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleRiskProfileCreated = () => {
    fetchRiskProfiles(undefined, parseInt(selectedYear))
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/risk-profiles/${profileId}`)
  }

  const getRiskLevelColor = (level: string | null) => {
    switch (level) {
      case 'Extreme':
        return 'bg-red-500'
      case 'High':
        return 'bg-orange-500'
      case 'Moderate':
        return 'bg-yellow-500'
      case 'Low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    fetchRiskProfiles(undefined, parseInt(year))
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage risk assessment matrices for organizational units and projects
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Risk Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskProfiles.length}</div>
            <p className="text-xs text-slate-500">Active risk profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extreme Risk</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskProfiles.filter(p => p.overall_level === 'Extreme').length}
            </div>
            <p className="text-xs text-slate-500">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <div className="h-3 w-3 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskProfiles.filter(p => p.overall_level === 'High').length}
            </div>
            <p className="text-xs text-slate-500">Need monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskProfiles.filter(p => p.overall_level === 'Low').length}
            </div>
            <p className="text-xs text-slate-500">Well managed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Profile List</CardTitle>
              <CardDescription>View and manage all risk assessment profiles</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading risk profiles...</div>
          ) : riskProfiles.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No risk profiles found. Create your first risk profile to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org Unit</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Profile Date</TableHead>
                  <TableHead>Overall Level</TableHead>
                  <TableHead>Prepared By</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {(profile as any).org_units?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{profile.project_name || '-'}</TableCell>
                    <TableCell>
                      {new Date(profile.profile_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {profile.overall_level ? (
                        <Badge className={getRiskLevelColor(profile.overall_level)}>
                          {profile.overall_level}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(profile as any).prepared_by_person?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {(profile as any).reviewed_by_person?.full_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(profile.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Risk Matrix Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Profile Matrix Guide</CardTitle>
          <CardDescription>
            Risk profiles use a matrix approach with context categories and resource categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Context Risk Categories</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• External Environment</li>
                <li>• Compliance</li>
                <li>• Organisational Culture</li>
                <li>• Business Processes</li>
                <li>• Education & Skills / People</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Resource Risk Categories</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Human Resources</li>
                <li>• Financial Resources</li>
                <li>• Information Resources</li>
                <li>• Infrastructure & Physical Assets</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Risk Score Calculation:</strong> Risk Score = Likelihood (1-5) × Impact (1-5)
              <br />
              <strong>Risk Levels:</strong> Low (1-4), Moderate (5-9), High (10-14), Extreme (15-25)
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateRiskProfileDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRiskProfileCreated}
      />
    </div>
  )
}
