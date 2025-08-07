"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTierAccess } from "@/lib/tier-access"
import { Users, Plus, X, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface SubContractor {
  id: string
  name: string
  email: string
  phone: string
  status: string
  hourlyRate: number
  specialties: string[]
  jobsCompleted: number
  totalJobs: number
}

interface JobAssignment {
  id: string
  job_id: string
  sub_contractor_id: string
  assigned_at: string
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  admin_notes: string | null
  sub_contractor?: SubContractor
}

interface JobSubContractorAssignmentProps {
  jobId: string
}

export function JobSubContractorAssignment({ jobId }: JobSubContractorAssignmentProps) {
  const { toast } = useToast()
  const { access, userRole } = useTierAccess()
  const [subContractors, setSubContractors] = useState<SubContractor[]>([])
  const [assignments, setAssignments] = useState<JobAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedSubContractor, setSelectedSubContractor] = useState("")
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [assigning, setAssigning] = useState(false)

  // Only show for admin users with sub-contractor access
  if (userRole !== 'admin' || !access.subContractors) {
    return null
  }

  useEffect(() => {
    fetchSubContractors()
    fetchAssignments()
  }, [jobId])

  const fetchSubContractors = async () => {
    try {
      const response = await fetch('/api/sub-contractors')
      if (response.ok) {
        const data = await response.json()
        setSubContractors(data)
      } else {
        console.error('Failed to fetch sub-contractors')
      }
    } catch (error) {
      console.error('Error fetching sub-contractors:', error)
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/sub-contractors/job-assignments/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      } else {
        console.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSubContractor = async () => {
    if (!selectedSubContractor) {
      toast({
        title: "Error",
        description: "Please select a sub-contractor",
        variant: "destructive"
      })
      return
    }

    setAssigning(true)
    try {
      const response = await fetch('/api/sub-contractors/assign-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          sub_contractor_id: selectedSubContractor,
          notes: assignmentNotes
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sub-contractor assigned successfully"
        })
        setIsAssignDialogOpen(false)
        setSelectedSubContractor("")
        setAssignmentNotes("")
        fetchAssignments() // Refresh assignments
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to assign sub-contractor",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error assigning sub-contractor:', error)
      toast({
        title: "Error",
        description: "Failed to assign sub-contractor",
        variant: "destructive"
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleUpdateAssignmentStatus = async (assignmentId: string, newStatus: JobAssignment['status']) => {
    try {
      const response = await fetch(`/api/sub-contractors/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment status updated"
        })
        fetchAssignments() // Refresh assignments
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating assignment status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/sub-contractors/assignments/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment removed"
        })
        fetchAssignments() // Refresh assignments
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to remove assignment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: JobAssignment['status']) => {
    switch (status) {
      case 'assigned':
        return <Clock className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: JobAssignment['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: JobAssignment['status']) => {
    switch (status) {
      case 'assigned':
        return 'Assigned'
      case 'accepted':
        return 'Accepted'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sub-Contractor Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sub-Contractor Assignment
          </CardTitle>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Sub-Contractor</DialogTitle>
                <DialogDescription>
                  Select a sub-contractor to assign to this job.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sub-contractor">Sub-Contractor</Label>
                  <Select value={selectedSubContractor} onValueChange={setSelectedSubContractor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub-contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {subContractors
                        .filter(sub => sub.status === 'active')
                        .map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            <div className="flex flex-col">
                              <span>{sub.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ${sub.hourlyRate}/hr • {sub.jobsCompleted}/{sub.totalJobs} jobs
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any specific instructions or notes for this assignment..."
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignSubContractor} disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No sub-contractors assigned to this job</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(assignment.status)}
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusText(assignment.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">{assignment.sub_contractor?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${assignment.sub_contractor?.hourlyRate}/hr
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {assignment.status === 'assigned' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAssignmentStatus(assignment.id, 'accepted')}
                    >
                      Accept
                    </Button>
                  )}
                  {assignment.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAssignmentStatus(assignment.id, 'in_progress')}
                    >
                      Start
                    </Button>
                  )}
                  {assignment.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAssignmentStatus(assignment.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
