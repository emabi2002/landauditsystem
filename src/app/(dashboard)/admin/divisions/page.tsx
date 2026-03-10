'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Users,
  FileText,
  MapPin,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

interface Division {
  id: string
  code: string
  name: string
  description: string | null
  head_position: string | null
  created_at: string
}

interface Section {
  id: string
  division_id: string
  code: string
  name: string
  description: string | null
}

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false)
  const [editDivisionOpen, setEditDivisionOpen] = useState(false)
  const [createSectionOpen, setCreateSectionOpen] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)

  // Form state
  const [divisionForm, setDivisionForm] = useState({
    code: '',
    name: '',
    description: '',
    head_position: '',
  })
  const [sectionForm, setSectionForm] = useState({
    code: '',
    name: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [divisionsRes, sectionsRes] = await Promise.all([
        supabase.from('audit_divisions').select('*').order('name'),
        supabase.from('audit_sections').select('*').order('name'),
      ])

      setDivisions((divisionsRes.data as Division[]) || [])
      setSections((sectionsRes.data as Section[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load divisions')
    } finally {
      setLoading(false)
    }
  }

  const resetDivisionForm = () => {
    setDivisionForm({
      code: '',
      name: '',
      description: '',
      head_position: '',
    })
  }

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!divisionForm.code.trim() || !divisionForm.name.trim()) {
      toast.error('Code and name are required')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('audit_divisions').insert({
        code: divisionForm.code.toUpperCase(),
        name: divisionForm.name,
        description: divisionForm.description || null,
        head_position: divisionForm.head_position || null,
      } as any)

      if (error) {
        if (error.code === '23505') {
          toast.error('A division with this code already exists')
        } else {
          throw error
        }
        return
      }

      toast.success('Division created successfully')
      setCreateDivisionOpen(false)
      resetDivisionForm()
      loadData()
    } catch (error: any) {
      console.error('Error creating division:', error)
      toast.error(error.message || 'Failed to create division')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDivision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDivision) return

    if (!divisionForm.code.trim() || !divisionForm.name.trim()) {
      toast.error('Code and name are required')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('audit_divisions')
        .update({
          code: divisionForm.code.toUpperCase(),
          name: divisionForm.name,
          description: divisionForm.description || null,
          head_position: divisionForm.head_position || null,
        } as any)
        .eq('id', selectedDivision.id)

      if (error) throw error

      toast.success('Division updated successfully')
      setEditDivisionOpen(false)
      setSelectedDivision(null)
      resetDivisionForm()
      loadData()
    } catch (error: any) {
      console.error('Error updating division:', error)
      toast.error(error.message || 'Failed to update division')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDivision = async (division: Division) => {
    const divisionSections = sections.filter((s) => s.division_id === division.id)

    if (divisionSections.length > 0) {
      toast.error(`Cannot delete division with ${divisionSections.length} sections. Delete sections first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${division.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('audit_divisions').delete().eq('id', division.id)

      if (error) throw error

      toast.success('Division deleted successfully')
      loadData()
    } catch (error: any) {
      console.error('Error deleting division:', error)
      toast.error(error.message || 'Failed to delete division')
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDivision) return

    if (!sectionForm.code.trim() || !sectionForm.name.trim()) {
      toast.error('Code and name are required')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('audit_sections').insert({
        division_id: selectedDivision.id,
        code: sectionForm.code.toUpperCase(),
        name: sectionForm.name,
        description: sectionForm.description || null,
      } as any)

      if (error) {
        if (error.code === '23505') {
          toast.error('A section with this code already exists')
        } else {
          throw error
        }
        return
      }

      toast.success('Section created successfully')
      setCreateSectionOpen(false)
      setSectionForm({ code: '', name: '', description: '' })
      loadData()
    } catch (error: any) {
      console.error('Error creating section:', error)
      toast.error(error.message || 'Failed to create section')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSection = async (section: Section) => {
    if (!confirm(`Are you sure you want to delete "${section.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('audit_sections').delete().eq('id', section.id)

      if (error) throw error

      toast.success('Section deleted successfully')
      loadData()
    } catch (error: any) {
      console.error('Error deleting section:', error)
      toast.error(error.message || 'Failed to delete section')
    }
  }

  const openEditDivision = (division: Division) => {
    setSelectedDivision(division)
    setDivisionForm({
      code: division.code,
      name: division.name,
      description: division.description || '',
      head_position: division.head_position || '',
    })
    setEditDivisionOpen(true)
  }

  const openCreateSection = (division: Division) => {
    setSelectedDivision(division)
    setSectionForm({ code: '', name: '', description: '' })
    setCreateSectionOpen(true)
  }

  const filteredDivisions = divisions.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading divisions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Division Management</h1>
            <p className="text-slate-500 mt-1">Manage DLPP organizational divisions and sections</p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetDivisionForm()
            setCreateDivisionOpen(true)
          }}
          className="gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-5 w-5" />
          Add Division
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Divisions</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{divisions.length}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sections</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{sections.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">With Sections</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {divisions.filter((d) => sections.some((s) => s.division_id === d.id)).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search divisions by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Divisions List */}
      <Card>
        <CardHeader>
          <CardTitle>DLPP Divisions ({filteredDivisions.length})</CardTitle>
          <CardDescription>
            Organizational units within the Department of Lands & Physical Planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDivisions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>{divisions.length === 0 ? 'No divisions found.' : 'No matching divisions.'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Division Name</TableHead>
                  <TableHead className="font-semibold">Head Position</TableHead>
                  <TableHead className="font-semibold">Sections</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDivisions.map((division) => {
                  const divisionSections = sections.filter((s) => s.division_id === division.id)
                  return (
                    <TableRow key={division.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {division.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{division.name}</span>
                          {division.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {division.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {division.head_position || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            {divisionSections.length} sections
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCreateSection(division)}
                            className="text-blue-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDivision(division)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDivision(division)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sections by Division */}
      {divisions.length > 0 && sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sections by Division</CardTitle>
            <CardDescription>Sub-units within each division</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {divisions
                .filter((d) => sections.some((s) => s.division_id === d.id))
                .map((division) => {
                  const divisionSections = sections.filter((s) => s.division_id === division.id)
                  return (
                    <div key={division.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{division.name}</span>
                        <Badge variant="outline">{division.code}</Badge>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {divisionSections.map((section) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {section.code}
                                </Badge>
                                <span className="text-sm font-medium">{section.name}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSection(section)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Division Dialog */}
      <Dialog open={createDivisionOpen} onOpenChange={setCreateDivisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Division</DialogTitle>
            <DialogDescription>Add a new organizational division</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDivision}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., LTR"
                    value={divisionForm.code}
                    onChange={(e) => setDivisionForm({ ...divisionForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head_position">Head Position</Label>
                  <Input
                    id="head_position"
                    placeholder="e.g., Director"
                    value={divisionForm.head_position}
                    onChange={(e) => setDivisionForm({ ...divisionForm, head_position: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Division Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Land Title Registration"
                  value={divisionForm.name}
                  onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the division..."
                  value={divisionForm.description}
                  onChange={(e) => setDivisionForm({ ...divisionForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDivisionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700">
                {submitting ? 'Creating...' : 'Create Division'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Division Dialog */}
      <Dialog open={editDivisionOpen} onOpenChange={setEditDivisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
            <DialogDescription>Update division information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDivision}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_code">Code *</Label>
                  <Input
                    id="edit_code"
                    value={divisionForm.code}
                    onChange={(e) => setDivisionForm({ ...divisionForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_head_position">Head Position</Label>
                  <Input
                    id="edit_head_position"
                    value={divisionForm.head_position}
                    onChange={(e) => setDivisionForm({ ...divisionForm, head_position: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_name">Division Name *</Label>
                <Input
                  id="edit_name"
                  value={divisionForm.name}
                  onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={divisionForm.description}
                  onChange={(e) => setDivisionForm({ ...divisionForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditDivisionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Section Dialog */}
      <Dialog open={createSectionOpen} onOpenChange={setCreateSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section to {selectedDivision?.name}</DialogTitle>
            <DialogDescription>Create a new section within this division</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSection}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section_code">Section Code *</Label>
                <Input
                  id="section_code"
                  placeholder="e.g., REG"
                  value={sectionForm.code}
                  onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section_name">Section Name *</Label>
                <Input
                  id="section_name"
                  placeholder="e.g., Registration Section"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section_description">Description</Label>
                <Textarea
                  id="section_description"
                  placeholder="Brief description..."
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateSectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? 'Creating...' : 'Add Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
