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
import { Search, Filter, Eye, Edit, CheckCircle, Send } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const recommendations = [
  {
    id: 'REC-2024-045',
    findingId: 'FND-2024-034',
    text: 'Implement multi-factor authentication for all user accounts',
    priority: 'Critical',
    owner: 'IT Department',
    targetDate: '2024-12-31',
    status: 'Published',
    publishedAt: '2024-10-28',
  },
  {
    id: 'REC-2024-044',
    findingId: 'FND-2024-033',
    text: 'Establish approval workflow for all procurement contracts',
    priority: 'High',
    owner: 'Procurement',
    targetDate: '2024-11-30',
    status: 'Approved',
    publishedAt: null,
  },
  {
    id: 'REC-2024-043',
    findingId: 'FND-2024-032',
    text: 'Conduct complete physical asset verification and update register',
    priority: 'High',
    owner: 'Operations',
    targetDate: '2024-12-15',
    status: 'Implementing',
    publishedAt: '2024-10-26',
  },
  {
    id: 'REC-2024-042',
    findingId: 'FND-2024-031',
    text: 'Deploy endpoint protection and software whitelisting',
    priority: 'Critical',
    owner: 'IT Department',
    targetDate: '2024-11-15',
    status: 'Manager Review',
    publishedAt: null,
  },
]

const priorityColors = {
  Critical: 'bg-red-100 text-red-800 border-red-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
}

const statusColors = {
  Draft: 'bg-slate-100 text-slate-700',
  'Manager Review': 'bg-blue-100 text-blue-700',
  Approved: 'bg-purple-100 text-purple-700',
  Published: 'bg-green-100 text-green-700',
  Implementing: 'bg-orange-100 text-orange-700',
  Verified: 'bg-teal-100 text-teal-700',
  Closed: 'bg-slate-100 text-slate-500',
}

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recommendations</h1>
          <p className="text-slate-500 mt-1">
            Track and publish audit recommendations for action
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Publish Selected
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Draft</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <Edit className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approval</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">23</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Send className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Linked to Legal</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search recommendations..." className="pl-9" />
          </div>
          <Select defaultValue="all-priority">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priority">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Manager Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="implementing">Implementing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Recommendations Table */}
      <Card className="bg-white border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Recommendation</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Owner</TableHead>
              <TableHead className="font-semibold">Target Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendations.map((rec) => (
              <TableRow key={rec.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm text-slate-600">
                  {rec.id}
                </TableCell>
                <TableCell className="font-medium max-w-lg">
                  {rec.text}
                </TableCell>
                <TableCell>
                  <Badge
                    className={priorityColors[rec.priority as keyof typeof priorityColors]}
                  >
                    {rec.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{rec.owner}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {rec.targetDate}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[rec.status as keyof typeof statusColors]}
                  >
                    {rec.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {rec.status === 'Approved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
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
