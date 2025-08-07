"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, XCircle, DollarSign, Building2 } from "lucide-react"
import { getJobs, deleteJob, getClients, testDatabaseConnection, checkRequiredTables } from "@/lib/supabase-client"
import { formatTime, formatListDate } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import type { Job, Client, JobWithClient } from "@/types/database"

export default function JobsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Environment check:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseAnonKey: !!supabaseAnonKey,
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
      })
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
      }
      
      // Test database connection first
      console.log('Testing database connection...')
      const dbTest = await testDatabaseConnection()
      console.log('Database connection test result:', dbTest)
      
      if (!dbTest.success) {
        throw new Error(`Database connection failed: ${dbTest.error}`)
      }
      
      // Check required tables
      console.log('Checking required tables...')
      const tableCheck = await checkRequiredTables()
      console.log('Table check result:', tableCheck)
      
      if (!tableCheck.allTablesExist) {
        throw new Error(`Missing tables: ${tableCheck.missingTables.map(t => t.table).join(', ')}`)
      }
      
      const [jobsData, clientsData] = await Promise.all([
        getJobs(),
        getClients()
      ])
      setJobs(jobsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load jobs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    
    try {
      await deleteJob(jobId)
      toast({
        title: "Success",
        description: "Job deleted successfully"
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      })
    }
  }

  const getJobStatus = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'enquiry': return 'Enquiry'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }


  const getJobPriority = (job: JobWithClient) => {
    // Simple priority based on status and date
    if (job.status === 'in_progress') return 'High'
    if (job.status === 'scheduled') return 'Medium'
    if (job.status === 'completed') return 'Low'
    return 'Low'
  }

  const getJobValue = (job: JobWithClient) => {
    // Mock value calculation - in real app this would come from pricing
    return `$${(Math.random() * 200 + 50).toFixed(0)}`
  }

  const getLastUpdated = (job: JobWithClient) => {
    // Mock last updated - in real app this would be actual timestamp
    const days = Math.floor(Math.random() * 7)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  // Show database setup instructions if there are no jobs and no clients
  if (jobs.length === 0 && clients.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="text-muted-foreground">Manage your cleaning service jobs</p>
          </div>
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>

        {/* Database Setup Instructions */}
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Database Setup Required</h3>
            <p className="text-muted-foreground mb-4">
              It looks like your database hasn't been set up yet. Please follow these steps:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>1. Make sure your Supabase project is created and configured</p>
              <p>2. Run the database setup script in your Supabase SQL editor</p>
              <p>3. Check that your environment variables are set correctly</p>
              <p>4. Ensure you're signed in to the application</p>
            </div>
            <div className="mt-6 space-x-4">
              <Button variant="outline" onClick={() => window.open('/DATABASE_SETUP.md', '_blank')}>
                View Setup Instructions
              </Button>
              <Button onClick={fetchData}>
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for DataTable
  const tableData = jobs.map(job => ({
    id: job.id,
    title: job.title,
    client: job.client?.name || 'Unknown Client',
    status: job.status,
    scheduledDate: formatListDate(job.scheduled_date),
    scheduledTime: formatTime(job.scheduled_time),
    priority: getJobPriority(job),
    value: getJobValue(job),
    lastUpdated: getLastUpdated(job),
    description: job.description,
    clientEmail: job.client?.email || 'No email',
  }))

  // Define columns for DataTable - optimized for better fit
  const columns = [
    {
      key: 'title',
      label: 'Job',
      sortable: true,
      width: '300px',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md flex-shrink-0">
            {getJobIcon(row.status)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      width: '160px',
      render: (value: string, row: any) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.clientEmail}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <Badge className={getStatusColor(value)} variant="outline">
          {getJobStatus(value)}
        </Badge>
      )
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      sortable: true,
      width: '120px',
      render: (value: string, row: any) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">{row.scheduledTime}</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-green-600">{value}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      width: '100px',
      render: (value: string) => {
        const colors = {
          'High': 'bg-red-100 text-red-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Low': 'bg-green-100 text-green-800'
        }
        return (
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'} variant="outline">
            {value}
          </Badge>
        )
      }
    }
  ]


  return (
    <DataTable
      title="Jobs"
      description="Manage your cleaning service jobs"
      data={tableData}
      columns={columns}
      addButton={{
        href: "/jobs/new",
        label: "New Job",
        icon: Plus
      }}
      onRowClick={(row) => `/jobs/${row.id}`}
      onDelete={handleDelete}
      searchPlaceholder="Search jobs by title, client, or description..."
      filterOptions={[
        { key: 'status', label: 'Status', options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'enquiry', label: 'Enquiry' }
        ]},
        { key: 'priority', label: 'Priority', options: [
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ]}
      ]}
    />
  )
} 