'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Settings, Database, Plus } from 'lucide-react'

const users = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@dlpp.org',
    role: 'Audit Manager',
    unit: 'Internal Audit',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.c@dlpp.org',
    role: 'Auditor',
    unit: 'Internal Audit',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@dlpp.org',
    role: 'Auditor',
    unit: 'Internal Audit',
    status: 'Active',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.k@dlpp.org',
    role: 'Action Owner',
    unit: 'IT Department',
    status: 'Active',
  },
]

const orgUnits = [
  { id: 1, code: 'CORP', name: 'Corporate Office', parent: null },
  { id: 2, code: 'LEGAL', name: 'Legal Department', parent: 'Corporate Office' },
  { id: 3, code: 'FIN', name: 'Finance Department', parent: 'Corporate Office' },
  { id: 4, code: 'IT', name: 'IT Department', parent: 'Corporate Office' },
  { id: 5, code: 'OPS', name: 'Operations', parent: 'Corporate Office' },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-500 mt-1">
            Manage system configuration, users, and settings
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
            </div>
            <Users className="h-8 w-8 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Org Units</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
            </div>
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Sessions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
            </div>
            <Database className="h-8 w-8 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">System Health</p>
              <p className="text-2xl font-bold text-green-600 mt-1">100%</p>
            </div>
            <Settings className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="bg-white border-slate-200">
        <Tabs defaultValue="users" className="p-6">
          <TabsList>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="org-units">Organization Units</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Users</h3>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Unit</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{user.unit}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="org-units" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Organization Units
              </h3>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Parent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-mono text-sm">{unit.code}</TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {unit.parent || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              System Configuration
            </h3>
            <div className="space-y-4">
              <Card className="p-4 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Automatic Notifications
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Send email notifications for overdue action plans
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </Card>
              <Card className="p-4 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Backup Schedule</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Daily backups at 2:00 AM UTC
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </Card>
              <Card className="p-4 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Audit Retention</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Keep audit logs for 7 years
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              API Access & Integration
            </h3>
            <div className="space-y-4">
              <Card className="p-4 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Legal CMS Integration
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Service account for published recommendations access
                    </p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block">
                      API Key: ••••••••••••••••
                    </code>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </Card>
              <Card className="p-4 border-slate-200 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">
                      API Documentation
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      View complete API documentation for integrating with external
                      systems
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-white hover:bg-blue-50"
                      onClick={() => window.open('/api-docs', '_blank')}
                    >
                      Open Documentation
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
