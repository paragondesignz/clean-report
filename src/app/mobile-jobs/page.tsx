"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  ArrowRight,
  Home,
  LogOut,
  Loader2,
  AlertCircle,
  Calendar,
  Filter,
  Lock
} from "lucide-react"
// Using API endpoints instead of direct Supabase client
import { formatTime, formatDate } from "@/lib/utils"
import type { Job, Client } from "@/types/database"

interface JobWithClient extends Job {
  client: Client
  tasks?: Array<{ id: string; is_completed: boolean }>
}

export default function MobileJobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'today'>('all')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [enteredPassword, setEnteredPassword] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuthAndFetchJobs()
  }, [])

  const checkAuthAndFetchJobs = async () => {
    try {
      setCheckingAuth(true)
      
      // Check if password was provided via URL (QR code)
      const accessParam = searchParams.get('access')
      if (accessParam) {
        setEnteredPassword(accessParam)
        // Try to fetch jobs directly
        await fetchJobs()
        setCheckingAuth(false)
        return
      }
      
      // Check if we need to prompt for password
      // For now, we'll try to fetch jobs and see if authentication is required
      // In a real implementation, you'd check user profile for mobile_portal_password
      await fetchJobs()
      setCheckingAuth(false)
      
    } catch (error) {
      console.error('Auth check failed:', error)
      setPasswordRequired(true)
      setCheckingAuth(false)
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      
      // Use mobile API endpoint instead of Supabase client
      const searchParams = new URLSearchParams()
      const accessParam = new URLSearchParams(window.location.search).get('access')
      if (accessParam) {
        searchParams.set('access', accessParam)
      }
      
      const response = await fetch(`/api/mobile-jobs?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const jobsData = await response.json()
      setJobs(jobsData as JobWithClient[])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCompletionProgress = (job: JobWithClient) => {
    if (!job.tasks || job.tasks.length === 0) return 0
    const completed = job.tasks.filter(task => task.is_completed).length
    return Math.round((completed / job.tasks.length) * 100)
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const jobDate = new Date(dateString)
    return jobDate.toDateString() === today.toDateString()
  }

  const getFilteredJobs = () => {
    switch (filter) {
      case 'today':
        return jobs.filter(job => isToday(job.scheduled_date))
      case 'scheduled':
        return jobs.filter(job => job.status === 'scheduled')
      case 'in_progress':
        return jobs.filter(job => job.status === 'in_progress')
      case 'completed':
        return jobs.filter(job => job.status === 'completed')
      default:
        return jobs
    }
  }

  const verifyPassword = async () => {
    if (!enteredPassword.trim()) {
      toast({
        title: "Password required",
        description: "Please enter the access password",
        variant: "destructive"
      })
      return
    }
    
    try {
      setCheckingAuth(true)
      // In a real implementation, you'd verify the password against the user's profile
      // For now, we'll just proceed to fetch jobs
      await fetchJobs()
      setPasswordRequired(false)
      toast({
        title: "Access granted",
        description: "Welcome to the mobile portal!"
      })
    } catch (error) {
      toast({
        title: "Invalid password",
        description: "Please check your access code and try again",
        variant: "destructive"
      })
    } finally {
      setCheckingAuth(false)
    }
  }

  const filteredJobs = getFilteredJobs()

  // Show loading screen during auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  // Show password prompt if required
  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Mobile Portal Access</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the access password to view your jobs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter access password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                className="text-center"
              />
            </div>
            <Button
              onClick={verifyPassword}
              disabled={checkingAuth || !enteredPassword.trim()}
              className="w-full"
            >
              {checkingAuth ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Access Portal
                </>
              )}
            </Button>
            
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-card shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="font-semibold text-xl">Mobile Jobs</h1>
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} {filter === 'all' ? 'total' : filter.replace('_', ' ')} jobs
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/')}
            className="rounded-full"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 px-4 pb-3 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: jobs.length },
            { key: 'today', label: 'Today', count: jobs.filter(j => isToday(j.scheduled_date)).length },
            { key: 'scheduled', label: 'Scheduled', count: jobs.filter(j => j.status === 'scheduled').length },
            { key: 'in_progress', label: 'In Progress', count: jobs.filter(j => j.status === 'in_progress').length },
            { key: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'completed').length }
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 text-xs whitespace-nowrap ${filter === tab.key ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-xs ${filter === tab.key ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  ({tab.count})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-28">
        {filteredJobs.length === 0 ? (
          <Card className="crm-card">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No jobs found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {filter === 'all' 
                  ? 'No active jobs available'
                  : `No ${filter.replace('_', ' ')} jobs found`
                }
              </p>
              <Button 
                onClick={() => setFilter('all')}
                variant="outline"
                size="sm"
              >
                View all jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const progress = getCompletionProgress(job)
            const isJobToday = isToday(job.scheduled_date)
            const isCompleted = job.status === 'completed'
            
            return (
              <Card 
                key={job.id} 
                className={`crm-card cursor-pointer transition-all hover:shadow-md ${
                  isJobToday && !isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                } ${
                  isCompleted ? 'bg-green-50 border-green-200 opacity-90' : ''
                }`}
                onClick={() => router.push(`/mobile-job/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-lg truncate ${
                          isCompleted ? 'text-green-800' : ''
                        }`}>
                          {job.title}
                        </h3>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="w-4 h-4 mr-1" />
                        <span className="truncate">{job.client?.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        className={`${getStatusColor(job.status)} ${
                          isCompleted ? 'bg-green-100 text-green-800 border-green-300' : ''
                        }`} 
                        variant="outline"
                      >
                        {isCompleted ? '✓ COMPLETED' : job.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {isJobToday && !isCompleted && (
                        <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                          Today
                        </Badge>
                      )}
                      {isJobToday && isCompleted && (
                        <Badge className="bg-green-100 text-green-700 border-green-300" variant="outline">
                          Completed Today
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{job.client?.address}</span>
                    </div>
                  </div>

                  {job.tasks && job.tasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
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
                      <div className={`text-xs ${
                        isCompleted ? 'text-green-700' : 'text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            All {job.tasks.length} tasks completed!
                          </>
                        ) : (
                          `${job.tasks.filter(t => t.is_completed).length} of ${job.tasks.length} tasks completed`
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-4 pt-3 border-t">
                    <Button 
                      size="sm" 
                      className={`flex items-center gap-2 ${
                        isCompleted ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/mobile-job/${job.id}`)
                      }}
                    >
                      {isCompleted ? 'View Details' : 'Open Job'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchJobs()}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex-1"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Portal
          </Button>
        </div>
      </div>
    </div>
  )
}