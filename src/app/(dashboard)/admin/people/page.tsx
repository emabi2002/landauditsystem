'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserCircle, Plus, Edit, Trash2, Search, Users, CheckCircle2 } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { toast } from 'sonner'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

interface Person {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  org_unit_id: string | null
  active: boolean
  created_at: string
}

interface OrgUnit {
  id: string
  name: string
}

export default function PeoplePage() {
  const supabase = createClientComponentClient<Database>()

  const [people, setPeople] = useState<Person[]>([])
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: '',
    org_unit_id: 'none',
    active: true,
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [peopleRes, orgRes] = await Promise.all([
        supabase.from('people').select('*').order('full_name'),
        supabase.from('org_units').select('id, name').eq('is_active', true).order('name'),
      ])
      if (peopleRes.error) throw peopleRes.error
      setPeople((peopleRes.data as Person[]) || [])
      setOrgUnits((orgRes.data as OrgUnit[]) || [])
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load officers')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ full_name: '', email: '', role: '', org_unit_id: 'none', active: true })
    setDialogOpen(true)
  }

  const openEdit = (person: Person) => {
    setEditing(person)
    setForm({
      full_name: person.full_name || '',
      email: person.email || '',
      role: person.role || '',
      org_unit_id: person.org_unit_id || 'none',
      active: person.active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.error('Full name is required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        role: form.role.trim() || null,
        org_unit_id: form.org_unit_id !== 'none' ? form.org_unit_id : null,
        active: form.active,
      }
      if (editing) {
        const { error } = await supabase
          .from('people')
          .update({ ...payload, updated_at: new Date().toISOString() } as any)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Officer updated')
      } else {
        const { error } = await supabase.from('people').insert(payload as any)
        if (error) throw error
        toast.success('Officer created')
      }
      setDialogOpen(false)
      loadData()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to save officer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (person: Person) => {
    if (!confirm(`Delete "${person.full_name}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('people').delete().eq('id', person.id)
      if (error) throw error
      toast.success('Officer deleted')
      loadData()
    } catch (e: any) {
      console.error(e)
      toast.error(
        e.message?.includes('violates foreign key')
          ? 'Cannot delete: this person is referenced by an assessment.'
          : e.message || 'Failed to delete officer',
      )
    }
  }

  const orgName = (id: string | null) =>
    id ? orgUnits.find((u) => u.id === id)?.name || '—' : '—'
  const filtered = people.filter(
    (p) =>
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.role || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const activeCount = people.filter((p) => p.active).length

  return (
    <>
      <PageHeader
        icon={UserCircle}
        title="Officers Directory"
        subtitle="People who complete and review PSAP assessments and own KRAs"
        backHref="/admin"
        actions={
          <Button size="sm" onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Officer
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Officers</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{people.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Officers ({filtered.length})</CardTitle>
              <CardDescription>
                These people populate the “Completed By” / “Reviewed By” dropdowns in PSAP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading officers...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <UserCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>{people.length === 0 ? 'No officers yet. Add your first one.' : 'No matches.'}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Org Unit</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.full_name}</TableCell>
                        <TableCell className="text-slate-600">{person.email || '—'}</TableCell>
                        <TableCell className="text-slate-600">{person.role || '—'}</TableCell>
                        <TableCell className="text-slate-600">{orgName(person.org_unit_id)}</TableCell>
                        <TableCell>
                          {person.active ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(person)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(person)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </div>
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Officer' : 'New Officer'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this officer.' : 'Add someone who can complete or review assessments.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="jane@dlpp.gov.pg"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role / Title</Label>
                  <Input
                    placeholder="e.g. Senior Auditor"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Org Unit</Label>
                <Select value={form.org_unit_id} onValueChange={(v) => setForm({ ...form, org_unit_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {orgUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.active ? 'active' : 'inactive'}
                  onValueChange={(v) => setForm({ ...form, active: v === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Officer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
