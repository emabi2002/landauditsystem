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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

interface AuditorProfile {
  id: string
  user_id: string | null
  employee_id: string | null
  position: string
  grade_level: string | null
  department: string | null
  highest_qualification: string | null
  qualification_field: string | null
  university: string | null
  graduation_year: number | null
  certifications: any[]
  specializations: string[]
  years_of_experience: number
  training_records: any[]
  max_concurrent_engagements: number
  current_workload: number
  availability_status: string
  total_audits_completed: number
  total_findings_identified: number
  date_joined: string | null
  skills_summary: string | null
  notes: string | null
  profile_status: string
  created_at: string
  user?: {
    full_name: string
    email: string
    phone: string | null
    is_active: boolean
  } | null
}

interface CertificationType {
  id: string
  code: string
  name: string
  issuing_body: string | null
  validity_years: number | null
}

interface SpecializationArea {
  id: string
  code: string
  name: string
  category: string | null
}

interface AuditUser {
  id: string
  full_name: string | null
  email: string
}

const AVAILABILITY_OPTIONS = [
  { value: 'Available', label: 'Available', color: 'bg-green-100 text-green-700' },
  { value: 'Partially Available', label: 'Partially Available', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'On Leave', label: 'On Leave', color: 'bg-blue-100 text-blue-700' },
  { value: 'Unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-700' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'Inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
  { value: 'On Leave', label: 'On Leave', color: 'bg-blue-100 text-blue-700' },
  { value: 'Terminated', label: 'Terminated', color: 'bg-red-100 text-red-700' },
]

export default function AuditorProfilesPage() {
  const [profiles, setProfiles] = useState<AuditorProfile[]>([])
  const [certificationTypes, setCertificationTypes] = useState<CertificationType[]>([])
  const [specializationAreas, setSpecializationAreas] = useState<SpecializationArea[]>([])
  const [availableUsers, setAvailableUsers] = useState<AuditUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<AuditorProfile | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    user_id: '',
    employee_id: '',
    position: '',
    grade_level: '',
    department: 'Internal Audit Unit',
    highest_qualification: '',
    qualification_field: '',
    university: '',
    graduation_year: '',
    years_of_experience: '0',
    max_concurrent_engagements: '2',
    availability_status: 'Available',
    date_joined: '',
    skills_summary: '',
    notes: '',
    profile_status: 'Active',
  })

  // Certifications and specializations for form
  const [selectedCertifications, setSelectedCertifications] = useState<any[]>([])
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load all data in parallel
      const [profilesRes, certTypesRes, specAreasRes, usersRes] = await Promise.all([
        supabase
          .from('audit_auditor_profiles')
          .select(`
            *,
            audit_users(full_name, email, phone, is_active)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('audit_certification_types')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('audit_specialization_areas')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true }),
        supabase
          .from('audit_users')
          .select('id, full_name, email')
          .eq('is_active', true)
          .order('full_name'),
      ])

      // Map profiles with user info
      const mappedProfiles: AuditorProfile[] = ((profilesRes.data as any[]) || []).map((p: any) => ({
        ...p,
        certifications: p.certifications || [],
        specializations: p.specializations || [],
        training_records: p.training_records || [],
        user: p.audit_users,
      }))

      setProfiles(mappedProfiles)
      setCertificationTypes((certTypesRes.data as CertificationType[]) || [])
      setSpecializationAreas((specAreasRes.data as SpecializationArea[]) || [])

      // Filter out users who already have profiles
      const existingUserIds = mappedProfiles.map(p => p.user_id).filter(Boolean)
      const availUsers = ((usersRes.data as AuditUser[]) || []).filter(
        u => !existingUserIds.includes(u.id)
      )
      setAvailableUsers(availUsers)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load auditor profiles')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: '',
      employee_id: '',
      position: '',
      grade_level: '',
      department: 'Internal Audit Unit',
      highest_qualification: '',
      qualification_field: '',
      university: '',
      graduation_year: '',
      years_of_experience: '0',
      max_concurrent_engagements: '2',
      availability_status: 'Available',
      date_joined: '',
      skills_summary: '',
      notes: '',
      profile_status: 'Active',
    })
    setSelectedCertifications([])
    setSelectedSpecializations([])
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.position.trim()) {
      toast.error('Position is required')
      return
    }

    setSubmitting(true)

    try {
      const profileData = {
        user_id: formData.user_id || null,
        employee_id: formData.employee_id || null,
        position: formData.position,
        grade_level: formData.grade_level || null,
        department: formData.department || 'Internal Audit Unit',
        highest_qualification: formData.highest_qualification || null,
        qualification_field: formData.qualification_field || null,
        university: formData.university || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        max_concurrent_engagements: parseInt(formData.max_concurrent_engagements) || 2,
        availability_status: formData.availability_status,
        date_joined: formData.date_joined || null,
        skills_summary: formData.skills_summary || null,
        notes: formData.notes || null,
        profile_status: formData.profile_status,
        certifications: selectedCertifications,
        specializations: selectedSpecializations,
      }

      const { error } = await supabase
        .from('audit_auditor_profiles')
        .insert(profileData as any)

      if (error) {
        if (error.code === '23505') {
          toast.error('An auditor profile with this employee ID already exists')
        } else {
          throw error
        }
        return
      }

      toast.success('Auditor profile created successfully!')
      setCreateDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Error creating profile:', error)
      toast.error(error.message || 'Failed to create auditor profile')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile) return

    setSubmitting(true)

    try {
      const profileData = {
        user_id: formData.user_id || null,
        employee_id: formData.employee_id || null,
        position: formData.position,
        grade_level: formData.grade_level || null,
        department: formData.department || 'Internal Audit Unit',
        highest_qualification: formData.highest_qualification || null,
        qualification_field: formData.qualification_field || null,
        university: formData.university || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        max_concurrent_engagements: parseInt(formData.max_concurrent_engagements) || 2,
        availability_status: formData.availability_status,
        date_joined: formData.date_joined || null,
        skills_summary: formData.skills_summary || null,
        notes: formData.notes || null,
        profile_status: formData.profile_status,
        certifications: selectedCertifications,
        specializations: selectedSpecializations,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('audit_auditor_profiles')
        .update(profileData as any)
        .eq('id', selectedProfile.id)

      if (error) throw error

      toast.success('Auditor profile updated successfully!')
      setEditDialogOpen(false)
      setSelectedProfile(null)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update auditor profile')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProfile = async (profile: AuditorProfile) => {
    if (!confirm(`Are you sure you want to delete this auditor profile? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('audit_auditor_profiles')
        .delete()
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Auditor profile deleted successfully')
      loadData()
    } catch (error: any) {
      console.error('Error deleting profile:', error)
      toast.error(error.message || 'Failed to delete auditor profile')
    }
  }

  const openEditDialog = (profile: AuditorProfile) => {
    setSelectedProfile(profile)
    setFormData({
      user_id: profile.user_id || '',
      employee_id: profile.employee_id || '',
      position: profile.position,
      grade_level: profile.grade_level || '',
      department: profile.department || 'Internal Audit Unit',
      highest_qualification: profile.highest_qualification || '',
      qualification_field: profile.qualification_field || '',
      university: profile.university || '',
      graduation_year: profile.graduation_year?.toString() || '',
      years_of_experience: profile.years_of_experience?.toString() || '0',
      max_concurrent_engagements: profile.max_concurrent_engagements?.toString() || '2',
      availability_status: profile.availability_status || 'Available',
      date_joined: profile.date_joined || '',
      skills_summary: profile.skills_summary || '',
      notes: profile.notes || '',
      profile_status: profile.profile_status || 'Active',
    })
    setSelectedCertifications(profile.certifications || [])
    setSelectedSpecializations(profile.specializations || [])
    setEditDialogOpen(true)
  }

  const openDetailSheet = (profile: AuditorProfile) => {
    setSelectedProfile(profile)
    setDetailSheetOpen(true)
  }

  const addCertification = () => {
    setSelectedCertifications([
      ...selectedCertifications,
      { name: '', issuer: '', year: new Date().getFullYear(), expiry: '' }
    ])
  }

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...selectedCertifications]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedCertifications(updated)
  }

  const removeCertification = (index: number) => {
    setSelectedCertifications(selectedCertifications.filter((_, i) => i !== index))
  }

  const toggleSpecialization = (code: string) => {
    if (selectedSpecializations.includes(code)) {
      setSelectedSpecializations(selectedSpecializations.filter(s => s !== code))
    } else {
      setSelectedSpecializations([...selectedSpecializations, code])
    }
  }

  const getAvailabilityBadge = (status: string) => {
    const option = AVAILABILITY_OPTIONS.find(o => o.value === status)
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status)
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    )
  }

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      profile.user?.full_name?.toLowerCase().includes(searchLower) ||
      profile.user?.email?.toLowerCase().includes(searchLower) ||
      profile.employee_id?.toLowerCase().includes(searchLower) ||
      profile.position?.toLowerCase().includes(searchLower)

    const matchesStatus = filterStatus === 'all' || profile.profile_status === filterStatus
    const matchesAvailability = filterAvailability === 'all' || profile.availability_status === filterAvailability

    return matchesSearch && matchesStatus && matchesAvailability
  })

  // Stats
  const stats = {
    total: profiles.length,
    active: profiles.filter(p => p.profile_status === 'Active').length,
    available: profiles.filter(p => p.availability_status === 'Available').length,
    certified: profiles.filter(p => p.certifications && p.certifications.length > 0).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading auditor profiles...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Auditor Profiles</h1>
            <p className="text-slate-500 mt-1">Manage auditor qualifications, certifications, and assignments</p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setCreateDialogOpen(true)
          }}
          className="gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Add Auditor Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Auditors</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-lg">
                <UserCircle className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Available</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.available}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Certified</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.certified}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, employee ID, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auditor Profiles ({filteredProfiles.length})</CardTitle>
          <CardDescription>
            Manage internal audit team members and their professional details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No auditor profiles found</h3>
              <p className="text-slate-600">
                {profiles.length === 0
                  ? 'No auditor profiles have been created yet.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Auditor</TableHead>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold">Certifications</TableHead>
                  <TableHead className="font-semibold">Experience</TableHead>
                  <TableHead className="font-semibold">Availability</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-full">
                          <UserCircle className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium">{profile.user?.full_name || 'Unnamed'}</p>
                          <p className="text-sm text-slate-500">{profile.employee_id || profile.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      <div>
                        <p className="font-medium">{profile.position}</p>
                        <p className="text-sm text-slate-500">{profile.grade_level || profile.department}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      <div className="flex flex-wrap gap-1">
                        {profile.certifications && profile.certifications.length > 0 ? (
                          profile.certifications.slice(0, 2).map((cert: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cert.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                        {profile.certifications && profile.certifications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.certifications.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      <span className="font-medium">{profile.years_of_experience}</span>
                      <span className="text-slate-500"> years</span>
                    </TableCell>
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      {getAvailabilityBadge(profile.availability_status)}
                    </TableCell>
                    <TableCell onClick={() => openDetailSheet(profile)}>
                      {getStatusBadge(profile.profile_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProfile(profile)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false)
          setEditDialogOpen(false)
          setSelectedProfile(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialogOpen ? 'Edit Auditor Profile' : 'Create Auditor Profile'}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? 'Update the auditor profile information'
                : 'Add a new auditor to the internal audit team'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editDialogOpen ? handleUpdateProfile : handleCreateProfile}>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
                <TabsTrigger value="specializations">Specializations</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link to User Account</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No linked user</SelectItem>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                        {selectedProfile?.user_id && (
                          <SelectItem value={selectedProfile.user_id}>
                            {selectedProfile.user?.full_name || selectedProfile.user?.email} (current)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      placeholder="e.g., EMP-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Senior Internal Auditor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Input
                      value={formData.grade_level}
                      onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                      placeholder="e.g., Grade 15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Internal Audit Unit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Joined</Label>
                    <Input
                      type="date"
                      value={formData.date_joined}
                      onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Concurrent Engagements</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_concurrent_engagements}
                      onChange={(e) => setFormData({ ...formData, max_concurrent_engagements: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select
                      value={formData.availability_status}
                      onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profile Status</Label>
                  <Select
                    value={formData.profile_status}
                    onValueChange={(value) => setFormData({ ...formData, profile_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Qualifications Tab */}
              <TabsContent value="qualifications" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Highest Qualification</Label>
                    <Select
                      value={formData.highest_qualification}
                      onValueChange={(value) => setFormData({ ...formData, highest_qualification: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                        <SelectItem value="Masters">Master's Degree</SelectItem>
                        <SelectItem value="Bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={formData.qualification_field}
                      onChange={(e) => setFormData({ ...formData, qualification_field: e.target.value })}
                      placeholder="e.g., Accounting, Business Administration"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>University/Institution</Label>
                    <Input
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="e.g., University of Papua New Guinea"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Graduation Year</Label>
                    <Input
                      type="number"
                      min="1970"
                      max={new Date().getFullYear()}
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      placeholder="e.g., 2015"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills Summary</Label>
                  <Textarea
                    value={formData.skills_summary}
                    onChange={(e) => setFormData({ ...formData, skills_summary: e.target.value })}
                    placeholder="Brief summary of key skills and competencies..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the auditor..."
                    rows={2}
                  />
                </div>
              </TabsContent>

              {/* Certifications Tab */}
              <TabsContent value="certifications" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Professional Certifications</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addCertification}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Certification
                  </Button>
                </div>

                {selectedCertifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                    <Award className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p>No certifications added yet</p>
                    <Button type="button" size="sm" variant="link" onClick={addCertification}>
                      Add first certification
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCertifications.map((cert, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Certification</Label>
                              <Select
                                value={cert.name}
                                onValueChange={(value) => updateCertification(index, 'name', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {certificationTypes.map((ct) => (
                                    <SelectItem key={ct.code} value={ct.code}>
                                      {ct.code} - {ct.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Issuing Body</Label>
                              <Input
                                value={cert.issuer || ''}
                                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                placeholder="e.g., IIA"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Year Obtained</Label>
                              <Input
                                type="number"
                                value={cert.year || ''}
                                onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value))}
                                placeholder="2023"
                              />
                            </div>
                            <div className="space-y-1 flex items-end gap-2">
                              <div className="flex-1">
                                <Label className="text-xs">Expiry Date</Label>
                                <Input
                                  type="date"
                                  value={cert.expiry || ''}
                                  onChange={(e) => updateCertification(index, 'expiry', e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => removeCertification(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Specializations Tab */}
              <TabsContent value="specializations" className="space-y-4 mt-4">
                <Label className="text-base font-semibold">Areas of Specialization</Label>
                <p className="text-sm text-slate-500">
                  Select the audit areas and skills this auditor specializes in
                </p>

                {['Audit Type', 'Subject Matter', 'Skills'].map((category) => (
                  <div key={category} className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">{category}</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializationAreas
                        .filter((s) => s.category === category)
                        .map((spec) => (
                          <Badge
                            key={spec.code}
                            variant={selectedSpecializations.includes(spec.code) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-colors ${
                              selectedSpecializations.includes(spec.code)
                                ? 'bg-teal-600 hover:bg-teal-700'
                                : 'hover:bg-slate-100'
                            }`}
                            onClick={() => toggleSpecialization(spec.code)}
                          >
                            {selectedSpecializations.includes(spec.code) && (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {spec.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false)
                  setEditDialogOpen(false)
                  setSelectedProfile(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                {submitting ? 'Saving...' : editDialogOpen ? 'Update Profile' : 'Create Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-full">
                <UserCircle className="h-6 w-6 text-teal-600" />
              </div>
              {selectedProfile?.user?.full_name || 'Auditor Profile'}
            </SheetTitle>
            <SheetDescription>
              {selectedProfile?.position} • {selectedProfile?.department}
            </SheetDescription>
          </SheetHeader>

          {selectedProfile && (
            <div className="mt-6 space-y-6">
              {/* Status Badges */}
              <div className="flex gap-2">
                {getStatusBadge(selectedProfile.profile_status)}
                {getAvailabilityBadge(selectedProfile.availability_status)}
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Employment Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Employee ID:</span>
                    <p className="font-medium">{selectedProfile.employee_id || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Grade Level:</span>
                    <p className="font-medium">{selectedProfile.grade_level || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date Joined:</span>
                    <p className="font-medium">
                      {selectedProfile.date_joined
                        ? new Date(selectedProfile.date_joined).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Experience:</span>
                    <p className="font-medium">{selectedProfile.years_of_experience} years</p>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Qualifications
                </h4>
                <div className="text-sm space-y-2">
                  {selectedProfile.highest_qualification && (
                    <p>
                      <span className="font-medium">{selectedProfile.highest_qualification}</span>
                      {selectedProfile.qualification_field && ` in ${selectedProfile.qualification_field}`}
                    </p>
                  )}
                  {selectedProfile.university && (
                    <p className="text-slate-600">
                      {selectedProfile.university}
                      {selectedProfile.graduation_year && ` (${selectedProfile.graduation_year})`}
                    </p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </h4>
                {selectedProfile.certifications && selectedProfile.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProfile.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <Badge variant="outline">{cert.name}</Badge>
                          <span className="text-sm text-slate-600 ml-2">{cert.issuer}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {cert.year}
                          {cert.expiry && ` • Expires: ${cert.expiry}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No certifications recorded</p>
                )}
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Specializations
                </h4>
                {selectedProfile.specializations && selectedProfile.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.specializations.map((spec: string, idx: number) => {
                      const specArea = specializationAreas.find(s => s.code === spec)
                      return (
                        <Badge key={idx} variant="secondary">
                          {specArea?.name || spec}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No specializations recorded</p>
                )}
              </div>

              {/* Performance */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-teal-600">
                        {selectedProfile.total_audits_completed}
                      </p>
                      <p className="text-xs text-slate-500">Audits Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {selectedProfile.total_findings_identified}
                      </p>
                      <p className="text-xs text-slate-500">Findings Identified</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Skills Summary */}
              {selectedProfile.skills_summary && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Skills Summary</h4>
                  <p className="text-sm text-slate-600">{selectedProfile.skills_summary}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDetailSheetOpen(false)
                    openEditDialog(selectedProfile)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
