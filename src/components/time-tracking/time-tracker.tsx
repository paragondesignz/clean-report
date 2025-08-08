'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Clock, Play, Square, DollarSign, User } from 'lucide-react'
import {
  getJobWorkerAssignments,
  clockInWorker,
  clockOutWorker
} from '@/lib/supabase-client'
import type { JobWorkerAssignment, SubContractor } from '@/types/database'

interface TimeTrackerProps {
  jobId: string
  onTimeUpdate?: () => void
}

interface Assignment extends JobWorkerAssignment {
  sub_contractors?: SubContractor
}

export function TimeTracker({ jobId, onTimeUpdate }: TimeTrackerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAssignments()
    // Set up an interval to refresh assignments every 30 seconds
    const interval = setInterval(loadAssignments, 30000)
    return () => clearInterval(interval)
  }, [jobId])

  const loadAssignments = async () => {
    try {
      const data = await getJobWorkerAssignments(jobId)
      setAssignments(data)
    } catch (error) {
      console.error('Error loading assignments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load time tracking data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async (assignmentId: string) => {
    try {
      setActionLoading(assignmentId)
      await clockInWorker(assignmentId)
      
      toast({
        title: 'Success',
        description: 'Clocked in successfully'
      })
      
      await loadAssignments()
      onTimeUpdate?.()
    } catch (error) {
      console.error('Error clocking in:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock in',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleClockOut = async (assignmentId: string) => {
    try {
      setActionLoading(assignmentId)
      await clockOutWorker(assignmentId)
      
      toast({
        title: 'Success',
        description: 'Clocked out successfully'
      })
      
      await loadAssignments()
      onTimeUpdate?.()
    } catch (error) {
      console.error('Error clocking out:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock out',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getWorkerName = (assignment: Assignment) => {
    if (assignment.worker_type === 'owner') {
      return 'You (Owner)'
    } else if (assignment.sub_contractors) {
      return `${assignment.sub_contractors.first_name} ${assignment.sub_contractors.last_name}`
    }
    return 'Unknown Worker'
  }

  const formatDuration = (clockInTime: string) => {
    const start = new Date(clockInTime)
    const now = new Date()
    const diffInMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffInMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateEstimatedCost = (assignment: Assignment) => {
    return (assignment.assigned_hours || 0) * assignment.hourly_rate
  }

  const calculateActualCost = (assignment: Assignment) => {
    return assignment.total_cost || 0
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading time tracker...</div>
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-6">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No workers assigned to this job yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{getWorkerName(assignment)}</span>
                    </div>
                    {assignment.is_clocked_in && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Active
                        </div>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {assignment.is_clocked_in ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClockOut(assignment.id)}
                        disabled={actionLoading === assignment.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        {actionLoading === assignment.id ? 'Clocking Out...' : 'Clock Out'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClockIn(assignment.id)}
                        disabled={actionLoading === assignment.id}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {actionLoading === assignment.id ? 'Clocking In...' : 'Clock In'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Hourly Rate</div>
                    <div className="font-medium">${assignment.hourly_rate}/hr</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Assigned Hours</div>
                    <div className="font-medium">{assignment.assigned_hours || 0}h</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Actual Hours</div>
                    <div className="font-medium">
                      {assignment.actual_hours ? assignment.actual_hours.toFixed(2) : 0}h
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Cost</div>
                    <div className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {calculateActualCost(assignment).toFixed(2)} / ${calculateEstimatedCost(assignment).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">actual / estimated</div>
                    </div>
                  </div>
                </div>

                {assignment.is_clocked_in && assignment.clock_in_time && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-sm text-green-700">
                      <strong>Currently working:</strong> {formatDuration(assignment.clock_in_time)}
                    </div>
                    <div className="text-xs text-green-600">
                      Started at {new Date(assignment.clock_in_time).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}