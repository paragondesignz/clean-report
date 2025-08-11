"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Phone,
  Mail,
  Navigation,
  Upload,
  Plus,
  Edit,
  Save,
  X,
  Image,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { GoogleMaps } from "@/components/ui/google-maps"

interface JobDetail {
  id: string
  title: string
  client_name: string
  client_address: string
  client_phone: string
  client_email: string
  scheduled_date: string
  scheduled_time: string
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed'
  estimated_duration: number
  actual_duration?: number
  description: string
  tasks: JobTask[]
  photos: JobPhoto[]
  admin_contact: {
    name: string
    phone: string
    email: string
  }
}

interface JobTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'low' | 'medium' | 'high'
  estimated_time: number
  actual_time?: number
  notes: string
  sub_contractor_notes: string
}

interface JobPhoto {
  id: string
  photo_url: string
  photo_type: 'before' | 'after' | 'general' | 'task_specific'
  description: string
  task_id?: string
  uploaded_at: string
}


function SubContractorJobDetailClient({ jobId }: { jobId: string }) {
  const { toast } = useToast()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<JobTask | null>(null)
  const [photoDescription, setPhotoDescription] = useState('')
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'general' | 'task_specific'>('general')
  const [taskNotes, setTaskNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Simulate loading job details
    setTimeout(() => {
      const mockJob: JobDetail = {
        id: jobId,
        title: 'Deep Clean - Johnson Residence',
        client_name: 'Sarah Johnson',
        client_address: '123 Oak Street, Downtown, CA 90210',
        client_phone: '(555) 123-4567',
        client_email: 'sarah.johnson@email.com',
        scheduled_date: '2024-01-15',
        scheduled_time: '09:00',
        status: 'in_progress',
        estimated_duration: 3,
        actual_duration: 1.5,
        description: 'Complete deep cleaning of 3-bedroom house including kitchen, bathrooms, and living areas.',
        tasks: [
          { 
            id: '1', 
            title: 'Kitchen Deep Clean', 
            description: 'Clean all surfaces, appliances, and cabinets', 
            status: 'completed', 
            priority: 'high', 
            estimated_time: 60,
            actual_time: 45,
            notes: 'Kitchen was in good condition, standard cleaning completed',
            sub_contractor_notes: 'Used eco-friendly cleaner as requested'
          },
          { 
            id: '2', 
            title: 'Bathroom Sanitization', 
            description: 'Clean and sanitize all bathrooms', 
            status: 'in_progress', 
            priority: 'high', 
            estimated_time: 45,
            notes: 'Focus on shower and toilet areas',
            sub_contractor_notes: 'Found mold in shower, needs special treatment'
          },
          { 
            id: '3', 
            title: 'Living Room Dusting', 
            description: 'Dust all surfaces and vacuum', 
            status: 'pending', 
            priority: 'medium', 
            estimated_time: 30,
            notes: 'Include furniture and electronics',
            sub_contractor_notes: ''
          },
          { 
            id: '4', 
            title: 'Bedroom Cleaning', 
            description: 'Clean all bedrooms and make beds', 
            status: 'pending', 
            priority: 'medium', 
            estimated_time: 45,
            notes: 'Change linens if provided',
            sub_contractor_notes: ''
          }
        ],
        photos: [
          {
            id: '1',
            photo_url: '/api/placeholder/300/200',
            photo_type: 'before',
            description: 'Kitchen before cleaning',
            uploaded_at: '2024-01-15T09:00:00Z'
          },
          {
            id: '2',
            photo_url: '/api/placeholder/300/200',
            photo_type: 'after',
            description: 'Kitchen after cleaning',
            uploaded_at: '2024-01-15T09:45:00Z'
          }
        ],
        admin_contact: {
          name: 'Mike Admin',
          phone: '(555) 987-6543',
          email: 'mike@cleanreport.com'
        }
      }
      setJob(mockJob)
      setLoading(false)
    }, 1000)
  }, [jobId])



  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In real app, upload to storage and save to database
      toast({
        title: "Photo Uploaded",
        description: "Photo has been uploaded successfully",
      })
      setShowPhotoDialog(false)
      setPhotoDescription('')
    }
  }

  const updateTaskStatus = (taskId: string, status: JobTask['status']) => {
    if (!job) return
    
    setJob(prev => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      }
    })

    toast({
      title: "Task Updated",
      description: `Task status updated to ${status}`,
    })
  }

  const updateTaskNotes = (taskId: string, notes: string) => {
    if (!job) return
    
    setJob(prev => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId ? { ...task, sub_contractor_notes: notes } : task
        )
      }
    })

    toast({
      title: "Notes Saved",
      description: "Task notes have been updated",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'skipped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Job not found</h2>
        <p className="text-gray-600">The job you're looking for doesn't exist.</p>
        <Link href="/sub-contractor/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/sub-contractor/dashboard">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
            <Badge className={job?.status ? getStatusColor(job.status) : 'bg-gray-100 text-gray-800'}>
              {job?.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">{job.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              const address = encodeURIComponent(job.client_address)
              window.open(`https://maps.google.com/?q=${address}`, '_blank')
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
          <Button
            onClick={() => {
              window.open(`tel:${job.admin_contact.phone}`, '_self')
            }}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Complete tasks and add notes as you work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="text-xs text-gray-500">
                          Estimated: {task.estimated_time}min
                          {task.actual_time && ` | Actual: ${task.actual_time}min`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTask(task)
                            setTaskNotes(task.sub_contractor_notes)
                            setShowTaskDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-1">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'skipped')}
                            >
                              Skip
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {task.sub_contractor_notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-900 mb-1">Your Notes:</div>
                        <div className="text-sm text-blue-800">{task.sub_contractor_notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Photos</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowPhotoDialog(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {job.photos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No photos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.description}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-2">
                          <div className="text-sm font-medium">{photo.description}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {photo.photo_type}
                          </Badge>
                        </div>
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
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{job.client_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{job.client_address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{job.client_phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{job.client_email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{job.admin_contact.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{job.admin_contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{job.admin_contact.email}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  window.open(`tel:${job.admin_contact.phone}`, '_self')
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Admin
              </Button>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {new Date(job.scheduled_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {new Date(`2000-01-01T${job.scheduled_time}`).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {job.estimated_duration} hours estimated
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Job Location Map */}
          {job.client_address && (
            <GoogleMaps
              address={job.client_address}
              title={`${job.client_name}'s Location`}
              height="300px"
              showDirections={true}
            />
          )}
        </div>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              Add a photo to document your work
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Photo Type</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value as any)}
              >
                <option value="general">General</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="task_specific">Task Specific</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what this photo shows..."
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
              />
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Photo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Notes Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task Notes</DialogTitle>
            <DialogDescription>
              Add notes about this task for the admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTask && (
              <div>
                <h3 className="font-medium mb-2">{selectedTask.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedTask.description}</p>
                <label className="text-sm font-medium">Your Notes</label>
                <Textarea
                  placeholder="Add notes about this task..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTask) {
                  updateTaskNotes(selectedTask.id, taskNotes)
                  setShowTaskDialog(false)
                }
              }}
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default async function SubContractorJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SubContractorJobDetailClient jobId={id} />
} 