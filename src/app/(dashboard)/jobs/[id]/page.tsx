"use client"

import { useState, useEffect } from "react"
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
  User, 
  MapPin, 
  Calendar,
  Camera,
  FileText,
  MessageSquare,
  AlertCircle,
  XCircle,
  Play,
  Save,
  X,
  GripVertical,
  MoreHorizontal,
  Upload,
  Image,
  Download,
  Eye,
  Pencil,
  Star,
  StarOff
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { getClients, getJob } from "@/lib/supabase-client"
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
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    status: "scheduled" as Job['status'],
    client_id: ""
  })
  const [originalFormData, setOriginalFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    status: "scheduled" as Job['status'],
    client_id: ""
  })

  useEffect(() => {
    if (params.id) {
      fetchJobDetails(params.id as string)
      fetchClients()
    }
  }, [params.id])

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true)
      // Fetch job details from Supabase
      const jobData = await getJob(jobId)
      if (jobData) {
        setJob(jobData)
        const initialFormData = {
          title: jobData.title,
          description: jobData.description,
          scheduled_date: jobData.scheduled_date,
          scheduled_time: jobData.scheduled_time,
          status: jobData.status,
          client_id: jobData.client_id
        }
        setFormData(initialFormData)
        setOriginalFormData(initialFormData)
      } else {
        toast({
          title: "Error",
          description: "Job not found",
          variant: "destructive"
        })
        router.push('/jobs')
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
  }

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      })
    }
  }

  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const handleSave = async () => {
    if (!job) return
    
    try {
      // TODO: Save job to Supabase
      setJob({ ...job, ...formData })
      setOriginalFormData({ ...formData })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Job updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        status: job.status,
        client_id: job.client_id
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

  const handleStatusChange = async (newStatus: Job['status']) => {
    if (!job) return
    
    try {
      // TODO: Update job status in Supabase
      setJob({ ...job, status: newStatus })
      setFormData({ ...formData, status: newStatus })
      toast({
        title: "Success",
        description: `Job status updated to ${newStatus.replace('_', ' ')}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      })
    }
  }

  // Task Management Functions
  const handleTaskToggle = async (taskId: string) => {
    if (!job) return
    
    try {
      // TODO: Update task completion in Supabase
      const updatedTasks = job.tasks?.map(task => 
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      )
      setJob({ ...job, tasks: updatedTasks })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const handleAddTask = async () => {
    if (!job || !newTask.title.trim()) return
    
    try {
      // TODO: Add task to Supabase
      const newTaskObj: Task = {
        id: `task-${Date.now()}`,
        job_id: job.id,
        title: newTask.title,
        description: newTask.description,
        is_completed: false,
        order_index: (job.tasks?.length || 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setJob({ 
        ...job, 
        tasks: [...(job.tasks || []), newTaskObj] 
      })
      setNewTask({ title: "", description: "" })
      toast({
        title: "Success",
        description: "Task added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      })
    }
  }

  const handleEditTask = async (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = async () => {
    if (!job || !editingTask) return
    
    try {
      // TODO: Update task in Supabase
      const updatedTasks = job.tasks?.map(task => 
        task.id === editingTask.id ? { ...editingTask, updated_at: new Date().toISOString() } : task
      )
      setJob({ ...job, tasks: updatedTasks })
      setEditingTask(null)
      toast({
        title: "Success",
        description: "Task updated successfully"
      })
    } catch (error) {
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
      // TODO: Delete task from Supabase
      const updatedTasks = job.tasks?.filter(task => task.id !== taskId)
      setJob({ ...job, tasks: updatedTasks })
      toast({
        title: "Success",
        description: "Task deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      })
    }
  }

  // Note Management Functions
  const handleAddNote = async () => {
    if (!job || !newNote.trim()) return
    
    try {
      // TODO: Add note to Supabase
      const newNoteObj: Note = {
        id: `note-${Date.now()}`,
        job_id: job.id,
        content: newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setJob({ 
        ...job, 
        notes: [...(job.notes || []), newNoteObj] 
      })
      setNewNote("")
      toast({
        title: "Success",
        description: "Note added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      })
    }
  }

  const handleEditNote = async (note: Note) => {
    setEditingNote(note)
  }

  const handleSaveNote = async () => {
    if (!job || !editingNote) return
    
    try {
      // TODO: Update note in Supabase
      const updatedNotes = job.notes?.map(note => 
        note.id === editingNote.id ? { ...editingNote, updated_at: new Date().toISOString() } : note
      )
      setJob({ ...job, notes: updatedNotes })
      setEditingNote(null)
      toast({
        title: "Success",
        description: "Note updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!job) return
    
    try {
      // TODO: Delete note from Supabase
      const updatedNotes = job.notes?.filter(note => note.id !== noteId)
      setJob({ ...job, notes: updatedNotes })
      toast({
        title: "Success",
        description: "Note deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  // Photo Management Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUploadPhotos = async () => {
    if (!job || selectedFiles.length === 0) return
    
    try {
      setUploadingPhotos(true)
      // TODO: Upload photos to Supabase storage
      const newPhotos: Photo[] = selectedFiles.map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        task_id: job.tasks?.[0]?.id || "",
        file_path: `/api/photos/${file.name}`,
        file_name: file.name,
        file_size: file.size,
        created_at: new Date().toISOString()
      }))
      
      setJob({ 
        ...job, 
        photos: [...(job.photos || []), ...newPhotos] 
      })
      setSelectedFiles([])
      toast({
        title: "Success",
        description: `${selectedFiles.length} photo(s) uploaded successfully`
      })
    } catch (error) {
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
      // TODO: Delete photo from Supabase storage
      const updatedPhotos = job.photos?.filter(photo => photo.id !== photoId)
      setJob({ ...job, photos: updatedPhotos })
      toast({
        title: "Success",
        description: "Photo deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!job) return
    
    try {
      // TODO: Delete job from Supabase
      toast({
        title: "Success",
        description: "Job deleted successfully"
      })
      router.push("/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      })
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h2>
        <p className="text-slate-600 mb-6">The job you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => handleNavigation("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? "Edit Job" : job.title}
            </h1>
            <p className="text-slate-600">Job Details</p>
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
                Edit Job
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
                    <DialogTitle>Delete Job</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this job? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Job
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Job Information</CardTitle>
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
                      <Label htmlFor="scheduled_time">Scheduled Time</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="client_id">Client</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Job['status'] })}
                    >
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
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-slate-600">{job.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Scheduled Date</h4>
                      <p className="text-slate-600">{formatDate(job.scheduled_date)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Scheduled Time</h4>
                      <p className="text-slate-600">{formatTime(job.scheduled_time)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-500" />
                <span>{job.client?.name}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                <span>{job.client?.address}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                <span>{job.client?.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Tasks</CardTitle>
              <CardDescription>
                Track the progress of individual cleaning tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.tasks?.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskToggle(task.id)}
                      className={task.is_completed ? "text-green-600" : "text-slate-400"}
                    >
                      {task.is_completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-slate-300 rounded" />
                      )}
                    </Button>
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
                            <Button size="sm" onClick={handleSaveTask}>
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
                          <h4 className={`font-medium ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                          <p className={`text-sm ${task.is_completed ? 'text-slate-400' : 'text-slate-600'}`}>
                            {task.description}
                          </p>
                        </>
                      )}
                    </div>
                    {!editingTask && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="new-task-title">Task Title</Label>
                        <Input
                          id="new-task-title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Enter task title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-task-description">Task Description</Label>
                        <Textarea
                          id="new-task-description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Enter task description"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Notes</CardTitle>
              <CardDescription>
                Add notes and observations about the job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {job.notes?.slice().reverse().map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveNote}>
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-700">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                              className="text-blue-600 hover:text-blue-700 h-6 px-2"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Photos</CardTitle>
              <CardDescription>
                Upload and manage job photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Section */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Upload job photos</p>
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
                          <span className="text-slate-600">{file.name}</span>
                          <span className="text-slate-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        onClick={handleUploadPhotos} 
                        disabled={uploadingPhotos}
                        size="sm"
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
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-slate-600 truncate">{photo.file_name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(photo.file_size)}</p>
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
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(job.status)}
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              {!isEditing && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('scheduled')}
                    disabled={job.status === 'scheduled'}
                    className="w-full"
                  >
                    Scheduled
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={job.status === 'in_progress'}
                    className="w-full"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                    disabled={job.status === 'completed'}
                    className="w-full"
                  >
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={job.status === 'cancelled'}
                    className="w-full"
                  >
                    Cancelled
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Feedback Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 