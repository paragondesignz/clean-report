"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle, 
  Circle, 
  Camera, 
  Upload, 
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  StickyNote,
  Trash2,
  Save,
  LogOut,
  ArrowLeft,
  Plus,
  FileText,
  Loader2
} from "lucide-react"
import { getPhotoUrl } from "@/lib/supabase-client"
import { formatTime, formatDate } from "@/lib/utils"
import { GoogleMaps } from "@/components/ui/google-maps"
import type { Job, Task, Note, Photo, Client } from "@/types/database"

interface JobWithDetails extends Job {
  client: Client
  tasks: Task[]
  notes: Note[]
  photos: Photo[]
}

export default function MobileJobPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [job, setJob] = useState<JobWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savingProgress, setSavingProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const jobId = params.id as string

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      
      // Use mobile API endpoint instead of Supabase client
      const response = await fetch(`/api/mobile-jobs/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job')
      }
      
      const jobData = await response.json()
      if (jobData) {
        setJob(jobData as JobWithDetails)
        // Initialize completed tasks state
        const completed = jobData.tasks?.filter((task: any) => task.is_completed).map((task: any) => task.id) || []
        setCompletedTasks(completed)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      // Use mobile API endpoint instead of Supabase client
      const response = await fetch(`/api/mobile-jobs/${jobId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: completed })
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }
      
      if (completed) {
        setCompletedTasks(prev => [...prev, taskId])
      } else {
        setCompletedTasks(prev => prev.filter(id => id !== taskId))
      }

      toast({
        title: completed ? "Task completed" : "Task marked incomplete",
        description: "Progress saved",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !job) return

    try {
      // Use mobile API endpoint instead of Supabase client
      const response = await fetch(`/api/mobile-jobs/${job.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      setNewNote("")
      await fetchJobDetails() // Refresh to show new note
      
      toast({
        title: "Note added",
        description: "Your note has been saved"
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

  const handlePhotoUpload = async (files: FileList | null, isCamera: boolean = false) => {
    if (!files || files.length === 0 || !job) return

    setUploadingPhoto(true)
    
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          // Use mobile API endpoint for photo upload
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch(`/api/mobile-jobs/${job.id}/photos`, {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to upload photo')
          }
        }
      }
      
      await fetchJobDetails() // Refresh to show new photos
      
      toast({
        title: isCamera ? "Photo captured" : "Photos uploaded",
        description: "Photos have been saved to the job"
      })
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive"
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleJobComplete = async () => {
    if (!job) return

    try {
      setSavingProgress(true)
      
      // Use mobile API endpoint instead of Supabase client
      const response = await fetch(`/api/mobile-jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      })

      if (!response.ok) {
        throw new Error('Failed to complete job')
      }
      
      toast({
        title: "Job completed!",
        description: "Great work! The job has been marked as complete."
      })
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/mobile-jobs')
      }, 2000)
    } catch (error) {
      console.error('Error completing job:', error)
      toast({
        title: "Error",
        description: "Failed to complete job",
        variant: "destructive"
      })
    } finally {
      setSavingProgress(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompletionProgress = () => {
    if (!job?.tasks || job.tasks.length === 0) return 0
    return Math.round((completedTasks.length / job.tasks.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const progress = getCompletionProgress()
  const isCompleted = job.status === 'completed'

  return (
    <div className={`min-h-screen ${
      isCompleted ? 'bg-green-50/30' : 'bg-muted/30'
    }`}>
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-card shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-semibold text-lg truncate max-w-[200px] ${
                  isCompleted ? 'text-green-800' : ''
                }`}>{job.title}</h1>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{job.client?.name}</p>
            </div>
          </div>
          <Badge 
            className={`${getStatusColor(job.status)} ${
              isCompleted ? 'bg-green-100 text-green-800 border-green-300' : ''
            }`} 
            variant="outline"
          >
            {isCompleted ? '✓ COMPLETED' : job.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-medium ${
              isCompleted ? 'text-green-600' : 'text-primary'
            }`}>{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isCompleted && (
            <div className="text-xs text-green-700 mt-2 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Job completed successfully!
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-48">
        {/* Job Info Card */}
        <Card className="crm-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate">{job.client?.address}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              {job.client?.phone}
            </div>
            {job.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-foreground/80">{job.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Location Map */}
        {job.client?.address && (
          <GoogleMaps
            address={job.client.address}
            title={`${job.client.name}'s Location`}
            height="250px"
            showDirections={true}
          />
        )}

        {/* Tasks */}
        <Card className="crm-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Tasks ({completedTasks.length}/{job.tasks?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {job.tasks && job.tasks.length > 0 ? (
              job.tasks.map((task) => {
                const isCompleted = completedTasks.includes(task.id)
                return (
                  <div 
                    key={task.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-background border-border hover:bg-accent/50'
                    }`}
                    onClick={() => toggleTask(task.id, !isCompleted)}
                  >
                    <button className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={`text-sm mt-1 ${isCompleted ? 'line-through text-muted-foreground/70' : 'text-muted-foreground'}`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">No tasks assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="crm-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Camera className="w-5 h-5 mr-2 text-primary" />
              Photos ({job.photos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => cameraInputRef.current?.click()}
                size="sm"
                disabled={uploadingPhoto}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={uploadingPhoto}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoUpload(e.target.files, true)}
              className="hidden"
            />

            {uploadingPhoto && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Uploading photos...</span>
              </div>
            )}

            {job.photos && job.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {job.photos.map((photo, index) => (
                  <div key={photo.id} className="relative aspect-square">
                    <img
                      src={getPhotoUrl(photo.file_path)}
                      alt={`Job photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="crm-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <StickyNote className="w-5 h-5 mr-2 text-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Add a note about this job..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full resize-none text-base"
                rows={3}
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
              <Button 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            {job.notes && job.notes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Previous Notes</h4>
                <div className="space-y-3">
                  {job.notes
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((note) => (
                      <div key={note.id} className="bg-muted/50 p-4 rounded-lg border">
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-3 pb-6 space-y-2">
        {job.status !== 'completed' && (
          <Button 
            onClick={handleJobComplete}
            disabled={savingProgress || progress < 100}
            className="w-full h-10 text-sm font-medium"
          >
            {savingProgress ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Completing Job...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Job
              </>
            )}
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/mobile-jobs')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            All Jobs
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/')}
            className="flex-1"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  )
}