"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock,
  Timer
} from "lucide-react"
import { TimerService, type TimerState } from "@/lib/timer-service"
import type { Job } from "@/types/database"

interface JobTimerProps {
  job: Job
  onJobUpdate?: () => void
}

export function JobTimer({ job, onJobUpdate }: JobTimerProps) {
  const { toast } = useToast()
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize timer state from job data
    TimerService.initializeTimer(job)
    
    // Set up interval to update timer display
    const interval = setInterval(() => {
      const state = TimerService.getTimerState(job.id)
      setTimerState(state)
    }, 1000)

    return () => {
      clearInterval(interval)
      TimerService.cleanup(job.id)
    }
  }, [job])

  const handleStartTimer = async () => {
    setLoading(true)
    try {
      const success = await TimerService.startTimer(job.id)
      if (success) {
        toast({
          title: "Timer Started",
          description: "Job timer is now running",
        })
        onJobUpdate?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to start timer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error starting timer:', error)
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePauseTimer = async () => {
    setLoading(true)
    try {
      const success = await TimerService.pauseTimer(job.id)
      if (success) {
        toast({
          title: "Timer Paused",
          description: "Job timer has been paused",
        })
        onJobUpdate?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to pause timer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error pausing timer:', error)
      toast({
        title: "Error",
        description: "Failed to pause timer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStopTimer = async () => {
    setLoading(true)
    try {
      const success = await TimerService.stopTimer(job.id)
      if (success) {
        toast({
          title: "Job Completed",
          description: "Timer stopped and job marked as completed",
        })
        onJobUpdate?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to stop timer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResumeTimer = async () => {
    setLoading(true)
    try {
      const success = await TimerService.resumeTimer(job.id)
      if (success) {
        toast({
          title: "Timer Resumed",
          description: "Job timer is now running again",
        })
        onJobUpdate?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to resume timer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error resuming timer:', error)
      toast({
        title: "Error",
        description: "Failed to resume timer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTotalTime = () => {
    if (!timerState) return job.total_time_seconds || 0
    return timerState.totalSeconds + timerState.elapsedSeconds
  }

  const getCurrentSessionTime = () => {
    if (!timerState || !timerState.isRunning) return 0
    return timerState.elapsedSeconds
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const canStart = job?.status === 'scheduled' || job?.status === 'in_progress'
  const canPause = timerState?.isRunning && job?.status === 'in_progress'
  const canStop = timerState?.isRunning && job?.status === 'in_progress'
  const canResume = !timerState?.isRunning && job?.timer_started_at && !job?.timer_ended_at

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-primary" />
          <span>Job Timer</span>
          {timerState?.isRunning && (
            <Badge className="text-xs">
              Running
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {formatTime(getTotalTime())}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Time</p>
          
          {timerState?.isRunning && (
            <div className="mt-2">
              <div className="text-lg font-mono text-primary">
                +{formatTime(getCurrentSessionTime())}
              </div>
              <p className="text-xs text-muted-foreground">Current Session</p>
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-2">
          {canStart && !timerState?.isRunning && (
            <Button
              onClick={handleStartTimer}
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Job
            </Button>
          )}

          {canResume && (
            <Button
              onClick={handleResumeTimer}
              disabled={loading}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}

          {canPause && (
            <Button
              onClick={handlePauseTimer}
              disabled={loading}
              variant="outline"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          {canStop && (
            <Button
              onClick={handleStopTimer}
              disabled={loading}
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Complete Job
            </Button>
          )}
        </div>

        {/* Timer Status */}
        <div className="text-center text-sm text-muted-foreground">
          {job?.timer_started_at && (
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>
                Started: {new Date(job.timer_started_at).toLocaleString()}
              </span>
            </div>
          )}
          
          {job?.timer_ended_at && (
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Square className="h-4 w-4" />
              <span>
                Completed: {new Date(job.timer_ended_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Job Status */}
        <div className="text-center">
          <Badge 
            variant={
              job?.status === 'completed' ? 'default' :
              job?.status === 'in_progress' ? 'secondary' :
              'outline'
            }
          >
            {job?.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 