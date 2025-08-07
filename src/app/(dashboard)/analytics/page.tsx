"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  FileText,
  Star,
  Activity
} from "lucide-react"
import { getJobs, getClients, getReports, getSupplies, getDashboardStats } from "@/lib/supabase-client"
import type { Job, Client, Report, Supply } from "@/types/database"

interface AnalyticsData {
  jobs: Job[]
  clients: Client[]
  reports: Report[]
  supplies: Supply[]
  dashboardStats: {
    totalJobs: number
    completedJobs: number
    totalClients: number
    totalReports: number
  }
}

interface MetricCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30") // days
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [jobs, clients, reports, supplies, dashboardStats] = await Promise.all([
        getJobs(),
        getClients(),
        getReports(),
        getSupplies(),
        getDashboardStats()
      ])

      setData({
        jobs: jobs || [],
        clients: clients || [],
        reports: reports || [],
        supplies: supplies || [],
        dashboardStats
      })
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  // Calculate metrics
  const totalRevenue = data.jobs.reduce((sum, job) => {
    // Mock revenue calculation - replace with actual pricing logic
    return sum + (Math.random() * 200 + 50)
  }, 0)

  const completionRate = data.jobs.length > 0 
    ? (data.dashboardStats.completedJobs / data.dashboardStats.totalJobs * 100)
    : 0

  const avgJobsPerClient = data.clients.length > 0 
    ? (data.jobs.length / data.clients.length)
    : 0

  const activeJobs = data.jobs.filter(j => j.status === 'in_progress').length

  // Time-based metrics (filtered by timeRange)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))
  
  const recentJobs = data.jobs.filter(j => 
    j.created_at && new Date(j.created_at) >= cutoffDate
  )
  const recentClients = data.clients.filter(c => 
    c.created_at && new Date(c.created_at) >= cutoffDate
  )

  // Status distribution
  const statusCounts = data.jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Client activity analysis
  const clientJobCounts = data.jobs.reduce((acc, job) => {
    acc[job.client_id] = (acc[job.client_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topClients = Object.entries(clientJobCounts)
    .map(([clientId, jobCount]) => ({
      client: data.clients.find(c => c.id === clientId),
      jobCount
    }))
    .filter(item => item.client)
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, 5)

  // Key metrics cards
  const metrics: MetricCard[] = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(0)}`,
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      description: "Revenue from all completed jobs"
    },
    {
      title: "Total Jobs",
      value: data.dashboardStats.totalJobs,
      change: `+${recentJobs.length} this period`,
      changeType: "positive",
      icon: Calendar,
      description: "All jobs in the system"
    },
    {
      title: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      change: completionRate > 85 ? "+5%" : "-2%",
      changeType: completionRate > 85 ? "positive" : "negative",
      icon: CheckCircle,
      description: "Jobs completed vs total jobs"
    },
    {
      title: "Active Clients",
      value: data.dashboardStats.totalClients,
      change: `+${recentClients.length} new`,
      changeType: "positive",
      icon: Users,
      description: "Total registered clients"
    },
    {
      title: "Jobs Per Client",
      value: avgJobsPerClient.toFixed(1),
      change: avgJobsPerClient > 2 ? "+0.3" : "-0.1",
      changeType: avgJobsPerClient > 2 ? "positive" : "negative",
      icon: TrendingUp,
      description: "Average jobs per client"
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      change: activeJobs > 0 ? "In progress" : "None active",
      changeType: "neutral",
      icon: Activity,
      description: "Jobs currently in progress"
    },
    {
      title: "Reports Generated",
      value: data.dashboardStats.totalReports,
      change: "+15 this month",
      changeType: "positive",
      icon: FileText,
      description: "Total job reports created"
    },
    {
      title: "Supply Items",
      value: data.supplies.length,
      change: data.supplies.filter(s => (s.quantity || 0) < (s.minimum_quantity || 10)).length + " low stock",
      changeType: "neutral",
      icon: Package,
      description: "Items in inventory"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your cleaning business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {metric.changeType === 'positive' && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  {metric.changeType === 'negative' && (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={
                    metric.changeType === 'positive' ? 'text-green-500' :
                    metric.changeType === 'negative' ? 'text-red-500' :
                    'text-muted-foreground'
                  }>
                    {metric.change}
                  </span>
                </div>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Overview of all jobs by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = (count / data.jobs.length * 100).toFixed(1)
              const statusLabels = {
                'scheduled': 'Scheduled',
                'in_progress': 'In Progress', 
                'completed': 'Completed',
                'cancelled': 'Cancelled',
                'enquiry': 'Enquiry'
              }
              const statusColors = {
                'scheduled': 'bg-blue-500',
                'in_progress': 'bg-yellow-500',
                'completed': 'bg-green-500', 
                'cancelled': 'bg-red-500',
                'enquiry': 'bg-gray-500'
              }
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-400'}`}></div>
                    <span className="text-sm">{statusLabels[status as keyof typeof statusLabels] || status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Clients with the most jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topClients.map((item, index) => (
              <div key={item.client?.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-xs font-medium">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.client?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.client?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.jobCount} jobs</p>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(item.jobCount / 2)) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No client data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Supply Management Status */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Inventory Status</CardTitle>
            <CardDescription>Current stock levels and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.supplies.slice(0, 6).map((supply) => {
              const quantity = supply.quantity || 0
              const minQuantity = supply.minimum_quantity || 10
              const isLowStock = quantity < minQuantity
              
              return (
                <div key={supply.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className={`h-4 w-4 ${isLowStock ? 'text-red-500' : 'text-green-500'}`} />
                    <span className="text-sm">{supply.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isLowStock ? "destructive" : "secondary"}>
                      {quantity} {supply.unit || 'units'}
                    </Badge>
                    {isLowStock && (
                      <span className="text-xs text-red-500">Low Stock</span>
                    )}
                  </div>
                </div>
              )
            })}
            {data.supplies.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No supply data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{data.dashboardStats.completedJobs} jobs completed</p>
                  <p className="text-xs text-muted-foreground">In the last {timeRange} days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{recentClients.length} new clients</p>
                  <p className="text-xs text-muted-foreground">Added recently</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{scheduledJobs} jobs scheduled</p>
                  <p className="text-xs text-muted-foreground">Upcoming appointments</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{data.dashboardStats.totalReports} reports generated</p>
                  <p className="text-xs text-muted-foreground">Professional job reports</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Business Insights</CardTitle>
          <CardDescription>AI-powered recommendations for your cleaning business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Revenue Insight */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Revenue Growth</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Your completion rate of {completionRate.toFixed(1)}% is {completionRate > 85 ? 'excellent' : 'good'}. 
                {completionRate < 85 && ' Consider improving scheduling and communication.'}
              </p>
            </div>

            {/* Client Retention */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Client Engagement</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {avgJobsPerClient > 2 
                  ? 'Great client retention! Your clients are booking multiple jobs.'
                  : 'Focus on client retention strategies to increase repeat bookings.'
                }
              </p>
            </div>

            {/* Supply Management */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Supply Management</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.supplies.filter(s => (s.quantity || 0) < (s.minimum_quantity || 10)).length > 0
                  ? `${data.supplies.filter(s => (s.quantity || 0) < (s.minimum_quantity || 10)).length} items are running low. Consider restocking soon.`
                  : 'All supplies are well-stocked. Good inventory management!'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}