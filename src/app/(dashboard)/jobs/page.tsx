"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Calendar, Clock, User, MapPin, CheckCircle, AlertCircle, XCircle, MessageSquare } from "lucide-react"
import { getJobs, createJob, updateJob, deleteJob, getClients } from "@/lib/supabase-client"
import { formatDate, formatTime } from "@/lib/utils"
import type { Job, Client, JobWithClient } from "@/types/database"
import Link from "next/link"

export default function JobsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobWithClient | null>(null)
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Handle URL parameters for client pre-selection
  useEffect(() => {
    const clientId = searchParams.get('client')
    const clientName = searchParams.get('clientName')
    
    if (clientId && clients.length > 0) {
      // Find the client in the loaded clients
      const client = clients.find(c => c.id === clientId)
      if (client) {
        setFormData(prev => ({
          ...prev,
          client_id: clientId,
          title: clientName ? `Cleaning for ${clientName}` : `Cleaning for ${client.name}`
        }))
        setIsCreateDialogOpen(true)
      }
    }
  }, [searchParams, clients])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [jobsData, clientsData] = await Promise.all([
        getJobs(),
        getClients()
      ])
      setJobs(jobsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingJob) {
        await updateJob(editingJob.id, formData)
        toast({
          title: "Success",
          description: "Job updated successfully"
        })
      } else {
        await createJob(formData)
        toast({
          title: "Success",
          description: "Job created successfully"
        })
      }
      
      setIsCreateDialogOpen(false)
      setEditingJob(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving job:', error)
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    
    try {
      await deleteJob(jobId)
      toast({
        title: "Success",
        description: "Job deleted successfully"
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (job: JobWithClient) => {
    setEditingJob(job)
    setFormData({
      client_id: job.client_id,
      title: job.title,
      description: job.description,
      scheduled_date: job.scheduled_date,
      scheduled_time: job.scheduled_time
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      client_id: "",
      title: "",
      description: "",
      scheduled_date: "",
      scheduled_time: ""
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enquiry': return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'scheduled': return <Calendar className="h-4 w-4 text-blue-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enquiry': return 'text-purple-600 bg-purple-100'
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enquiry': return 'Enquiry'
      case 'scheduled': return 'Scheduled'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    
    // Filter by client if specified in URL
    const clientId = searchParams.get('client')
    const matchesClient = !clientId || job.client_id === clientId
    
    return matchesSearch && matchesStatus && matchesClient
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">
            {(() => {
              const clientId = searchParams.get('client')
              const clientName = searchParams.get('clientName')
              if (clientId && clientName) {
                return `Jobs for ${clientName}`
              }
              return "Manage your cleaning service jobs"
            })()}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingJob(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
              <DialogDescription>
                {editingJob ? 'Update job information' : 'Schedule a new cleaning job'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Regular Cleaning, Deep Clean"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the cleaning requirements (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Scheduled Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingJob ? 'Update' : 'Create'} Job
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs by title, description, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all" ? 'No jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first cleaning job'
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {job.client?.name || 'Unknown Client'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(job.scheduled_date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(job.scheduled_time)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.client?.email || 'No email'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 