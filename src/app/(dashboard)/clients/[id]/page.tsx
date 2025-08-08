"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Save,
  X,
  User, 
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Pencil,
  ExternalLink,
  History,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Star
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getClient, getJobsForClient, getRecurringJobsForClient, getClientTaskCompletionHistory } from "@/lib/supabase-client"
import type { Client, Job } from "@/types/database"
import { GoogleMaps } from "@/components/ui/google-maps"
import { TaskSuggestions } from "@/components/ai/task-suggestions"
import { JobNotes } from "@/components/job-notes"
import { Switch } from "@/components/ui/switch"
import { createJob, createRecurringJob } from "@/lib/supabase-client"

interface ClientNote {
  id: string
  client_id: string
  content: string
  created_at: string
  updated_at: string
}

interface ClientWithDetails extends Client {
  notes?: ClientNote[]
  totalJobs?: number
  completedJobs?: number
  totalRevenue?: number
  upcomingJobs?: number
  totalRecurringJobs?: number
  completionRate?: number
  avgTaskCompletion?: number
  lastJobDate?: string | null
  daysSinceLastJob?: number | null
}

// Component to display recurring jobs for a client
function ClientRecurringJobsList({ clientId }: { clientId: string }) {
  const [recurringJobs, setRecurringJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadRecurringJobs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecurringJobsForClient(clientId)
      setRecurringJobs(data)
    } catch (error) {
      console.error('Error loading recurring jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    loadRecurringJobs()
  }, [loadRecurringJobs])

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly' 
      case 'bi_weekly': return 'Bi-weekly'
      case 'monthly': return 'Monthly'
      default: return frequency
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading recurring jobs...</div>
  }

  if (recurringJobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No recurring jobs set up for this client</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recurringJobs.map((recurringJob) => (
        <div key={recurringJob.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">{recurringJob.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {getFrequencyLabel(recurringJob.frequency)}
                </Badge>
              </div>
              {recurringJob.description && (
                <p className="text-sm text-gray-600 mb-2">{recurringJob.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Started: {formatDate(recurringJob.start_date)}</span>
                {recurringJob.end_date && (
                  <span>Ends: {formatDate(recurringJob.end_date)}</span>
                )}
                {recurringJob.scheduled_time && (
                  <span>Time: {recurringJob.scheduled_time}</span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/calendar?recurring=${recurringJob.id}`)}
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View in Calendar
            </Button>
          </div>
        </div>
      ))}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          To edit individual instances, use the calendar view above.
        </p>
      </div>
    </div>
  )
}

// Component to display jobs for a client with smart pagination
function ClientJobsList({ clientId }: { clientId: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const loadJobs = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(pageNum === 1)
      const limit = 10
      const offset = (pageNum - 1) * limit
      
      // Get jobs but exclude recurring job instances to avoid duplication
      const allJobs = await getJobsForClient(clientId, limit, offset)
      const jobsData = allJobs.filter(job => !job.recurring_job_id)
      
      if (append) {
        setJobs(prev => [...prev, ...jobsData])
      } else {
        setJobs(jobsData)
      }
      
      setHasMore(jobsData.length === limit)
    } catch (error) {
      console.error('Error loading client jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadJobs(nextPage, true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'  
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'enquiry': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && jobs.length === 0) {
    return <div className="text-center py-4 text-gray-500">Loading jobs...</div>
  }

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-gray-500">No jobs found for this client.</div>
  }

  const displayedJobs = expanded ? jobs : jobs.slice(0, 5)
  const recurringJobs = jobs.filter(job => job.recurring_job_id)
  const regularJobs = jobs.filter(job => !job.recurring_job_id)

  return (
    <div className="space-y-4">
      {/* Summary for recurring jobs */}
      {recurringJobs.length > 0 && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              {recurringJobs.length} recurring job instance{recurringJobs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            These are individual instances of recurring job patterns
          </p>
        </div>
      )}

      <div className="space-y-2">
        {displayedJobs.map((job) => (
          <div
            key={job.id}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              job.recurring_job_id ? 'border-l-4 border-l-purple-400' : ''
            }`}
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{job.title}</span>
                  {job.recurring_job_id && (
                    <RefreshCw className="h-3 w-3 text-purple-600" title="Recurring job instance" />
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(job.scheduled_date)}</span>
                  </span>
                  <span>{job.scheduled_time}</span>
                  {job.end_time && <span>- {job.end_time}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length > 5 && (
        <div className="flex items-center justify-center space-x-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show More ({jobs.length - 5} more)
              </>
            )}
          </Button>
          
          {expanded && hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={loading}
            >
              Load More Jobs
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = useState<ClientWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [aiSuggestionsData, setAiSuggestionsData] = useState<any>(null)

  const fetchClientDetails = useCallback(async (clientId: string) => {
    try {
      setLoading(true)
      
      // Validate client ID
      if (!clientId || clientId === 'undefined' || clientId === 'null') {
        throw new Error('Invalid client ID')
      }
      
      console.log('Fetching client details for ID:', clientId)
      
      // Fetch client details, jobs data, and AI suggestions data
      const [clientData, jobsData, recurringJobsData, completionHistoryData] = await Promise.all([
        getClient(clientId),
        getJobsForClient(clientId, 50), // Get first 50 jobs for statistics
        getRecurringJobsForClient(clientId),
        getClientTaskCompletionHistory(clientId)
      ])
      
      if (clientData) {
        // Calculate comprehensive job statistics for this client
        const clientJobs = jobsData || []
        const recurringJobs = recurringJobsData || []
        
        // Separate one-time jobs from recurring job instances
        const oneTimeJobs = clientJobs.filter(job => !job.recurring_job_id)
        const recurringJobInstances = clientJobs.filter(job => job.recurring_job_id)
        
        const totalOneTimeJobs = oneTimeJobs.length
        const totalRecurringJobs = recurringJobs.length // This is the count of recurring job patterns, not instances
        const completedJobs = clientJobs.filter(job => job.status === 'completed').length
        const upcomingJobs = clientJobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length
        
        // Calculate completion rate
        const totalJobs = clientJobs.length
        const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
        
        // Calculate monthly revenue (current month only)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const thisMonthJobs = clientJobs.filter(job => {
          const jobDate = new Date(job.scheduled_date)
          return jobDate.getMonth() === currentMonth && 
                 jobDate.getFullYear() === currentYear &&
                 job.status === 'completed'
        })
        const revenuePerJob = 150 // This could be configurable or job-specific
        const monthlyRevenue = thisMonthJobs.length * revenuePerJob
        
        // Calculate average task completion from history
        const avgTaskCompletion = completionHistoryData.length > 0 
          ? Math.round(completionHistoryData.reduce((sum, history) => {
              const rate = history.total_tasks > 0 ? (history.completed_tasks / history.total_tasks) * 100 : 0
              return sum + rate
            }, 0) / completionHistoryData.length)
          : 0
        
        // Find last job date
        const sortedJobs = clientJobs.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
        const lastJobDate = sortedJobs.length > 0 ? sortedJobs[0].scheduled_date : null
        
        // Calculate days since last job
        const daysSinceLastJob = lastJobDate 
          ? Math.floor((new Date().getTime() - new Date(lastJobDate).getTime()) / (1000 * 60 * 60 * 24))
          : null
        
        const clientWithStats: ClientWithDetails = {
          ...clientData,
          totalJobs: totalOneTimeJobs, // Only count one-time jobs here
          completedJobs,
          totalRevenue: monthlyRevenue, // Monthly revenue instead of total
          upcomingJobs,
          totalRecurringJobs,
          completionRate,
          avgTaskCompletion,
          lastJobDate,
          daysSinceLastJob
        }
        
        setClient(clientWithStats)
        const initialFormData = {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address
        }
        setFormData(initialFormData)
        setOriginalFormData(initialFormData)

        // Set AI suggestions data
        setAiSuggestionsData({
          name: clientData.name,
          propertyType: clientData.property_type || 'residential',
          recurringJobs: recurringJobsData || [],
          completionHistory: completionHistoryData || []
        })
      } else {
        toast({
          title: "Error",
          description: "Client not found",
          variant: "destructive"
        })
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        clientId
      })
      
      let errorMessage = "Failed to load client details"
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = "Client not found"
        } else if (error.message.includes('Authentication error')) {
          errorMessage = "Authentication failed. Please log in again."
        } else if (error.message.includes('Database error')) {
          errorMessage = "Database connection error. Please try again."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Redirect to clients list if client not found
      if (error instanceof Error && error.message.includes('not found')) {
        router.push('/clients')
      }
    } finally {
      setLoading(false)
    }
  }, [toast, router])

  useEffect(() => {
    if (params.id) {
      fetchClientDetails(params.id as string)
    }
  }, [params.id, fetchClientDetails])

  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const handleSave = async () => {
    if (!client) return
    
    try {
      // TODO: Save client to Supabase
      setClient({ ...client, ...formData })
      setOriginalFormData({ ...formData })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Client updated successfully"
      })
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      })
    }
    setIsEditing(false)
  }

  const handleNavigation = (path: string) => {
    if (isEditing && hasUnsavedChanges()) {
      setPendingNavigation(path)
      setIsUnsavedChangesDialogOpen(true)
    } else {
      router.push(path)
    }
  }

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setIsUnsavedChangesDialogOpen(false)
    setPendingNavigation(null)
  }

  const handleCancelNavigation = () => {
    setIsUnsavedChangesDialogOpen(false)
    setPendingNavigation(null)
  }

  // Note Management Functions
  const handleAddNote = async () => {
    if (!client || !newNote.trim()) return
    
    try {
      // TODO: Add note to Supabase
      const newNoteObj: ClientNote = {
        id: `note-${Date.now()}`,
        client_id: client.id,
        content: newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setClient({ 
        ...client, 
        notes: [...(client.notes || []), newNoteObj] 
      })
      setNewNote("")
      toast({
        title: "Success",
        description: "Note added successfully"
      })
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      })
    }
  }

  const handleEditNote = async (note: ClientNote) => {
    setEditingNote(note)
  }

  const handleSaveNote = async () => {
    if (!client || !editingNote) return
    
    try {
      // TODO: Update note in Supabase
      const updatedNotes = client.notes?.map(note => 
        note.id === editingNote.id ? { ...editingNote, updated_at: new Date().toISOString() } : note
      )
      setClient({ ...client, notes: updatedNotes })
      setEditingNote(null)
      toast({
        title: "Success",
        description: "Note updated successfully"
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!client) return
    
    try {
      // TODO: Delete note from Supabase
      const updatedNotes = client.notes?.filter(note => note.id !== noteId)
      setClient({ ...client, notes: updatedNotes })
      toast({
        title: "Success",
        description: "Note deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!client) return
    
    try {
      // TODO: Delete client from Supabase
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
      router.push("/clients")
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  // Quick Actions
  const [isScheduleJobDialogOpen, setIsScheduleJobDialogOpen] = useState(false)
  const [isRecurringJob, setIsRecurringJob] = useState(false)
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    end_time: "",
    frequency: "weekly" as "daily" | "weekly" | "bi_weekly" | "monthly",
    start_date: "",
    end_date: ""
  })

  const handleScheduleJob = () => {
    setIsScheduleJobDialogOpen(true)
    // Reset form
    setJobFormData({
      title: "",
      description: "",
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: "09:00",
      end_time: "17:00",
      frequency: "weekly",
      start_date: new Date().toISOString().split('T')[0],
      end_date: ""
    })
    setIsRecurringJob(false)
  }

  const handleCreateJob = async () => {
    if (!client) return
    
    try {
      if (isRecurringJob) {
        // Create recurring job
        await createRecurringJob({
          client_id: client.id,
          title: jobFormData.title,
          description: jobFormData.description,
          frequency: jobFormData.frequency,
          start_date: jobFormData.start_date,
          end_date: jobFormData.end_date || null,
          scheduled_time: jobFormData.scheduled_time,
          is_active: true
        })
        toast({
          title: "Success",
          description: "Recurring job created successfully"
        })
      } else {
        // Create one-off job
        await createJob({
          client_id: client.id,
          title: jobFormData.title,
          description: jobFormData.description,
          scheduled_date: jobFormData.scheduled_date,
          scheduled_time: jobFormData.scheduled_time,
          end_time: jobFormData.end_time,
          status: "scheduled"
        })
        toast({
          title: "Success",
          description: "Job scheduled successfully"
        })
      }
      
      setIsScheduleJobDialogOpen(false)
      // Refresh data
      fetchClientDetails(client.id)
    } catch (error) {
      console.error('Error creating job:', error)
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      })
    }
  }

  const handleSendEmail = () => {
    if (!client) return
    const subject = encodeURIComponent(`Hello ${client.name}`)
    const body = encodeURIComponent(`Hi ${client.name},\n\nI hope this email finds you well.\n\nBest regards,\nYour Cleaning Service Team`)
    const mailtoUrl = `mailto:${client.email}?subject=${subject}&body=${body}`
    window.open(mailtoUrl)
  }

  const handleSendMessage = () => {
    if (!client) return
    const message = encodeURIComponent(`Hi ${client.name}, this is your cleaning service. How can we help you today?`)
    const smsUrl = `sms:${client.phone}?body=${message}`
    window.open(smsUrl)
  }

  const handleCallClient = () => {
    if (!client) return
    const phoneUrl = `tel:${client.phone}`
    window.open(phoneUrl)
  }


  const handleCreateReport = () => {
    const url = `/reports?client=${client?.id}&clientName=${encodeURIComponent(client?.name || '')}`
    window.open(url, '_blank')
  }

  const handleCopyInfo = () => {
    if (!client) return
    const clientInfo = `Name: ${client.name}\nEmail: ${client.email}\nPhone: ${client.phone}\nAddress: ${client.address}`
    navigator.clipboard.writeText(clientInfo)
    toast({
      title: "Copied!",
      description: "Client information copied to clipboard",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading client details...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Client Not Found</h2>
        <p className="text-slate-600 mb-6">The client you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/clients")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => handleNavigation("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? "Edit Client" : client.name}
            </h1>
            <p className="text-slate-600">Client Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Client</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this client? This action cannot be undone and will also delete all associated jobs and notes.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Client
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Jobs</p>
                <p className="text-2xl font-bold text-blue-900">{client.totalJobs || 0}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {client.totalRecurringJobs || 0} recurring patterns
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{client.completedJobs || 0}</p>
                <p className="text-xs text-green-700 mt-1">
                  {client.completionRate || 0}% completion rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue This Month</p>
                <p className="text-2xl font-bold text-purple-900">${(client.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-purple-700 mt-1">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Performance</p>
                <p className="text-2xl font-bold text-orange-900">{client.avgTaskCompletion || 0}%</p>
                <p className="text-xs text-orange-700 mt-1">
                  {client.daysSinceLastJob !== null 
                    ? `${client.daysSinceLastJob} days ago` 
                    : 'No jobs yet'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={isUnsavedChangesDialogOpen} onOpenChange={setIsUnsavedChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNavigation}>
              Stay and Edit
            </Button>
            <Button variant="destructive" onClick={handleConfirmNavigation}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              6 actions available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                Job Management
              </h3>
              <div className="space-y-2">
                <Button 
                  onClick={handleScheduleJob} 
                  className="w-full justify-start h-auto py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Clock className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Schedule Job</div>
                    <div className="text-xs opacity-90">Create a new job for this client</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Communication Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Communication
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleSendEmail} 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 border-green-200"
                >
                  <Mail className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Send Email</div>
                    <div className="text-xs text-gray-600">Email communication</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSendMessage} 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 border-green-200"
                >
                  <MessageSquare className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Send SMS</div>
                    <div className="text-xs text-gray-600">Text message</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCallClient} 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 border-green-200"
                >
                  <Phone className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Call Client</div>
                    <div className="text-xs text-gray-600">Voice call</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Reporting & Utilities */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Reporting & Tools
              </h3>
              <div className="space-y-2">
                <Button 
                  onClick={handleCreateReport} 
                  className="w-full justify-start h-auto py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Create Report</div>
                    <div className="text-xs opacity-90">Generate job report</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopyInfo} 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-gray-50 border-gray-200"
                >
                  <Copy className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Copy Info</div>
                    <div className="text-xs text-gray-600">Copy client details</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recurring Jobs */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Recurring Jobs</CardTitle>
              <CardDescription>
                Scheduled recurring jobs for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientRecurringJobsList clientId={client.id} />
            </CardContent>
          </Card>

          {/* Jobs List */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Jobs</CardTitle>
              <CardDescription>
                All job instances for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientJobsList clientId={client.id} />
            </CardContent>
          </Card>

          {/* Notes using unified JobNotes component */}
          <JobNotes 
            entityId={client.id} 
            entityTitle={client.name}
            context="client"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Location Map */}
          {client.address && (
            <GoogleMaps
              address={client.address}
              title={`${client.name}'s Location`}
              height="300px"
              showDirections={true}
            />
          )}

          {/* Sub-Contractor Assignment */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Sub-Contractor Assignment
              </CardTitle>
              <CardDescription>
                Assign preferred sub-contractors for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-6 text-slate-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No sub-contractors assigned</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sub-contractor management coming soon
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Sub-Contractor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Client Since</span>
                <span className="text-sm font-medium">{formatDate(client.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(client.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Notes</span>
                <span className="text-sm font-medium">{client.notes?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Task Suggestions */}
          {aiSuggestionsData && (
            <TaskSuggestions
              clientId={client.id}
              clientData={aiSuggestionsData}
              showGenerateButton={true}
              onTaskAdded={(task) => {
                // Handle task added - could refresh data or show success message
                toast({
                  title: "Task Added",
                  description: `"${task.title}" has been added to your task suggestions.`,
                })
              }}
            />
          )}

        </div>
      </div>

      {/* Schedule Job Dialog */}
      <Dialog open={isScheduleJobDialogOpen} onOpenChange={setIsScheduleJobDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Job for {client.name}</DialogTitle>
            <DialogDescription>
              Create a new job or recurring schedule for this client
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Job Type Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="recurring-toggle" 
                checked={isRecurringJob} 
                onCheckedChange={setIsRecurringJob} 
              />
              <Label htmlFor="recurring-toggle">
                {isRecurringJob ? 'Recurring Job' : 'One-time Job'}
              </Label>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="e.g., Weekly Cleaning, Deep Clean"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  placeholder="Describe the job requirements..."
                  required
                />
              </div>

              {isRecurringJob ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={jobFormData.frequency} onValueChange={(value: any) => setJobFormData({ ...jobFormData, frequency: value })}>
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
                    <div>
                      <Label htmlFor="scheduled_time">Time</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={jobFormData.scheduled_time}
                        onChange={(e) => setJobFormData({ ...jobFormData, scheduled_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={jobFormData.start_date}
                        onChange={(e) => setJobFormData({ ...jobFormData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={jobFormData.end_date}
                        onChange={(e) => setJobFormData({ ...jobFormData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">Date</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={jobFormData.scheduled_date}
                      onChange={(e) => setJobFormData({ ...jobFormData, scheduled_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time">Time</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={jobFormData.scheduled_time}
                      onChange={(e) => setJobFormData({ ...jobFormData, scheduled_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleJobDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateJob} disabled={!jobFormData.title || !jobFormData.description}>
              {isRecurringJob ? 'Create Recurring Job' : 'Schedule Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 