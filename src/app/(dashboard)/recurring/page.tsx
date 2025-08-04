"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Calendar, Clock, User, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { getRecurringJobs, createRecurringJob, updateRecurringJob, deleteRecurringJob, getClients } from "@/lib/supabase-client"
import { formatDate, formatTime } from "@/lib/utils"
import type { RecurringJob, Client, RecurringJobWithClient } from "@/types/database"

export default function RecurringJobsPage() {
  const { toast } = useToast()
  const [recurringJobs, setRecurringJobs] = useState<RecurringJobWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<RecurringJobWithClient | null>(null)
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    frequency: "weekly" as "daily" | "weekly" | "bi_weekly" | "monthly",
    start_date: "",
    end_date: "",
    scheduled_time: "",
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [recurringJobsData, clientsData] = await Promise.all([
        getRecurringJobs(),
        getClients()
      ])
      setRecurringJobs(recurringJobsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load recurring jobs",
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
        await updateRecurringJob(editingJob.id, formData)
        toast({
          title: "Success",
          description: "Recurring job updated successfully"
        })
      } else {
        await createRecurringJob(formData)
        toast({
          title: "Success",
          description: "Recurring job created successfully"
        })
      }
      
      setIsCreateDialogOpen(false)
      setEditingJob(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving recurring job:', error)
      toast({
        title: "Error",
        description: "Failed to save recurring job",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this recurring job?")) return
    
    try {
      await deleteRecurringJob(jobId)
      toast({
        title: "Success",
        description: "Recurring job deleted successfully"
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting recurring job:', error)
      toast({
        title: "Error",
        description: "Failed to delete recurring job",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (job: RecurringJobWithClient) => {
    try {
      await updateRecurringJob(job.id, { is_active: !job.is_active })
      toast({
        title: "Success",
        description: `Recurring job ${job.is_active ? 'deactivated' : 'activated'} successfully`
      })
      fetchData()
    } catch (error) {
      console.error('Error toggling recurring job:', error)
      toast({
        title: "Error",
        description: "Failed to update recurring job status",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (job: RecurringJobWithClient) => {
    setEditingJob(job)
    setFormData({
      client_id: job.client_id,
      title: job.title,
      description: job.description,
      frequency: job.frequency,
      start_date: job.start_date,
      end_date: job.end_date || "",
      scheduled_time: job.scheduled_time,
      is_active: job.is_active
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      client_id: "",
      title: "",
      description: "",
      frequency: "weekly",
      start_date: "",
      end_date: "",
      scheduled_time: "",
      is_active: true
    })
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'bi_weekly': return 'Bi-weekly'
      case 'monthly': return 'Monthly'
      default: return frequency
    }
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Calendar className="h-4 w-4 text-blue-600" />
      case 'weekly': return <RefreshCw className="h-4 w-4 text-green-600" />
      case 'bi_weekly': return <RefreshCw className="h-4 w-4 text-purple-600" />
      case 'monthly': return <Calendar className="h-4 w-4 text-orange-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredJobs = recurringJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: recurringJobs.length,
    active: recurringJobs.filter(job => job.is_active).length,
    inactive: recurringJobs.filter(job => !job.is_active).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading recurring jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Jobs</h1>
          <p className="text-gray-600">Manage your automated cleaning schedules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingJob(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Recurring Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Recurring Job' : 'Create Recurring Job'}</DialogTitle>
              <DialogDescription>
                {editingJob ? 'Update recurring job settings' : 'Set up an automated cleaning schedule'}
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
                    placeholder="e.g., Weekly Cleaning, Monthly Deep Clean"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the cleaning requirements"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: "daily" | "weekly" | "bi_weekly" | "monthly") => 
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingJob ? 'Update' : 'Create'} Recurring Job
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recurring Jobs</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All recurring schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Jobs</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Paused schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search recurring jobs by title, description, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recurring Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No recurring jobs found' : 'No recurring jobs yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first recurring job'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Recurring Job
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
                    {getFrequencyIcon(job.frequency)}
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={job.is_active}
                      onCheckedChange={() => handleToggleActive(job)}
                    />
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {getFrequencyText(job.frequency)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Starts {formatDate(job.start_date)}
                  </div>
                  {job.end_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ends {formatDate(job.end_date)}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(job.scheduled_time)}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.is_active 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-red-600 bg-red-100'
                  }`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 