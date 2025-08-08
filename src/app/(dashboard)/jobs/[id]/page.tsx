"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Clock,
  RefreshCw, 
  User, 
  MapPin, 
  Calendar,
  Camera,
  Play,
  X,
  FileText,
  MessageSquare,
  AlertCircle,
  XCircle,
  Save,
  GripVertical,
  MoreHorizontal,
  Upload,
  Image,
  Download,
  Eye,
  Pencil,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { 
  getClients, 
  getJob, 
  updateJob, 
  deleteJob,
  deleteRecurringJob,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getPhotosForJob,
  uploadPhoto,
  deletePhoto,
  getPhotoUrl,
  addTaskToFutureInstances,
  getRecurringJobInstances
} from "@/lib/supabase-client"
import { GoogleMaps } from "@/components/ui/google-maps"
import { JobSubContractorAssignment } from "@/components/job-sub-contractor-assignment"
import { RecurringJobDeleteDialog } from "@/components/recurring-job-delete-dialog"
import { RecurringTaskDialog } from "@/components/recurring-task-dialog"
import { JobNotes } from "@/components/job-notes"
import type { Job, Client, Task, Note, Photo } from "@/types/database"

interface JobWithDetails extends Job {
  client?: Client
  tasks?: Task[]
  notes?: Note[]
  photos?: Photo[]
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [job, setJob] = useState<JobWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isRecurringTaskDialogOpen, setIsRecurringTaskDialogOpen] = useState(false)
  const [pendingTaskData, setPendingTaskData] = useState<{title: string, description: string} | null>(null)
  const [recurringJobInstances, setRecurringJobInstances] = useState<Job[]>([])
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(-1)
  const taskSectionRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    end_time: null as string | null,
    status: "scheduled" as Job['status'],
    client_id: "",
    recurring_job_id: null as string | null
  })
  const [originalFormData, setOriginalFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    end_time: null as string | null,
    status: "scheduled" as Job['status'],
    client_id: "",
    recurring_job_id: null as string | null
  })

  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      setLoading(true)
      const jobData = await getJob(jobId)
      if (jobData) {
        setJob(jobData)
        setFormData({
          title: jobData.title,
          description: jobData.description || "",
          scheduled_date: jobData.scheduled_date,
          scheduled_time: jobData.scheduled_time || "",
          end_time: jobData.end_time || null,
          status: jobData.status || "scheduled",
          client_id: jobData.client_id,
          recurring_job_id: jobData.recurring_job_id || null
        })
        setOriginalFormData({
          title: jobData.title,
          description: jobData.description || "",
          scheduled_date: jobData.scheduled_date,
          scheduled_time: jobData.scheduled_time || "",
          end_time: jobData.end_time || null,
          status: jobData.status || "scheduled",
          client_id: jobData.client_id,
          recurring_job_id: jobData.recurring_job_id || null
        })
      } else {
        toast({
          title: "Error",
          description: "Job not found",
          variant: "destructive"
        })
        router.push("/jobs")
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast, router])

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await getClients()
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }, [])

  const fetchRecurringJobInstances = useCallback(async (recurringJobId: string, currentJobId: string) => {
    try {
      const instances = await getRecurringJobInstances(recurringJobId)
      if (instances && instances.length > 0) {
        // Sort by scheduled date to ensure proper order
        const sortedInstances = instances.sort((a, b) => 
          new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        )
        setRecurringJobInstances(sortedInstances)
        
        // Find current job's position in the array
        const currentIndex = sortedInstances.findIndex(instance => instance.id === currentJobId)
        setCurrentInstanceIndex(currentIndex)
      }
    } catch (error) {
      console.error('Error fetching recurring job instances:', error)
    }
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchJobDetails(params.id as string)
      fetchClients()
    }
  }, [params.id, fetchJobDetails, fetchClients])

  // Fetch recurring job instances when job data is loaded
  useEffect(() => {
    if (job?.recurring_job_id && job.id) {
      fetchRecurringJobInstances(job.recurring_job_id, job.id)
    }
  }, [job?.recurring_job_id, job?.id, fetchRecurringJobInstances])

  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const handleSave = async () => {
    if (!job) return

    try {
      await updateJob(job.id, {
        title: formData.title,
        description: formData.description,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        end_time: formData.end_time,
        status: formData.status,
        client_id: formData.client_id
      })

      toast({
        title: "Success",
        description: "Job updated successfully"
      })

      setOriginalFormData(formData)
      setIsEditing(false)
      fetchJobDetails(job.id)
    } catch (error) {
      console.error('Error updating job:', error)
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setFormData(originalFormData)
    setIsEditing(false)
  }

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges()) {
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
  }

  const handleCancelNavigation = () => {
    setIsUnsavedChangesDialogOpen(false)
    setPendingNavigation(null)
  }

  const handleStatusChange = async (newStatus: Job['status']) => {
    if (!job) return

    try {
      await updateJob(job.id, { status: newStatus })
      toast({
        title: "Success",
        description: "Job status updated successfully"
      })
      fetchJobDetails(job.id)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      })
    }
  }

  const handleTaskToggle = async (taskId: string) => {
    if (!job) return

    try {
      const task = job.tasks?.find(t => t.id === taskId)
      if (task) {
              await updateTask(taskId, { is_completed: !task.is_completed })
      toast({
        title: "Success",
        description: `Task ${task.is_completed ? 'unmarked' : 'marked'} as complete`
      })
        fetchJobDetails(job.id)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const handleAddTask = async () => {
    if (!job || !newTask.title.trim()) return

    // If this is a recurring job instance, show the recurring task dialog
    if (job.recurring_job_id) {
      setPendingTaskData({ title: newTask.title, description: newTask.description })
      setIsRecurringTaskDialogOpen(true)
      return
    }

    // For non-recurring jobs, add task directly
    await addTaskDirectly(newTask.title, newTask.description)
  }

  const addTaskDirectly = async (title: string, description: string) => {
    if (!job) return

    try {
      // Calculate order_index for the new task (last position)
      const maxOrder = job.tasks?.length ? Math.max(...job.tasks.map(t => t.order_index || 0)) : 0
      
      await createTask({
        job_id: job.id,
        title: title,
        description: description,
        order_index: maxOrder + 1
      })

      toast({
        title: "Success",
        description: "Task added successfully"
      })

      setNewTask({ title: "", description: "" })
      
      // Refresh job details and then scroll to tasks section
      await fetchJobDetails(job.id)
      
      // Use a small delay to ensure the DOM has updated after the fetch
      setTimeout(() => {
        if (taskSectionRef.current) {
          taskSectionRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100)
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      })
    }
  }

  const handleAddToRecurring = async (frequency: string, customWeeks?: number) => {
    if (!job || !pendingTaskData || !job.recurring_job_id) return

    try {
      // First add the task to the current job instance
      await addTaskDirectly(pendingTaskData.title, pendingTaskData.description)

      // Then add to future instances based on frequency
      const result = await addTaskToFutureInstances(
        job.recurring_job_id,
        pendingTaskData.title,
        pendingTaskData.description,
        frequency as any,
        customWeeks
      )

      toast({
        title: "Task Added to Recurring Job",
        description: `Added "${pendingTaskData.title}" to ${result.tasksAdded} future job instances.`,
        duration: 4000
      })
    } catch (error) {
      console.error('Error adding task to recurring job:', error)
      toast({
        title: "Error",
        description: "Failed to add task to future instances",
        variant: "destructive"
      })
    } finally {
      setPendingTaskData(null)
      setIsRecurringTaskDialogOpen(false)
    }
  }

  const handleAddOnceOnly = async () => {
    if (!pendingTaskData) return

    try {
      await addTaskDirectly(pendingTaskData.title, pendingTaskData.description)
      
      toast({
        title: "Task Added",
        description: "Task added to this job instance only",
        duration: 3000
      })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      })
    } finally {
      setPendingTaskData(null)
      setIsRecurringTaskDialogOpen(false)
    }
  }

  const handleEditTask = async (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = async () => {
    if (!editingTask) return

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description
      })

      toast({
        title: "Success",
        description: "Task updated successfully"
      })

      setEditingTask(null)
      if (job) {
        fetchJobDetails(job.id)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!job) return

    try {
      await deleteTask(taskId)
      toast({
        title: "Success",
        description: "Task deleted successfully"
      })
      fetchJobDetails(job.id)
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      })
    }
  }


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUploadPhotos = async () => {
    if (!job || selectedFiles.length === 0) return

    try {
      setUploadingPhotos(true)
      
      for (const file of selectedFiles) {
        await uploadPhoto(job.id, file)
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} photo(s) uploaded successfully`
      })

      setSelectedFiles([])
      fetchJobDetails(job.id)
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive"
      })
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!job) return

    try {
      await deletePhoto(photoId)
      toast({
        title: "Success",
        description: "Photo deleted successfully"
      })
      fetchJobDetails(job.id)
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (deleteType: 'single' | 'all' | 'future') => {
    if (!job) return
    
    try {
      if (job.recurring_job_id) {
        // Use recurring job deletion logic
        await deleteRecurringJob(job.id, deleteType)
      } else {
        // Use simple job deletion for non-recurring jobs
        await deleteJob(job.id)
      }
      
      const messages = {
        single: "Job instance deleted successfully",
        future: "Job and future instances deleted successfully", 
        all: "All recurring job instances deleted successfully"
      }
      
      toast({
        title: "Success",
        description: job.recurring_job_id ? messages[deleteType] : "Job deleted successfully"
      })
      router.push("/jobs")
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      })
    }
  }

  const handleJobUpdate = () => {
    // Refresh job data when timer updates
    if (job) {
      fetchJobDetails(job.id)
    }
  }

  const navigateToRecurringInstance = (direction: 'prev' | 'next') => {
    if (recurringJobInstances.length === 0 || currentInstanceIndex === -1) return
    
    let targetIndex = -1
    if (direction === 'prev' && currentInstanceIndex > 0) {
      targetIndex = currentInstanceIndex - 1
    } else if (direction === 'next' && currentInstanceIndex < recurringJobInstances.length - 1) {
      targetIndex = currentInstanceIndex + 1
    }
    
    if (targetIndex >= 0) {
      const targetJob = recurringJobInstances[targetIndex]
      if (hasUnsavedChanges()) {
        setPendingNavigation(`/jobs/${targetJob.id}`)
        setIsUnsavedChangesDialogOpen(true)
      } else {
        router.push(`/jobs/${targetJob.id}`)
      }
    }
  }

  const getPreviousInstance = () => {
    if (currentInstanceIndex > 0) {
      return recurringJobInstances[currentInstanceIndex - 1]
    }
    return null
  }

  const getNextInstance = () => {
    if (currentInstanceIndex >= 0 && currentInstanceIndex < recurringJobInstances.length - 1) {
      return recurringJobInstances[currentInstanceIndex + 1]
    }
    return null
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

  const openLightbox = (photoIndex: number) => {
    setCurrentPhotoIndex(photoIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextPhoto = () => {
    if (job?.photos && currentPhotoIndex < job.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!lightboxOpen) return
    
    if (e.key === 'Escape') {
      closeLightbox()
    } else if (e.key === 'ArrowRight') {
      nextPhoto()
    } else if (e.key === 'ArrowLeft') {
      prevPhoto()
    }
  }

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [lightboxOpen, currentPhotoIndex])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'in_progress':
        return <Play className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/jobs")} className="bg-gray-900 hover:bg-gray-800 text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => handleNavigation("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Job" : job.title}
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">Job Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
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
                Edit Job
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Recurring Job Navigation */}
      {job?.recurring_job_id && recurringJobInstances.length > 1 && currentInstanceIndex >= 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Recurring Job Instance Navigation</h3>
                  <p className="text-sm text-blue-700">
                    Instance {currentInstanceIndex + 1} of {recurringJobInstances.length}
                    {job && ` • ${formatDate(job.scheduled_date)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToRecurringInstance('prev')}
                  disabled={!getPreviousInstance()}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  title={getPreviousInstance() ? `Previous: ${formatDate(getPreviousInstance()!.scheduled_date)}` : 'No previous instance'}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white rounded-md border border-blue-200">
                  <span className="text-sm text-blue-600 font-medium">
                    {currentInstanceIndex + 1} / {recurringJobInstances.length}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToRecurringInstance('next')}
                  disabled={!getNextInstance()}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  title={getNextInstance() ? `Next: ${formatDate(getNextInstance()!.scheduled_date)}` : 'No next instance'}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* Instance preview info */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {getPreviousInstance() && (
                  <div className="text-blue-600">
                    <span className="font-medium">← Previous: </span>
                    {formatDate(getPreviousInstance()!.scheduled_date)}
                  </div>
                )}
                <div className="text-blue-800 font-medium text-center">
                  <span className="bg-blue-100 px-2 py-1 rounded">Current</span>
                </div>
                {getNextInstance() && (
                  <div className="text-blue-600 text-right">
                    <span className="font-medium">Next: </span>
                    {formatDate(getNextInstance()!.scheduled_date)} →
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Mobile Quick Status Change */}
      {!isEditing && (
        <div className="lg:hidden bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Quick Status Change</span>
            <Badge className={getStatusColor(job.status)}>
              {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {job.status === 'scheduled' && (
              <Button
                onClick={() => handleStatusChange('in_progress')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Start Job
              </Button>
            )}
            {job.status === 'in_progress' && (
              <Button
                onClick={() => handleStatusChange('completed')}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            {(job.status === 'scheduled' || job.status === 'in_progress') && (
              <Button
                onClick={() => handleStatusChange('cancelled')}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Job Information
                {job?.recurring_job_id && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Recurring Instance
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_date">Scheduled Date</Label>
                      <Input
                        id="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduled_time">Start Time</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="end_time">End Time (Optional)</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time || ''}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value || null })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_id">Client</Label>
                      <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                        <SelectTrigger className="mt-1">
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
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Job['status'] })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600 mt-1">{job.description || "No description provided"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Scheduled Date</h3>
                      <p className="text-gray-600 mt-1">{formatDate(job.scheduled_date)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Scheduled Time</h3>
                      <p className="text-gray-600 mt-1">
                        {formatTime(job.scheduled_time)}
                        {job.end_time && ` - ${formatTime(job.end_time)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Client</h3>
                      <p className="text-gray-600 mt-1">{job.client?.name || "Unknown Client"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Status</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {job && job.status && getStatusIcon(job.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job && job.status ? getStatusColor(job.status) : 'bg-gray-100 text-gray-800'}`}>
                          {job && job.status ? job.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="crm-card" ref={taskSectionRef}>
            <CardHeader>
              <CardTitle className="text-gray-900">Tasks</CardTitle>
              <CardDescription>
                Manage job tasks and checklists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {job.tasks?.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleTaskToggle(task.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      {editingTask?.id === task.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="text-sm"
                          />
                          <Textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleSaveTask} className="bg-green-600 hover:bg-green-700 text-white">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingTask(null)}>
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                                                  <h4 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-sm ${task.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                        </>
                      )}
                    </div>
                    {editingTask?.id !== task.id && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-700 h-6 px-2"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 h-6 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!isEditing && (
                <div className="space-y-2">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="mt-1"
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                  <Button onClick={handleAddTask} disabled={!newTask.title.trim()} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unified Notes System */}
          <JobNotes 
            entityId={job.recurring_job_id || job.id}
            entityTitle={job.title}
            context={job.recurring_job_id ? "recurring_job" : "job"}
          />

          {/* Photos */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Photos</CardTitle>
              <CardDescription>
                Upload and manage job photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Section */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload job photos</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="outline" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Select Photos
                      </span>
                    </Button>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected files:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{file.name}</span>
                          <span className="text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        onClick={handleUploadPhotos} 
                        disabled={uploadingPhotos}
                        size="sm"
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {uploadingPhotos ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Upload Photos
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Grid */}
              {job.photos && job.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={getPhotoUrl(photo.file_path)}
                          alt={`Job photo ${photo.file_name}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              openLightbox(index)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              const link = document.createElement('a');
                              link.href = getPhotoUrl(photo.file_path);
                              link.download = photo.file_name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePhoto(photo.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 truncate">{photo.file_name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(photo.file_size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Status */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                {job && job.status && getStatusIcon(job.status)}
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <Badge className={job && job.status ? getStatusColor(job.status) : 'bg-gray-100 text-gray-800'}>
                    {job && job.status ? job.status.replace('_', ' ') : 'Unknown'}
                  </Badge>
                </div>
              </div>
              
              {!isEditing && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('scheduled')}
                    disabled={job?.status === 'scheduled'}
                    className={`w-full ${job?.status === 'scheduled' ? 'bg-blue-50 border-blue-500' : ''}`}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Scheduled
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={job?.status === 'in_progress'}
                    className={`w-full ${job?.status === 'in_progress' ? 'bg-yellow-50 border-yellow-500' : ''}`}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                    disabled={job?.status === 'completed'}
                    className={`w-full ${job?.status === 'completed' ? 'bg-green-50 border-green-500' : ''}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={job?.status === 'cancelled'}
                    className={`w-full ${job?.status === 'cancelled' ? 'bg-red-50 border-red-500' : ''}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelled
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Feedback Request
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sub-Contractor Assignment */}
          <JobSubContractorAssignment jobId={job.id} />

          {/* Job Location Map */}
          {job.client?.address && (
            <GoogleMaps
              address={job.client.address}
              title={`${job.client.name}'s Location`}
              height="300px"
              showDirections={true}
            />
          )}

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && job?.photos && job.photos.length > 0 && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={closeLightbox}
          />
          
          {/* Lightbox content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-60 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation arrows */}
            {currentPhotoIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-60 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}
            
            {currentPhotoIndex < job.photos.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-60 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* Image container with better sizing */}
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
              <img
                src={getPhotoUrl(job.photos[currentPhotoIndex].file_path)}
                alt={`Job photo ${job.photos[currentPhotoIndex].file_name}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Photo info bar with elegant styling */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20">
              <div className="flex items-center space-x-3 text-sm font-medium">
                <span className="text-white/90">
                  {currentPhotoIndex + 1} of {job.photos.length}
                </span>
                <span className="text-white/50">•</span>
                <span className="text-white/80 truncate max-w-48">
                  {job.photos[currentPhotoIndex].file_name}
                </span>
                <span className="text-white/50">•</span>
                <span className="text-white/70">
                  {formatFileSize(job.photos[currentPhotoIndex].file_size)}
                </span>
              </div>
            </div>

            {/* Action buttons with elegant styling */}
            <div className="absolute top-6 left-6 flex space-x-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = getPhotoUrl(job.photos[currentPhotoIndex].file_path);
                  link.download = job.photos[currentPhotoIndex].file_name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-500/20 backdrop-blur-md border-red-500/30 text-red-100 hover:bg-red-500/30 hover:text-white transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(job.photos[currentPhotoIndex].id);
                  if (job.photos.length === 1) {
                    closeLightbox();
                  } else if (currentPhotoIndex === job.photos.length - 1) {
                    setCurrentPhotoIndex(currentPhotoIndex - 1);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Recurring Job Delete Dialog */}
      <RecurringJobDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        jobTitle={job?.title || ''}
        isRecurring={!!job?.recurring_job_id}
      />

      {/* Recurring Task Dialog */}
      {pendingTaskData && job?.recurring_job_id && (
        <RecurringTaskDialog
          open={isRecurringTaskDialogOpen}
          onOpenChange={setIsRecurringTaskDialogOpen}
          taskTitle={pendingTaskData.title}
          jobTitle={job.title}
          onAddToRecurring={handleAddToRecurring}
          onAddOnceOnly={handleAddOnceOnly}
        />
      )}
    </div>
  )
}