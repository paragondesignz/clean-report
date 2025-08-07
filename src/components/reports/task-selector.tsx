"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ReportService } from '@/lib/report-service'
import type { Task, ReportTask } from '@/types/database'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Check,
  X
} from 'lucide-react'

interface TaskSelectorProps {
  jobId: string
  onTasksUpdated?: () => void
}

export function TaskSelector({ jobId, onTasksUpdated }: TaskSelectorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [reportTasks, setReportTasks] = useState<ReportTask[]>([])

  useEffect(() => {
    loadTasks()
  }, [jobId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const reportService = new ReportService('temp') // We'll get the actual user ID
      const reportData = await reportService.prepareReportData(jobId)
      
      setTasks(reportData.tasks)
      setReportTasks(reportData.reportTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskSelection = async (taskId: string, includeInReport: boolean) => {
    try {
      const reportService = new ReportService('temp')
      await reportService.updateReportTaskSelection(jobId, taskId, includeInReport)
      
      setReportTasks(prev => 
        prev.map(rt => 
          rt.task_id === taskId 
            ? { ...rt, include_in_report: includeInReport }
            : rt
        )
      )
      
      onTasksUpdated?.()
      
      toast({
        title: "Success",
        description: `Task ${includeInReport ? 'included' : 'excluded'} from report`,
      })
    } catch (error) {
      console.error('Error updating task selection:', error)
      toast({
        title: "Error",
        description: "Failed to update task selection",
        variant: "destructive"
      })
    }
  }

  const getTaskStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <Circle className="w-5 h-5 text-gray-400" />
    )
  }

  const getTaskStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tasks Available</h3>
          <p className="text-muted-foreground">
            No tasks have been created for this job yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const completedTasks = tasks.filter(task => task.is_completed)
  const pendingTasks = tasks.filter(task => !task.is_completed)
  const selectedTasks = reportTasks.filter(rt => rt.include_in_report)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Selection</h3>
          <p className="text-sm text-muted-foreground">
            Choose which tasks to include in the report
          </p>
        </div>
        <Badge variant="secondary">
          {selectedTasks.length} of {tasks.length} selected
        </Badge>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{pendingTasks.length}</p>
              </div>
              <Circle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Select which tasks to include in the report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => {
              const reportTask = reportTasks.find(rt => rt.task_id === task.id)
              const isSelected = reportTask?.include_in_report || false

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isSelected ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.is_completed)}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleTaskSelection(task.id, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {isSelected ? 'Included' : 'Excluded'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          task.is_completed ? 'line-through text-gray-500' : 'text-foreground'
                        }`}>
                          {task.title}
                        </h4>
                        <Badge className={getTaskStatusColor(task.is_completed)}>
                          {task.is_completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm ${
                          task.is_completed ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Order: {task.order_index || 0}</span>
                        </div>
                        {task.is_completed && (
                          <span>Completed on {new Date(task.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Selected tasks will be included in the generated report
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setReportTasks(prev => 
                prev.map(rt => ({ ...rt, include_in_report: true }))
              )
            }}
          >
            <Check className="w-4 h-4 mr-2" />
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReportTasks(prev => 
                prev.map(rt => ({ ...rt, include_in_report: false }))
              )
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Deselect All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReportTasks(prev => 
                prev.map(rt => ({ 
                  ...rt, 
                  include_in_report: tasks.find(t => t.id === rt.task_id)?.is_completed || false 
                }))
              )
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Select Completed Only
          </Button>
        </div>
      </div>
    </div>
  )
}
