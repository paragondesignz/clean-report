"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Building2,
  Edit,
  Trash2,
  Save,
  X,
  Play,
  Eye,
  AlertCircle
} from "lucide-react"
import { 
  getRecurringJob,
  updateRecurringJob, 
  deleteRecurringJob, 
  getClients, 
  generateJobInstances, 
  getRecurringJobInstances,
  getClient
} from "@/lib/supabase-client"
import { formatDate, formatTime, formatListDate } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import type { RecurringJob, Client, JobWithClient } from "@/types/database"

interface RecurringJobWithClient extends RecurringJob {
  client?: Client
}

export default function RecurringJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [recurringJob, setRecurringJob] = useState<RecurringJobWithClient | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobInstances, setJobInstances] = useState<JobWithClient[]>([])
  const [loadingInstances, setLoadingInstances] = useState(false)
  const [generatingInstances, setGeneratingInstances] = useState(false)
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

  const fetchRecurringJob = useCallback(async () => {
    try {
      setLoading(true)
      const jobData = await getRecurringJob(resolvedParams.id)
      
      if (!jobData) {
        toast({
          title: "Error",
          description: "Recurring job not found",
          variant: "destructive"
        })
        router.push("/recurring")
        return
      }

      // Fetch client details
      let clientData = null
      if (jobData.client_id) {
        try {
          clientData = await getClient(jobData.client_id)
        } catch (error) {
          console.error("Error fetching client:", error)
        }
      }

      const jobWithClient: RecurringJobWithClient = {
        ...jobData,
        client: clientData || undefined
      }

      setRecurringJob(jobWithClient)
      
      // Set form data for editing
      setFormData({
        client_id: jobData.client_id,
        title: jobData.title,
        description: jobData.description || "",
        frequency: jobData.frequency,
        start_date: jobData.start_date,
        end_date: jobData.end_date || "",
        scheduled_time: jobData.scheduled_time || "",
        is_active: jobData.is_active
      })

      // Fetch job instances
      await fetchJobInstances()
    } catch (error) {
      console.error("Error fetching recurring job:", error)
      toast({
        title: "Error",
        description: "Failed to load recurring job details",
        variant: "destructive"
      })
      router.push("/recurring")
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id, router, toast])

  const fetchJobInstances = async () => {
    try {
      setLoadingInstances(true)
      const instances = await getRecurringJobInstances(resolvedParams.id)
      
      // Fetch client details for each instance
      const instancesWithClients = await Promise.all(
        instances.map(async (instance) => {
          let clientData = null
          if (instance.client_id) {
            try {
              clientData = await getClient(instance.client_id)
            } catch (error) {
              console.error("Error fetching client for instance:", error)
            }
          }
          return {
            ...instance,
            client: clientData || undefined
          } as JobWithClient
        })
      )
      
      setJobInstances(instancesWithClients)
    } catch (error) {
      console.error("Error fetching job instances:", error)
      toast({
        title: "Error",
        description: "Failed to load job instances",
        variant: "destructive"
      })
    } finally {
      setLoadingInstances(false)
    }
  }

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }, [])

  useEffect(() => {
    fetchRecurringJob()
    fetchClients()
  }, [fetchRecurringJob, fetchClients])

  const handleUpdate = async () => {
    try {
      await updateRecurringJob(resolvedParams.id, formData)
      toast({
        title: "Success",
        description: "Recurring job updated successfully"
      })
      setIsEditing(false)
      await fetchRecurringJob()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update recurring job",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRecurringJob(resolvedParams.id, 'all')
      toast({
        title: "Success",
        description: "Recurring job deleted successfully"
      })
      router.push("/recurring")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete recurring job",
        variant: "destructive"
      })
    }
  }

  const handleGenerateInstances = async () => {
    try {
      setGeneratingInstances(true)
      await generateJobInstances(resolvedParams.id)
      toast({
        title: "Success",
        description: "Job instances generated successfully"
      })
      await fetchJobInstances()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate job instances",
        variant: "destructive"
      })
    } finally {
      setGeneratingInstances(false)
    }
  }

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-purple-100 text-purple-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'bi_weekly': return 'bg-indigo-100 text-indigo-800'
      case 'monthly': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const instanceColumns = [
    {
      key: "scheduled_date",
      label: "Date",
      render: (value: any, row: any) => formatListDate(row.scheduled_date)
    },
    {
      key: "scheduled_time",
      label: "Time",
      render: (value: any, row: any) => row.scheduled_time || "Not set"
    },
    {
      key: "status",
      label: "Status",
      render: (value: any, row: any) => (
        <Badge className={getStatusBadgeColor(row.status)}>
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/jobs/${row.id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recurring job details...</p>
        </div>
      </div>
    )
  }

  if (!recurringJob) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Recurring job not found</p>
          <Button onClick={() => router.push("/recurring")} className="mt-4">
            Back to Recurring Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/recurring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {recurringJob.title}
            </h1>
            <p className="text-slate-600">Recurring Job Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              {recurringJob.is_active ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Client</Label>
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
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Client:</span>
                  <span>{recurringJob.client?.name || 'Not assigned'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Frequency:</span>
                  <Badge className={getFrequencyBadgeColor(recurringJob.frequency)}>
                    {recurringJob.frequency.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Start Date:</span>
                  <span>{formatDate(recurringJob.start_date)}</span>
                </div>
                {recurringJob.end_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">End Date:</span>
                    <span>{formatDate(recurringJob.end_date)}</span>
                  </div>
                )}
                {recurringJob.scheduled_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Scheduled Time:</span>
                    <span>{formatTime(recurringJob.scheduled_time)}</span>
                  </div>
                )}
                {recurringJob.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-gray-600">{recurringJob.description}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage job instances and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateInstances}
              disabled={generatingInstances}
              className="w-full"
            >
              {generatingInstances ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Next Instances
                </>
              )}
            </Button>
            
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Total Instances:</span>
                  <span className="font-medium">{jobInstances.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">
                    {jobInstances.filter(j => j.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled:</span>
                  <span className="font-medium">
                    {jobInstances.filter(j => j.status === 'scheduled').length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Instances */}
      <Card>
        <CardHeader>
          <CardTitle>Job Instances</CardTitle>
          <CardDescription>
            All jobs created from this recurring schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInstances ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading instances...</p>
            </div>
          ) : jobInstances.length > 0 ? (
            <DataTable
              title="Job Instances"
              columns={instanceColumns}
              data={jobInstances}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No job instances generated yet</p>
              <Button
                onClick={handleGenerateInstances}
                variant="outline"
                className="mt-4"
              >
                Generate Instances
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recurring job? This will also delete all future scheduled instances.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}