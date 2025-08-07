"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTierAccess } from "@/lib/tier-access"
import { FeatureUpgradePrompt } from "@/lib/tier-access"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, Mail, Phone, Calendar, DollarSign, TrendingUp, Loader2, Edit, Trash2 } from "lucide-react"

interface SubContractor {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  hourlyRate: number
  specialties: string[]
  jobsCompleted: number
  totalJobs: number
  lastActive: string
  created_at: string
  updated_at: string
}

export default function SubContractorsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState<SubContractor | null>(null)
  const [subContractors, setSubContractors] = useState<SubContractor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { access, userRole } = useTierAccess()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    hourly_rate: '',
    specialties: ''
  })

  // Sub contractors shouldn't see this page at all
  if (userRole === 'sub_contractor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sub Contractors</h1>
          <p className="text-muted-foreground">
            Access denied. Sub contractor management is only available to administrators.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600">
              Sub contractor management is only available to account administrators. 
              Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Free users see upgrade prompts
  if (!access.subContractors) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sub Contractors</h1>
          <p className="text-muted-foreground">
            Upgrade to Pro to manage sub contractors and scale your business.
          </p>
        </div>

        <FeatureUpgradePrompt
          feature="subContractors"
          title="Sub Contractor Management"
          description="Add and manage sub contractors to scale your cleaning business efficiently."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Scale Your Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Add sub contractors to handle more jobs and grow your business.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Job Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Assign jobs to sub contractors and track their progress.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage payments and revenue sharing with your team.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Why Upgrade to Pro?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Scale your business</h4>
                  <p className="text-sm text-gray-600">
                    Add sub contractors to handle more jobs and grow your revenue
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Job management</h4>
                  <p className="text-sm text-gray-600">
                    Assign jobs, track progress, and manage schedules efficiently
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Team communication</h4>
                  <p className="text-sm text-gray-600">
                    Real-time messaging and coordination with your sub contractors
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch sub contractors
  useEffect(() => {
    fetchSubContractors()
  }, [fetchSubContractors])

  const fetchSubContractors = async () => {
    try {
      setLoading(true)
      console.log('Fetching sub contractors...')
      
      // First try the debug endpoint to see if API is working
      try {
        const debugResponse = await fetch('/api/sub-contractors/debug')
        console.log('Debug endpoint status:', debugResponse.status)
        if (debugResponse.ok) {
          const debugData = await debugResponse.json()
          console.log('Debug endpoint response:', debugData)
        }
      } catch (debugError) {
        console.log('Debug endpoint failed:', debugError)
      }
      
      const response = await fetch('/api/sub-contractors')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        
        if (response.status === 401) {
          throw new Error('Please log in to access sub contractors')
        } else if (errorData.code === 'DATABASE_ERROR' && errorData.details?.includes('relation "sub_contractors" does not exist')) {
          throw new Error('Database tables not set up. Please run the SQL script in Supabase.')
        } else {
          throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: Failed to fetch sub contractors`)
        }
      }
      
      const data = await response.json()
      console.log('Fetched data:', data)
      setSubContractors(data)
    } catch (error) {
      console.error('Error fetching sub contractors:', error)
      
      // Check if it's a network error (offline)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "You appear to be offline. Please check your internet connection.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load sub contractors",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubContractor = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/sub-contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : []
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add sub contractor')
      }

      const newContractor = await response.json()
      setSubContractors(prev => [newContractor, ...prev])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Sub contractor added successfully",
      })
    } catch (error) {
      console.error('Error adding sub contractor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add sub contractor",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubContractor = async () => {
    if (!selectedContractor) return

    try {
      setSaving(true)
      const response = await fetch(`/api/sub-contractors/${selectedContractor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : []
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sub contractor')
      }

      const updatedContractor = await response.json()
      setSubContractors(prev => prev.map(c => c.id === selectedContractor.id ? updatedContractor : c))
      setIsEditDialogOpen(false)
      setSelectedContractor(null)
      resetForm()
      toast({
        title: "Success",
        description: "Sub contractor updated successfully",
      })
    } catch (error) {
      console.error('Error updating sub contractor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sub contractor",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubContractor = async (contractorId: string) => {
    if (!confirm('Are you sure you want to delete this sub contractor?')) return

    try {
      const response = await fetch(`/api/sub-contractors/${contractorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sub contractor')
      }

      setSubContractors(prev => prev.filter(c => c.id !== contractorId))
      toast({
        title: "Success",
        description: "Sub contractor deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting sub contractor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sub contractor",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      hourly_rate: '',
      specialties: ''
    })
  }

  const handleEdit = (contractor: SubContractor) => {
    setSelectedContractor(contractor)
    setFormData({
      first_name: contractor.name.split(' ')[0] || '',
      last_name: contractor.name.split(' ').slice(1).join(' ') || '',
      email: contractor.email,
      phone: contractor.phone,
      hourly_rate: contractor.hourlyRate.toString(),
      specialties: contractor.specialties.join(', ')
    })
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  // Pro users see the full sub contractor management interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sub Contractors</h1>
          <p className="text-muted-foreground">
            Manage your sub contractors and scale your business.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Sub Contractor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sub Contractor</DialogTitle>
              <DialogDescription>
                Add a new sub contractor to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input 
                    id="first_name" 
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name" 
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input 
                    id="last_name" 
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address" 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number" 
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input 
                  id="hourly_rate" 
                  type="number" 
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="25" 
                />
              </div>
              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Textarea 
                  id="specialties" 
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="Deep Cleaning, Move-in/out, Regular Cleaning" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubContractor} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Sub Contractor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sub Contractors</p>
                <p className="text-2xl font-bold">{subContractors.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {subContractors.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">
                  {subContractors.filter(c => c.status === 'active').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
                <p className="text-2xl font-bold">
                  {subContractors.reduce((sum, c) => sum + c.jobsCompleted, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">
                  {subContractors.reduce((sum, c) => sum + c.totalJobs, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {subContractors.reduce((sum, c) => sum + c.totalJobs, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub Contractors List */}
      <Card>
        <CardHeader>
          <CardTitle>Sub Contractors</CardTitle>
          <CardDescription>
            Manage your team of sub contractors and their assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : subContractors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sub contractors yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first sub contractor to scale your business.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Sub Contractor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {subContractors.map((contractor) => (
                <div key={contractor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {contractor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{contractor.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {contractor.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {contractor.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(contractor.status)}>
                            {contractor.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatLastActive(contractor.lastActive)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {contractor.jobsCompleted} jobs completed • ${contractor.hourlyRate}/hr
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(contractor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubContractor(contractor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {contractor.specialties.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Specialties:</span>
                        {contractor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sub Contractor</DialogTitle>
            <DialogDescription>
              Update sub contractor information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-first_name">First Name</Label>
                <Input 
                  id="edit-first_name" 
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-last_name">Last Name</Label>
                <Input 
                  id="edit-last_name" 
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input 
                id="edit-phone" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-hourly_rate">Hourly Rate ($)</Label>
              <Input 
                id="edit-hourly_rate" 
                type="number" 
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialties">Specialties (comma-separated)</Label>
              <Textarea 
                id="edit-specialties" 
                value={formData.specialties}
                onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubContractor} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 