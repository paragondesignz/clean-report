"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText } from "lucide-react"
import { getJobs, getClients, createReport } from "@/lib/supabase-client"
import { formatDate } from "@/lib/utils"
import type { Job, Client } from "@/types/database"

interface JobWithClient extends Job {
  client?: Client
}

export default function NewReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedJob, setSelectedJob] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [jobsData, clientsData] = await Promise.all([
        getJobs(),
        getClients()
      ])
      
      // Add client info to jobs
      const jobsWithClients = jobsData.map(job => ({
        ...job,
        client: clientsData.find(client => client.id === job.client_id)
      }))
      
      setJobs(jobsWithClients)
      setClients(clientsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    }
  }, [toast])

  useEffect(() => {
    fetchData()
    // Pre-fill job if passed in URL params
    const jobId = searchParams.get('job')
    if (jobId) {
      setSelectedJob(jobId)
    }
  }, [searchParams, fetchData])

  const getCompletedJobs = () => {
    return jobs.filter(job => job.status === 'completed')
  }

  const handleGenerateReport = async () => {
    if (!selectedJob) {
      toast({
        title: "Error",
        description: "Please select a job",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const reportId = generateReportId()
      const reportUrl = `${window.location.origin}/reports/${reportId}`
      
      await createReport(selectedJob, reportUrl)
      
      toast({
        title: "Success",
        description: "Report generated successfully"
      })
      
      router.push("/reports")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateReportId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/reports")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Generate New Report</h1>
            <p className="text-slate-600">Create a professional report for a completed job</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
          <CardDescription>
            Select a completed job and customize your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="job">Select Job</Label>
              <Select
                value={selectedJob}
                onValueChange={setSelectedJob}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a completed job" />
                </SelectTrigger>
                <SelectContent>
                  {getCompletedJobs().map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.client?.name} ({formatDate(job.scheduled_date)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to the report..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/reports")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading || !selectedJob}
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 