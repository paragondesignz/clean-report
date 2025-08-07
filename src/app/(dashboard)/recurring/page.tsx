"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Calendar, Clock, User, RefreshCw, CheckCircle, XCircle, Building2, DollarSign, Play, Eye } from "lucide-react"
import { getRecurringJobs, createRecurringJob, updateRecurringJob, deleteRecurringJob, getClients, testRecurringJobsTable, checkRequiredTables, generateJobInstances, getRecurringJobInstances } from "@/lib/supabase-client"
import { formatDate, formatTime, formatDistanceToNow, formatListDate } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradePrompt } from "@/components/ui/upgrade-prompt"
import type { RecurringJob, Client, RecurringJobWithClient, JobWithClient } from "@/types/database"

export default function RecurringJobsPage() {
  const { toast } = useToast()
  const { canAccessFeature, getFeatureUpgradeMessage, isPro } = useSubscription()
  const [recurringJobs, setRecurringJobs] = useState<RecurringJobWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [editingJob, setEditingJob] = useState<RecurringJobWithClient | null>(null)
  const [viewingInstances, setViewingInstances] = useState<string | null>(null)
  const [jobInstances, setJobInstances] = useState<JobWithClient[]>([])
  const [generatingInstances, setGeneratingInstances] = useState<string | null>(null)
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables')
      }
      
      // Test recurring jobs table
      console.log('Testing recurring jobs table...')
      const tableTest = await testRecurringJobsTable()
      console.log('Recurring jobs table test result:', tableTest)
      
      if (!tableTest.success) {
        throw new Error(`Recurring jobs table not accessible: ${tableTest.error}`)
      }
      
      console.log('Fetching recurring jobs data...')
      const [recurringJobsData, clientsData] = await Promise.all([
        getRecurringJobs(),
        getClients()
      ])
      
      console.log('Recurring jobs data fetched successfully:', {
        recurringJobs: recurringJobsData?.length || 0,
        clients: clientsData?.length || 0
      })
      
      setRecurringJobs(recurringJobsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load recurring jobs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Prepare data with proper null handling for optional date fields
      const submitData = {
        ...formData,
        end_date: formData.end_date || null // Convert empty string to null
      }
      
      if (editingJob) {
        await updateRecurringJob(editingJob.id, submitData)
        toast({
          title: "Success",
          description: "Recurring job updated successfully"
        })
      } else {
        await createRecurringJob(submitData)
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

  const handleGenerateInstances = async (jobId: string) => {
    try {
      setGeneratingInstances(jobId)
      const instances = await generateJobInstances(jobId)
      toast({
        title: "Success",
        description: `Generated ${instances.length} job instances`
      })
      // Optionally refresh or show instances
      handleViewInstances(jobId)
    } catch (error) {
      console.error('Error generating instances:', error)
      toast({
        title: "Error",
        description: "Failed to generate job instances",
        variant: "destructive"
      })
    } finally {
      setGeneratingInstances(null)
    }
  }

  const handleViewInstances = async (jobId: string) => {
    try {
      const instances = await getRecurringJobInstances(jobId)
      setJobInstances(instances || [])
      setViewingInstances(jobId)
    } catch (error) {
      console.error('Error fetching instances:', error)
      toast({
        title: "Error",
        description: "Failed to fetch job instances",
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

  const getRecurringValue = (job: RecurringJobWithClient) => {
    // Mock value calculation - in real app this would come from pricing
    return `$${(Math.random() * 150 + 75).toFixed(0)}`
  }

  const getLastUpdated = (job: RecurringJobWithClient) => {
    // Mock last updated - in real app this would be actual timestamp
    const days = Math.floor(Math.random() * 10)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const stats = {
    total: recurringJobs.length,
    active: recurringJobs.filter(job => job.is_active).length,
    inactive: recurringJobs.filter(job => !job.is_active).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading recurring jobs...</p>
        </div>
      </div>
    )
  }

  // Prepare data for DataTable
  const tableData = recurringJobs.map(job => ({
    id: job.id,
    title: job.title,
    client: job.client?.name || 'Unknown Client',
    status: job.is_active,
    frequency: job.frequency,
    startDate: formatListDate(job.start_date),
    endDate: job.end_date ? formatListDate(job.end_date) : null,
    scheduledTime: formatTime(job.scheduled_time),
    value: getRecurringValue(job),
    lastUpdated: getLastUpdated(job),
    description: job.description,
    clientId: job.client_id
  }))

  // Define columns for DataTable
  const columns = [
    {
      key: 'title',
      label: 'Recurring Job',
      sortable: true,
      width: '300px',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md flex-shrink-0">
            {getFrequencyIcon(row.frequency)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      width: '160px',
      render: (value: string, row: any) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">Client name</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="outline">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium">{getFrequencyText(value)}</div>
          <div className="text-muted-foreground text-xs">Schedule</div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Schedule',
      sortable: true,
      width: '120px',
      render: (value: string, row: any) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">{row.scheduledTime}</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-green-600">{value}</span>
        </div>
      )
    }
  ]


  return (
    <div className="space-y-6">
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

      {/* DataTable */}
      <DataTable
        title="Recurring Jobs"
        description="Manage your automated cleaning schedules"
        data={tableData}
        columns={columns}
        addButton={{
          label: "New Recurring Job",
          icon: Plus,
          onClick: canAccessFeature('recurringJobs') ? () => {
            setEditingJob(null)
            resetForm()
            setIsCreateDialogOpen(true)
          } : () => {
            setShowUpgradePrompt(true)
          }
        }}
        onRowClick={(row) => `/recurring/${row.id}`}
        searchPlaceholder="Search recurring jobs by title, description, or client..."
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
          ]},
          { key: 'frequency', label: 'Frequency', options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'bi_weekly', label: 'Bi-weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]}
        ]}
        customActions={[
          {
            label: 'Generate Instances',
            icon: Play,
            onClick: (row) => handleGenerateInstances(row.id),
            variant: 'outline'
          },
          {
            label: 'View Instances',
            icon: Eye,
            onClick: (row) => handleViewInstances(row.id),
            variant: 'outline'
          },
          {
            label: 'Edit',
            icon: Edit,
            onClick: (row) => handleEdit(recurringJobs.find(j => j.id === row.id)!),
            variant: 'outline'
          },
          {
            label: 'Toggle Active',
            icon: CheckCircle,
            onClick: (row) => handleToggleActive(recurringJobs.find(j => j.id === row.id)!),
            show: (row) => row.status,
            variant: 'outline'
          },
          {
            label: 'Toggle Active',
            icon: XCircle,
            onClick: (row) => handleToggleActive(recurringJobs.find(j => j.id === row.id)!),
            show: (row) => !row.status,
            variant: 'outline'
          }
        ]}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

      {/* View Instances Dialog */}
      <Dialog open={!!viewingInstances} onOpenChange={() => setViewingInstances(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Instances</DialogTitle>
            <DialogDescription>
              Individual job occurrences generated from this recurring pattern. Each can be edited independently.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {jobInstances.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No instances generated yet. Click "Generate Instances" to create job occurrences.
              </p>
            ) : (
              jobInstances.map((job) => (
                <Card key={job.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}
                        {job.end_time && ` - ${formatTime(job.end_time)}`}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/jobs/${job.id}`}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingInstances(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePrompt
        title="Upgrade to Pro"
        description={getFeatureUpgradeMessage('Recurring Jobs')}
        feature="Recurring Jobs"
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
      />
    </div>
  )
} 