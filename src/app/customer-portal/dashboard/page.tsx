"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  MessageSquare,
  HelpCircle,
  Star,
  TrendingUp,
  FileText,
  Phone,
  Mail
} from "lucide-react"
import {
  getCustomerPortalSession,
  clearCustomerPortalSession,
  getClientInfo,
  getClientJobs,
  getClientJobStats,
  getClientFeedback
} from "@/lib/customer-portal-client"
import type { Client, JobWithClient } from "@/types/database"
import { CustomerPortalChat } from "@/components/customer-portal/customer-portal-chat"

export default function CustomerPortalDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [stats, setStats] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const session = getCustomerPortalSession()
      if (!session) {
        router.push("/customer-portal/login")
        return
      }

      // Load client info
      const clientInfo = await getClientInfo(session.client_id)
      if (!clientInfo) {
        toast({
          title: "Error",
          description: "Unable to load your account information",
          variant: "destructive"
        })
        return
      }
      setClient(clientInfo)

      // Load jobs
      const jobsData = await getClientJobs(session.client_id, {
        limit: 20,
        sortBy: 'scheduled_date',
        sortOrder: 'desc'
      })
      setJobs(jobsData)

      // Load statistics
      const statsData = await getClientJobStats(session.client_id)
      setStats(statsData)

      // Load feedback
      const feedbackData = await getClientFeedback(session.client_id)
      setFeedback(feedbackData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearCustomerPortalSession()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    })
    router.push("/customer-portal/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'enquiry': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, {client?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_jobs}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed_jobs}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.total_hours.toFixed(1)}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-green-600">${stats.total_cost.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Your latest cleaning appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
                    <p className="text-gray-500">Your cleaning appointments will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{job.title}</h4>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.scheduled_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.scheduled_time}
                            </div>
                            {job.agreed_hours && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {job.agreed_hours}h allocated
                              </div>
                            )}
                          </div>
                        </div>
                        {job.estimated_cost && (
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${job.estimated_cost.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>Complete history of your cleaning appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500">Your cleaning appointments will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{job.title}</h4>
                              <Badge className={getStatusColor(job.status)}>
                                {getStatusIcon(job.status)}
                                <span className="ml-1 capitalize">{job.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{job.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(job.scheduled_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.scheduled_time} - {job.end_time || 'Ongoing'}
                              </div>
                              {job.agreed_hours && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  {job.agreed_hours}h allocated
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {job.actual_cost ? (
                              <p className="font-semibold text-green-600">${job.actual_cost.toFixed(2)}</p>
                            ) : job.estimated_cost ? (
                              <p className="font-medium text-gray-600">${job.estimated_cost.toFixed(2)} (est.)</p>
                            ) : null}
                          </div>
                        </div>
                        
                        {job.total_time_seconds && job.total_time_seconds > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Time Tracking</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Allocated Hours</p>
                                <p className="font-medium">{job.agreed_hours || 0}h</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Actual Hours</p>
                                <p className="font-medium">{(job.total_time_seconds / 3600).toFixed(2)}h</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Efficiency</p>
                                <p className="font-medium">
                                  {job.agreed_hours ? 
                                    `${((job.agreed_hours * 3600 / job.total_time_seconds) * 100).toFixed(0)}%` : 
                                    'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Get in touch with our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">support@cleaningservice.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-gray-600">Mon-Fri 8AM-6PM, Sat 9AM-4PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Chat */}
              <CustomerPortalChat />
            </div>

            {/* Feedback History */}
            {feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Feedback</CardTitle>
                  <CardDescription>Previous feedback you've provided</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {item.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(item.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {item.comment && (
                          <p className="text-gray-700 text-sm">{item.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How can I reschedule my cleaning appointment?</h4>
                    <p className="text-gray-600 text-sm">Please contact us at least 24 hours before your scheduled appointment to reschedule. You can call us at (555) 123-4567 or use the chat feature in the Support section.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">What should I do to prepare for a cleaning?</h4>
                    <p className="text-gray-600 text-sm">Please declutter surfaces and secure any valuable items. Our team will bring all necessary cleaning supplies and equipment. If you have specific preferences or areas of concern, please add notes to your appointment.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How do you calculate the cleaning time and cost?</h4>
                    <p className="text-gray-600 text-sm">We allocate specific hours based on your home size and cleaning requirements. Our team tracks actual time spent, and you can view both allocated and actual hours in your job history. Final costs are based on actual time and any additional services requested.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Can I provide feedback after a cleaning?</h4>
                    <p className="text-gray-600 text-sm">Yes! After each completed job, you'll receive a feedback link via email. Your feedback helps us improve our service and ensures we meet your expectations.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">What if I'm not satisfied with the cleaning?</h4>
                    <p className="text-gray-600 text-sm">Your satisfaction is our priority. If you're not completely happy with our service, please contact us within 24 hours, and we'll make it right at no additional cost.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Do you provide cleaning supplies?</h4>
                    <p className="text-gray-600 text-sm">Yes, we bring all necessary cleaning supplies and equipment. If you prefer us to use your own products due to allergies or preferences, please let us know in advance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}