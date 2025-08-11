"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Camera,
  FileText,
  Phone,
  Mail,
  Navigation
} from "lucide-react"
import Link from "next/link"

interface SubContractorJob {
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
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimated_time: number
}

export default function SubContractorDashboard() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<SubContractorJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading jobs
    setTimeout(() => {
      const mockJobs: SubContractorJob[] = [
        {
          id: '1',
          title: 'Deep Clean - Johnson Residence',
          client_name: 'Sarah Johnson',
          client_address: '123 Oak Street, Downtown, CA 90210',
          client_phone: '(555) 123-4567',
          client_email: 'sarah.johnson@email.com',
          scheduled_date: '2024-01-15',
          scheduled_time: '09:00',
          status: 'assigned',
          estimated_duration: 3,
          description: 'Complete deep cleaning of 3-bedroom house including kitchen, bathrooms, and living areas.',
          tasks: [
            { id: '1', title: 'Kitchen Deep Clean', description: 'Clean all surfaces, appliances, and cabinets', status: 'pending', priority: 'high', estimated_time: 60 },
            { id: '2', title: 'Bathroom Sanitization', description: 'Clean and sanitize all bathrooms', status: 'pending', priority: 'high', estimated_time: 45 },
            { id: '3', title: 'Living Room Dusting', description: 'Dust all surfaces and vacuum', status: 'pending', priority: 'medium', estimated_time: 30 },
            { id: '4', title: 'Bedroom Cleaning', description: 'Clean all bedrooms and make beds', status: 'pending', priority: 'medium', estimated_time: 45 }
          ],
          admin_contact: {
            name: 'Mike Admin',
            phone: '(555) 987-6543',
            email: 'mike@cleanreport.com'
          }
        },
        {
          id: '2',
          title: 'Weekly Maintenance - Chen Family',
          client_name: 'Mike Chen',
          client_address: '456 Pine Avenue, Uptown, CA 90211',
          client_phone: '(555) 234-5678',
          client_email: 'mike.chen@email.com',
          scheduled_date: '2024-01-16',
          scheduled_time: '14:00',
          status: 'accepted',
          estimated_duration: 2,
          description: 'Weekly maintenance cleaning for busy family with children.',
          tasks: [
            { id: '5', title: 'General Cleaning', description: 'Standard weekly cleaning tasks', status: 'pending', priority: 'medium', estimated_time: 120 }
          ],
          admin_contact: {
            name: 'Mike Admin',
            phone: '(555) 987-6543',
            email: 'mike@cleanreport.com'
          }
        }
      ]
      setJobs(mockJobs)
      setLoading(false)
    }, 1000)
  }, [])

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sub Contractor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your assigned jobs and track your progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-4 w-4 mr-1" />
            Sub Contractor
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Today's Jobs</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              {jobs.filter(job => job.scheduled_date === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              {jobs.reduce((total, job) => total + job.estimated_duration, 0)}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-2">
              {jobs.filter(job => job.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-2">
              {jobs.filter(job => job.status === 'assigned' || job.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Assigned Jobs</h2>
          <Badge variant="outline">
            {jobs.length} jobs total
          </Badge>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs assigned</h3>
              <p className="text-gray-600">
                You don't have any jobs assigned yet. Check back later or contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <Badge className={job?.status ? getStatusColor(job.status) : 'bg-gray-100 text-gray-800'}>
                          {job?.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {job.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Call admin
                          toast({
                            title: "Calling Admin",
                            description: `Calling ${job.admin_contact.name}...`,
                          })
                        }}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call Admin
                      </Button>
                      <Link href={`/sub-contractor/jobs/${job.id}`}>
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View Job
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Client Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Client Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{job.client_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{job.client_address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{job.client_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Schedule</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(job.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{formatTime(job.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{job.estimated_duration} hours estimated</span>
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Tasks</h4>
                      <div className="space-y-1">
                        {job.tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">{task.title}</span>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                        {job.tasks.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{job.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            // Open navigation
                            const address = encodeURIComponent(job.client_address)
                            window.open(`https://maps.google.com/?q=${address}`, '_blank')
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            // Start timer
                            toast({
                              title: "Timer Started",
                              description: "Job timer has been started",
                            })
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Timer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            // Take photo
                            toast({
                              title: "Photo Upload",
                              description: "Opening camera for photo...",
                            })
                          }}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 