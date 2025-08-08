"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  Target,
  AlertTriangle
} from "lucide-react"
import { getJobWorkerAssignments } from "@/lib/supabase-client"
import type { JobWorkerAssignment } from "@/types/database"

interface JobStatisticsProps {
  jobId: string
  agreedHours?: number | null
  actualCost?: number | null
  estimatedCost?: number | null
}

interface Assignment extends JobWorkerAssignment {
  sub_contractors?: {
    first_name: string
    last_name: string
  }
}

interface JobStats {
  totalAllocatedHours: number
  totalActualHours: number
  totalCost: number
  expectedCost: number
  efficiency: number
  variance: number
  workers: {
    name: string
    type: string
    allocatedHours: number
    actualHours: number
    hourlyRate: number
    cost: number
  }[]
}

export function JobStatistics({ jobId, agreedHours, actualCost, estimatedCost }: JobStatisticsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)

  useEffect(() => {
    loadJobStatistics()
  }, [jobId])

  const loadJobStatistics = async () => {
    try {
      setLoading(true)
      const assignmentsData = await getJobWorkerAssignments(jobId)
      setAssignments(assignmentsData)
      
      calculateStatistics(assignmentsData)
    } catch (error) {
      console.error('Error loading job statistics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load job statistics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (assignmentsData: Assignment[]) => {
    if (!assignmentsData.length) {
      setStats(null)
      return
    }

    const workers = assignmentsData.map(assignment => {
      const name = assignment.worker_type === 'owner' 
        ? 'Owner' 
        : assignment.sub_contractors 
          ? `${assignment.sub_contractors.first_name} ${assignment.sub_contractors.last_name}`
          : 'Unknown Worker'

      const allocatedHours = assignment.assigned_hours || 0
      const actualHours = assignment.actual_hours || 0
      const cost = assignment.total_cost || (actualHours * assignment.hourly_rate)

      return {
        name,
        type: assignment.worker_type,
        allocatedHours,
        actualHours,
        hourlyRate: assignment.hourly_rate,
        cost
      }
    })

    const totalAllocatedHours = workers.reduce((sum, w) => sum + w.allocatedHours, 0)
    const totalActualHours = workers.reduce((sum, w) => sum + w.actualHours, 0)
    const totalCost = workers.reduce((sum, w) => sum + w.cost, 0)
    const expectedCost = workers.reduce((sum, w) => sum + (w.allocatedHours * w.hourlyRate), 0)

    // Use agreed hours from job if available, otherwise use sum of allocated hours
    const jobAllocatedHours = agreedHours || totalAllocatedHours
    
    const efficiency = jobAllocatedHours > 0 ? (jobAllocatedHours / totalActualHours) * 100 : 0
    const variance = totalActualHours - jobAllocatedHours
    const variancePercentage = jobAllocatedHours > 0 ? (variance / jobAllocatedHours) * 100 : 0

    setStats({
      totalAllocatedHours: jobAllocatedHours,
      totalActualHours,
      totalCost,
      expectedCost,
      efficiency,
      variance: variancePercentage,
      workers
    })
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95 && efficiency <= 105) return 'text-green-600'
    if (efficiency >= 85 && efficiency <= 115) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 95 && efficiency <= 105) return <Target className="h-4 w-4" />
    if (efficiency > 105) return <TrendingUp className="h-4 w-4" />
    if (efficiency < 95) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getVarianceColor = (variance: number) => {
    const absVariance = Math.abs(variance)
    if (absVariance <= 5) return 'bg-green-100 text-green-800'
    if (absVariance <= 15) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.workers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>No worker assignments found for this job.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Statistics Overview
          </CardTitle>
          <CardDescription>
            Allocated vs actual hours and cost analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAllocatedHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Allocated Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalActualHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Actual Hours</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getEfficiencyColor(stats.efficiency)}`}>
                {stats.efficiency.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${stats.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
          </div>

          {/* Efficiency Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getEfficiencyIcon(stats.efficiency)}
                <span className="font-medium">Efficiency</span>
              </div>
              <Badge className={getVarianceColor(stats.variance)}>
                {stats.variance > 0 ? '+' : ''}{stats.variance.toFixed(1)}% variance
              </Badge>
            </div>
            <Progress 
              value={Math.min(stats.efficiency, 150)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Under-allocated</span>
              <span>On target (100%)</span>
              <span>Over-allocated</span>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Cost Analysis</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Cost:</span>
                  <span className="font-medium">${stats.expectedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Cost:</span>
                  <span className="font-medium">${stats.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Variance:</span>
                  <span className={`font-medium ${
                    stats.totalCost > stats.expectedCost ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {stats.totalCost > stats.expectedCost ? '+' : ''}
                    ${(stats.totalCost - stats.expectedCost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Performance</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Efficiency:</span>
                  <span className={`font-medium ${getEfficiencyColor(stats.efficiency)}`}>
                    {stats.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hour Difference:</span>
                  <span className="font-medium">
                    {stats.totalActualHours - stats.totalAllocatedHours > 0 ? '+' : ''}
                    {(stats.totalActualHours - stats.totalAllocatedHours).toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workers Assigned:</span>
                  <span className="font-medium">{stats.workers.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worker Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Worker Performance
          </CardTitle>
          <CardDescription>
            Individual worker time tracking and costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.workers.map((worker, index) => {
              const efficiency = worker.allocatedHours > 0 
                ? (worker.allocatedHours / worker.actualHours) * 100 
                : 0
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{worker.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {worker.type.replace('_', ' ')} • ${worker.hourlyRate}/hr
                      </p>
                    </div>
                    <Badge variant="outline">
                      ${worker.cost.toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Allocated</div>
                      <div className="font-medium">{worker.allocatedHours}h</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Actual</div>
                      <div className="font-medium">{worker.actualHours.toFixed(2)}h</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Efficiency</div>
                      <div className={`font-medium ${getEfficiencyColor(efficiency)}`}>
                        {efficiency.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(efficiency, 150)} 
                    className="h-2"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}