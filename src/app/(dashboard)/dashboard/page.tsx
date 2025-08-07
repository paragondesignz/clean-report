"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  FileText, 
  Plus, 
  Clock, 
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatTime } from "@/lib/utils"
import { getDashboardStats, getJobs, testDatabaseConnection } from "@/lib/supabase-client"
import { FeedbackDashboard } from "@/components/feedback-dashboard"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useNotification } from "@/components/notifications/notification-provider"
import type { Job, JobWithClient } from "@/types/database"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addNotification } = useNotification()
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalClients: 0,
    totalReports: 0
  })
  const [upcomingJobs, setUpcomingJobs] = useState<JobWithClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Test database connection first
        const connectionTest = await testDatabaseConnection()
        console.log('Database connection test:', connectionTest)
        
        if (!connectionTest.success) {
          console.error('Database connection failed:', connectionTest.error)
          toast({
            title: "Database Error",
            description: `Connection failed: ${connectionTest.error}`,
            variant: "destructive"
          })
          addNotification({
            title: "Database Connection Failed",
            description: "Unable to connect to the database. Please check your connection.",
            variant: "error",
            autoClose: true,
            duration: 8000
          })
          return
        }

        const [statsData, jobsData] = await Promise.all([
          getDashboardStats(),
          getJobs()
        ])

        setStats(statsData)
        
        // Get upcoming jobs (scheduled and in-progress)
        const upcoming = jobsData?.filter(job => 
          job.status === 'scheduled' || job.status === 'in_progress'
        ).slice(0, 5) || []
        
        setUpcomingJobs(upcoming)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, addNotification, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Here's what's happening with your cleaning business.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link href="/jobs/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Job</span>
              <span className="sm:hidden">Add Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalJobs * 150}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bento-style Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Jobs - Takes up 6 columns on large screens */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>
                    Your upcoming and recent cleaning jobs
                  </CardDescription>
                </div>
                <Link href="/jobs">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming jobs</h3>
                  <p className="text-muted-foreground mb-4">Schedule your first cleaning job to get started</p>
                  <Link href="/jobs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Job
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingJobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate">{job.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{job.client?.name || 'Unknown Client'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {upcomingJobs.length > 4 && (
                    <div className="text-center pt-2">
                      <Link href="/jobs">
                        <Button variant="ghost" size="sm">
                          View {upcomingJobs.length - 4} more jobs
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Feedback - Takes up 6 columns on large screens */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>
                Recent ratings and feedback insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackDashboard />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Compact Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions - Horizontal layout */}
        <div className="lg:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link href="/clients/new">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Users className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
                <Link href="/jobs/new">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    New Job
                  </Button>
                </Link>
                <Link href="/reports/new">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
} 