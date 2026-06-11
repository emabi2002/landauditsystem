'use client'

import { useState } from 'react'
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
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const findings = [
  {
    id: 'FND-2024-034',
    title: 'Inadequate password policy enforcement',
    engagement: 'IT Security & Data Protection Audit',
    riskRating: 'High',
    severity: 'High',
    likelihood: 'Likely',
    status: 'Draft',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-10-28',
  },
  {
    id: 'FND-2024-033',
    title: 'Missing approval signatures on contracts',
    engagement: 'Procurement Process Review',
    riskRating: 'Medium',
    severity: 'Medium',
    likelihood: 'Possible',
    status: 'Review',
    createdBy: 'Michael Chen',
    createdAt: '2024-10-27',
  },
  {
    id: 'FND-2024-032',
    title: 'Incomplete asset register',
    engagement: 'Asset Management Audit',
    riskRating: 'High',
    severity: 'High',
    likelihood: 'Almost Certain',
    status: 'Approved',
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-10-26',
  },
  {
    id: 'FND-2024-031',
    title: 'Unauthorized software installations',
    engagement: 'IT Security & Data Protection Audit',
    riskRating: 'Critical',
    severity: 'Critical',
    likelihood: 'Likely',
    status: 'Review',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-10-25',
  },
]

const riskColors = {
  Critical: 'bg-red-100 text-red-800 border-red-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
}

const statusColors = {
  Draft: 'bg-slate-100 text-slate-700',
  Review: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Closed: 'bg-slate-100 text-slate-500',
}

export default function FindingsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Findings</h1>
          <p className="text-slate-500 mt-1">
            Review and manage audit findings across engagements
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              New Finding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Finding</DialogTitle>
              <DialogDescription>
                Document a new audit finding with details and evidence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Engagement
                </label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng1">IT Security & Data Protection Audit</SelectItem>
                    <SelectItem value="eng2">Procurement Process Review</SelectItem>
                    <SelectItem value="eng3">Asset Management Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  placeholder="Brief description of the finding"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Statement
                </label>
                <Textarea
                  placeholder="Detailed statement of what was found..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Cause</label>
                  <Textarea
                    placeholder="Root cause of the finding..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Effect</label>
                  <Textarea
                    placeholder="Impact or effect of the finding..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Criteria (Policy/Law/Standard)
                </label>
                <Input
                  placeholder="e.g., ISO 27001:2013, Section 5.1"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Severity
                  </label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Likelihood
                  </label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select likelihood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="almost-certain">Almost Certain</SelectItem>
                      <SelectItem value="likely">Likely</SelectItem>
                      <SelectItem value="possible">Possible</SelectItem>
                      <SelectItem value="unlikely">Unlikely</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Risk Rating
                  </label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Risk rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Create Finding
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search findings..." className="pl-9" />
          </div>
          <Select defaultValue="all-risk">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-risk">All Risks</SelectItem>
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
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Findings Table */}
      <Card className="bg-white border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Engagement</TableHead>
              <TableHead className="font-semibold">Risk Rating</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Created By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((finding) => (
              <TableRow key={finding.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm text-slate-600">
                  {finding.id}
                </TableCell>
                <TableCell className="font-medium max-w-md">
                  {finding.title}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {finding.engagement}
                </TableCell>
                <TableCell>
                  <Badge
                    className={riskColors[finding.riskRating as keyof typeof riskColors]}
                  >
                    {finding.riskRating}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[finding.status as keyof typeof statusColors]}
                  >
                    {finding.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {finding.createdBy}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {finding.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
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
