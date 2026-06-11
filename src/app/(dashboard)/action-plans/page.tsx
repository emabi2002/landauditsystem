'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search, Filter, Eye, Upload, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const actionPlans = [
  {
    id: 'AP-2024-067',
    recommendationId: 'REC-2024-045',
    action: 'Deploy MFA solution for all user accounts',
    owner: 'John Smith',
    startDate: '2024-11-01',
    targetDate: '2024-12-31',
    progress: 45,
    status: 'In Progress',
    lastUpdate: '2024-10-25',
  },
  {
    id: 'AP-2024-066',
    recommendationId: 'REC-2024-044',
    action: 'Design and implement approval workflow system',
    owner: 'Mary Johnson',
    startDate: '2024-10-15',
    targetDate: '2024-11-30',
    progress: 20,
    status: 'In Progress',
    lastUpdate: '2024-10-20',
  },
  {
    id: 'AP-2024-065',
    recommendationId: 'REC-2024-043',
    action: 'Conduct physical verification of all assets',
    owner: 'David Lee',
    startDate: '2024-10-01',
    targetDate: '2024-12-15',
    progress: 60,
    status: 'In Progress',
    lastUpdate: '2024-10-28',
  },
  {
    id: 'AP-2024-064',
    recommendationId: 'REC-2024-042',
    action: 'Procure and deploy endpoint protection software',
    owner: 'Sarah Chen',
    startDate: '2024-11-05',
    targetDate: '2024-11-15',
    progress: 0,
    status: 'Overdue',
    lastUpdate: '2024-11-05',
  },
]

const statusColors = {
  'Not Started': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  Verified: 'bg-purple-100 text-purple-700',
}

const getProgressColor = (progress: number) => {
  if (progress === 0) return 'bg-slate-200'
  if (progress < 25) return 'bg-red-500'
  if (progress < 50) return 'bg-orange-500'
  if (progress < 75) return 'bg-yellow-500'
  if (progress < 100) return 'bg-blue-500'
  return 'bg-green-500'
}

export default function ActionPlansPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Action Plans</h1>
          <p className="text-slate-500 mt-1">
            Monitor and track implementation of audit recommendations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
            </div>
            <div className="text-sm text-slate-500 mt-2">Avg: 48% complete</div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">8</p>
            </div>
            <div className="text-sm text-slate-500 mt-2">This month</div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">3</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Verified</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">15</p>
            </div>
            <div className="text-sm text-slate-500 mt-2">All time</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search action plans..." className="pl-9" />
          </div>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Statuses</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-owner">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-owner">All Owners</SelectItem>
              <SelectItem value="john">John Smith</SelectItem>
              <SelectItem value="mary">Mary Johnson</SelectItem>
              <SelectItem value="david">David Lee</SelectItem>
              <SelectItem value="sarah">Sarah Chen</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Action Plans Table */}
      <Card className="bg-white border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Owner</TableHead>
              <TableHead className="font-semibold">Timeline</TableHead>
              <TableHead className="font-semibold">Progress</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actionPlans.map((plan) => (
              <TableRow key={plan.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm text-slate-600">
                  {plan.id}
                </TableCell>
                <TableCell className="font-medium max-w-md">{plan.action}</TableCell>
                <TableCell className="text-sm text-slate-600">{plan.owner}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  <div>
                    <div>{plan.startDate}</div>
                    <div className="text-xs text-slate-500">to {plan.targetDate}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(plan.progress)}`}
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[plan.status as keyof typeof statusColors]}
                  >
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
