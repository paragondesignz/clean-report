'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { UserIcon, Clock, DollarSign, Trash2 } from 'lucide-react'
import {
  assignWorkerToJob,
  removeWorkerFromJob,
  getJobWorkerAssignments,
  getUserHourlyRate
} from '@/lib/supabase-client'
import type { JobWorkerAssignment, SubContractor } from '@/types/database'

interface WorkerAssignmentProps {
  jobId: string
  onAssignmentChange?: () => void
}

interface Assignment extends JobWorkerAssignment {
  sub_contractors?: SubContractor
}

export function WorkerAssignment({ jobId, onAssignmentChange }: WorkerAssignmentProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subContractors, setSubContractors] = useState<SubContractor[]>([])
  const [userHourlyRate, setUserHourlyRate] = useState(0)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedWorkerType, setSelectedWorkerType] = useState<'owner' | 'sub_contractor'>('owner')
  const [selectedSubContractor, setSelectedSubContractor] = useState('')
  const [assignedHours, setAssignedHours] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [jobId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [assignmentsData, hourlyRate] = await Promise.all([
        getJobWorkerAssignments(jobId),
        getUserHourlyRate()
      ])
      
      setAssignments(assignmentsData)
      setSubContractors([]) // TODO: Implement sub-contractors functionality
      setUserHourlyRate(hourlyRate)
    } catch (error) {
      console.error('Error loading worker assignment data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load worker assignments',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignWorker = async () => {
    if (!assignedHours || parseFloat(assignedHours) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid assigned hours',
        variant: 'destructive'
      })
      return
    }

    if (selectedWorkerType === 'sub_contractor' && !selectedSubContractor) {
      toast({
        title: 'Error',
        description: 'Please select a sub-contractor',
        variant: 'destructive'
      })
      return
    }

    try {
      setAssigning(true)
      
      let workerId, hourlyRate
      
      if (selectedWorkerType === 'owner') {
        workerId = 'owner' // Use 'owner' as the worker_id for the account owner
        hourlyRate = userHourlyRate
      } else {
        const subContractor = subContractors.find(sc => sc.id === selectedSubContractor)
        if (!subContractor) {
          throw new Error('Sub-contractor not found')
        }
        workerId = subContractor.id
        hourlyRate = subContractor.hourly_rate
      }

      // Check if worker is already assigned
      const existingAssignment = assignments.find(a => 
        (a.worker_type === selectedWorkerType) && 
        (selectedWorkerType === 'owner' ? a.worker_id === 'owner' : a.worker_id === workerId)
      )

      if (existingAssignment) {
        toast({
          title: 'Error',
          description: 'This worker is already assigned to this job',
          variant: 'destructive'
        })
        return
      }

      await assignWorkerToJob({
        job_id: jobId,
        worker_id: workerId,
        worker_type: selectedWorkerType,
        hourly_rate: hourlyRate,
        assigned_hours: parseFloat(assignedHours)
      })

      toast({
        title: 'Success',
        description: 'Worker assigned successfully'
      })

      // Reset form
      setSelectedWorkerType('owner')
      setSelectedSubContractor('')
      setAssignedHours('')
      
      // Reload data
      await loadData()
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning worker:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign worker',
        variant: 'destructive'
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveWorker = async (assignmentId: string) => {
    try {
      await removeWorkerFromJob(assignmentId)
      
      toast({
        title: 'Success',
        description: 'Worker removed successfully'
      })
      
      await loadData()
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error removing worker:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove worker',
        variant: 'destructive'
      })
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

  if (loading) {
    return <div className="flex justify-center p-4">Loading worker assignments...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Assign Workers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="worker-type">Worker Type</Label>
              <Select value={selectedWorkerType} onValueChange={(value) => setSelectedWorkerType(value as 'owner' | 'sub_contractor')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">You (Owner) - ${userHourlyRate}/hr</SelectItem>
                  <SelectItem value="sub_contractor">Sub-contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedWorkerType === 'sub_contractor' && (
              <div>
                <Label htmlFor="sub-contractor">Sub-contractor</Label>
                <Select value={selectedSubContractor} onValueChange={setSelectedSubContractor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {subContractors.map((sc) => (
                      <SelectItem key={sc.id} value={sc.id}>
                        {sc.first_name} {sc.last_name} - ${sc.hourly_rate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="assigned-hours">Assigned Hours</Label>
              <Input
                id="assigned-hours"
                type="number"
                step="0.5"
                min="0"
                value={assignedHours}
                onChange={(e) => setAssignedHours(e.target.value)}
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          <Button 
            onClick={handleAssignWorker} 
            disabled={assigning}
            className="w-full"
          >
            {assigning ? 'Assigning...' : 'Assign Worker'}
          </Button>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{getWorkerName(assignment)}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${assignment.hourly_rate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {assignment.assigned_hours || 0}h assigned
                        </span>
                        {assignment.actual_hours > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assignment.actual_hours.toFixed(2)}h actual
                          </span>
                        )}
                      </div>
                    </div>
                    {assignment.is_clocked_in && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Clocked In
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveWorker(assignment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}