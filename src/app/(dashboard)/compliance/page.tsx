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
import { Plus, Search, Shield } from 'lucide-react'

const obligations = [
  {
    id: 'OBL-001',
    refCode: 'DPA-2023',
    title: 'Data Protection Act 2023',
    source: 'Act',
    level: 'National',
    controls: 12,
    status: 'Active',
  },
  {
    id: 'OBL-002',
    refCode: 'FRS-101',
    title: 'Financial Reporting Standards',
    source: 'Standard',
    level: 'National',
    controls: 8,
    status: 'Active',
  },
  {
    id: 'OBL-003',
    refCode: 'IAP-001',
    title: 'Internal Audit Policy',
    source: 'Policy',
    level: 'Internal',
    controls: 15,
    status: 'Active',
  },
]

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Compliance Obligations
          </h1>
          <p className="text-slate-500 mt-1">
            Manage legal and regulatory compliance requirements
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          New Obligation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Obligations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
            </div>
            <Shield className="h-8 w-8 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Controls</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">National Level</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">18</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Internal Level</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">6</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search obligations..." className="pl-9" />
          </div>
        </div>
      </Card>

      {/* Obligations Table */}
      <Card className="bg-white border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Ref Code</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Level</TableHead>
              <TableHead className="font-semibold">Controls</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((obl) => (
              <TableRow key={obl.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm">{obl.refCode}</TableCell>
                <TableCell className="font-medium">{obl.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{obl.source}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{obl.level}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-sm font-medium">
                    {obl.controls}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700">
                    {obl.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
