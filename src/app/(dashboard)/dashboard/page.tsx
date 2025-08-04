"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  FileText, 
  Plus, 
  Clock, 
  MapPin
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatTime } from "@/lib/utils"
import { getDashboardStats, getJobs, testDatabaseConnection } from "@/lib/supabase-client"
import type { Job, JobWithClient } from "@/types/database"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
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
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/jobs">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
            <ClipboardList className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalJobs}</div>
            <p className="text-xs text-slate-500">
              All time jobs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.completedJobs}</div>
            <p className="text-xs text-slate-500">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalClients}</div>
            <p className="text-xs text-slate-500">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalReports}</div>
            <p className="text-xs text-slate-500">
              Sent to clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Jobs */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Upcoming Jobs</CardTitle>
          <CardDescription>
            Your next scheduled cleaning jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingJobs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No upcoming jobs</h3>
              <p className="text-slate-600 mb-4">Schedule your first cleaning job to get started</p>
              <Link href="/jobs">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {job.client?.name || 'Unknown Client'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.client?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Users className="h-5 w-5 mr-2" />
              Manage Clients
            </CardTitle>
            <CardDescription>
              Add new clients and manage existing ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <ClipboardList className="h-5 w-5 mr-2" />
              Schedule Jobs
            </CardTitle>
            <CardDescription>
              Create new cleaning jobs and manage schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <FileText className="h-5 w-5 mr-2" />
              Generate Reports
            </CardTitle>
            <CardDescription>
              Create and send reports to your clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 