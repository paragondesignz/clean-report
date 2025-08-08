'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { getJobWorkerAssignments } from '@/lib/supabase-client'
import type { JobWorkerAssignment, SubContractor } from '@/types/database'

interface CostSummaryProps {
  jobId: string
  agreedHours?: number
  refreshTrigger?: number
}

interface Assignment extends JobWorkerAssignment {
  sub_contractors?: SubContractor
}

export function CostSummary({ jobId, agreedHours, refreshTrigger }: CostSummaryProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [jobId, refreshTrigger])

  const loadAssignments = async () => {
    try {
      const data = await getJobWorkerAssignments(jobId)
      setAssignments(data)
    } catch (error) {
      console.error('Error loading cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const totalAssignedHours = assignments.reduce((total, assignment) => {
      return total + (assignment.assigned_hours || 0)
    }, 0)

    const totalActualHours = assignments.reduce((total, assignment) => {
      return total + (assignment.actual_hours || 0)
    }, 0)

    const estimatedCost = assignments.reduce((total, assignment) => {
      return total + (assignment.hourly_rate * (assignment.assigned_hours || 0))
    }, 0)

    const actualCost = assignments.reduce((total, assignment) => {
      return total + (assignment.total_cost || 0)
    }, 0)

    return {
      totalAssignedHours,
      totalActualHours,
      estimatedCost,
      actualCost
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading cost summary...</div>
        </CardContent>
      </Card>
    )
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No workers assigned yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const { totalAssignedHours, totalActualHours, estimatedCost, actualCost } = calculateTotals()
  const costDifference = actualCost - estimatedCost
  const hoursDifference = totalActualHours - totalAssignedHours
  const isOverBudget = costDifference > 0
  const isOverTime = hoursDifference > 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Estimated Cost</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">${actualCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Actual Cost</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{totalAssignedHours}h</div>
              <div className="text-sm text-muted-foreground">Assigned Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{totalActualHours.toFixed(2)}h</div>
              <div className="text-sm text-muted-foreground">Actual Hours</div>
            </div>
          </div>

          {/* Cost and Time Variance */}
          <div className="mt-6 space-y-3">
            {costDifference !== 0 && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                isOverBudget ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {isOverBudget ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isOverBudget ? 'Over Budget:' : 'Under Budget:'} ${Math.abs(costDifference).toFixed(2)}
                </span>
              </div>
            )}

            {hoursDifference !== 0 && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                isOverTime ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {isOverTime ? 'Over Time:' : 'Under Time:'} {Math.abs(hoursDifference).toFixed(2)}h
                </span>
              </div>
            )}
          </div>

          {/* Agreed Hours Comparison */}
          {agreedHours && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Agreed Hours (Client):</span>
                <span className="font-bold">{agreedHours}h</span>
              </div>
              {totalActualHours > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Actual vs Agreed:</span>
                  <Badge variant={totalActualHours > agreedHours ? "destructive" : "secondary"}>
                    {totalActualHours > agreedHours ? '+' : ''}{(totalActualHours - agreedHours).toFixed(2)}h
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worker Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const workerName = assignment.worker_type === 'owner' 
                ? 'You (Owner)' 
                : assignment.sub_contractors 
                  ? `${assignment.sub_contractors.first_name} ${assignment.sub_contractors.last_name}`
                  : 'Unknown Worker'

              return (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{workerName}</div>
                    <div className="text-sm text-muted-foreground">
                      ${assignment.hourly_rate}/hr • {assignment.assigned_hours || 0}h assigned • {assignment.actual_hours?.toFixed(2) || 0}h actual
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(assignment.total_cost || 0).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      of ${(assignment.hourly_rate * (assignment.assigned_hours || 0)).toFixed(2)} est.
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}