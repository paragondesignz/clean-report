"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  FileText, 
  Eye, 
  Download, 
  Mail, 
  Calendar, 
  Clock, 
  Plus,
  Send,
  Copy,
  Building2,
  DollarSign,
  Settings,
  Trash2,
  Image,
  CheckCircle
} from "lucide-react"
import { formatDate, formatTime, formatListDate } from "@/lib/utils"
import { 
  getReports, 
  getJobs, 
  getClients, 
  createReport, 
  updateReport,
  getUserProfile 
} from "@/lib/supabase-client"
import { downloadBrandedPDF } from "@/lib/pdf-generator"
import { DataTable } from "@/components/ui/data-table"
import { PhotoSelector } from "@/components/reports/photo-selector"
import { TaskSelector } from "@/components/reports/task-selector"
import { ReportConfiguration } from "@/components/reports/report-configuration"
import { ReportService } from "@/lib/report-service"
import { ClientPDFGenerator } from '@/components/reports/pdf-generator-client'
import type { Report, Job, Client, ReportWithJob, UserProfile } from "@/types/database"

export default function ReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<ReportWithJob[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [customMessage, setCustomMessage] = useState("")
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [showFallbackPDF, setShowFallbackPDF] = useState(false)
  const [fallbackReportData, setFallbackReportData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<'select' | 'photos' | 'tasks' | 'generate'>('select')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables')
      }
      
      console.log('Fetching reports data...')
      const [reportsData, jobsData, clientsData, profileData] = await Promise.all([
        getReports(),
        getJobs(),
        getClients(),
        getUserProfile()
      ])
      
      console.log('Data fetched successfully:', {
        reports: reportsData?.length || 0,
        jobs: jobsData?.length || 0,
        clients: clientsData?.length || 0,
        profile: !!profileData
      })
      
      setReports(reportsData || [])
      setJobs(jobsData || [])
      setClients(clientsData || [])
      setUserProfile(profileData)
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load reports data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerateReport = async () => {
    if (!selectedJob) {
      toast({
        title: "Error",
        description: "Please select a job to generate a report for",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // Use the enhanced report service
      const reportService = new ReportService(user!.id)
      const { reportUrl, reportId } = await reportService.generateReport(selectedJob)
      
      toast({
        title: "Success",
        description: "Report generated successfully!",
      })
      
      setIsGenerateDialogOpen(false)
      setSelectedJob("")
      setCustomMessage("")
      fetchData() // Refresh the reports list
      
      // Open the report in a new tab
      console.log('Opening report URL:', reportUrl)
      
      // Handle data URLs specially
      if (reportUrl.startsWith('data:')) {
        if (reportUrl.startsWith('data:application/pdf')) {
          // For PDF data URLs, trigger download
          const link = document.createElement('a')
          link.href = reportUrl
          link.download = `report-${Date.now()}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          toast({
            title: "PDF Downloaded",
            description: "Your PDF report has been downloaded successfully!",
          })
        } else {
          // For HTML data URLs, open in new window
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(atob(reportUrl.split(',')[1]))
            newWindow.document.close()
          } else {
            // Fallback: download as HTML file
            const link = document.createElement('a')
            link.href = reportUrl
            link.download = `report-${Date.now()}.html`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }
      } else {
        window.open(reportUrl, '_blank')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      
      // Try to prepare fallback data for client-side generation
      try {
        const reportService = new ReportService(user!.id)
        const reportData = await reportService.prepareReportData(selectedJob)
        
        setFallbackReportData(reportData)
        setShowFallbackPDF(true)
        setIsGenerateDialogOpen(false)
        
        toast({
          title: "Server Generation Failed",
          description: "Using alternative PDF generation methods...",
          variant: "default"
        })
      } catch (fallbackError) {
        console.error('Fallback data preparation failed:', fallbackError)
        toast({
          title: "Error",
          description: "Failed to generate report. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedReportBuilder = () => {
    setShowReportBuilder(true)
    setCurrentStep('select')
  }

  const handleNextStep = () => {
    switch (currentStep) {
      case 'select':
        if (selectedJob) {
          setCurrentStep('photos')
        } else {
          toast({
            title: "Error",
            description: "Please select a job first",
            variant: "destructive"
          })
        }
        break
      case 'photos':
        setCurrentStep('tasks')
        break
      case 'tasks':
        setCurrentStep('generate')
        break
      case 'generate':
        handleGenerateReport()
        break
    }
  }

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'photos':
        setCurrentStep('select')
        break
      case 'tasks':
        setCurrentStep('photos')
        break
      case 'generate':
        setCurrentStep('tasks')
        break
    }
  }

  const handleViewReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank')
  }

  const handleDownloadReport = async (report: ReportWithJob) => {
    try {
      // Get client data for the report
      const client = clients.find(c => c.id === report.job?.client_id)
      
      if (!report.job || !client || !userProfile) {
        toast({
          title: "Error",
          description: "Missing data for report generation",
          variant: "destructive"
        })
        return
      }
      
      // Generate branded PDF
      downloadBrandedPDF({
        job: report.job,
        client,
        userProfile,
        report
      })
      
      toast({
        title: "Download started",
        description: "Your branded PDF report is being downloaded.",
      })
    } catch (error) {
      console.error('Error downloading report:', error)
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      })
    }
  }

  const handleResendEmail = async (report: ReportWithJob) => {
    try {
      // Update report as sent
      await updateReport(report.id, {
        email_sent: true,
        sent_at: new Date().toISOString()
      })
      
      // TODO: Send actual email via Resend API
      toast({
        title: "Email sent",
        description: "The report has been sent to the client.",
      })
      
      fetchData()
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyReportLink = (reportUrl: string) => {
    navigator.clipboard.writeText(reportUrl)
    toast({
      title: "Link copied",
      description: "Report link copied to clipboard",
    })
  }

  const generateReportId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }



  const getCompletedJobs = () => {
    return jobs.filter(job => job.status === 'completed')
  }

  const getReportStatus = (emailSent: boolean) => {
    return emailSent ? 'Sent' : 'Pending'
  }

  const getStatusColor = (emailSent: boolean) => {
    return emailSent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const getReportIcon = (emailSent: boolean) => {
    return emailSent ? <Mail className="h-4 w-4 text-green-600" /> : <FileText className="h-4 w-4 text-yellow-600" />
  }

  const getReportValue = (report: ReportWithJob) => {
    // Mock value calculation - in real app this would come from job pricing
    return `$${(Math.random() * 300 + 100).toFixed(0)}`
  }

  const getLastUpdated = (report: ReportWithJob) => {
    // Mock last updated - in real app this would be actual timestamp
    const days = Math.floor(Math.random() * 14)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const stats = {
    total: reports.length,
    sent: reports.filter(report => report.email_sent).length,
    pending: reports.filter(report => !report.email_sent).length,
    thisMonth: reports.filter(report => {
      const reportDate = new Date(report.created_at)
      const now = new Date()
      return reportDate.getMonth() === now.getMonth() && 
             reportDate.getFullYear() === now.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Prepare data for DataTable
  const tableData = reports.map(report => ({
    id: report.id,
    title: report.job?.title || 'Unknown Job',
    client: report.job?.client?.name || 'Unknown Client',
    status: report.email_sent,
    scheduledDate: report.job ? formatListDate(report.job.scheduled_date) : 'Unknown date',
    scheduledTime: report.job ? formatTime(report.job.scheduled_time) : 'Unknown time',
    value: getReportValue(report),
    lastUpdated: getLastUpdated(report),
    reportUrl: report.report_url,
    emailSent: report.email_sent,
    job: report.job
  }))

  // Define columns for DataTable
  const columns = [
    {
      key: 'title',
      label: 'Report',
      sortable: true,
      width: '300px',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md flex-shrink-0">
            {getReportIcon(row.emailSent)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">Professional cleaning report</p>
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      width: '160px',
      render: (value: string, row: any) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">Report recipient</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value: boolean) => (
        <Badge className={getStatusColor(value)} variant="outline">
          {getReportStatus(value)}
        </Badge>
      )
    },
    {
      key: 'scheduledDate',
      label: 'Job Date',
      sortable: true,
      width: '120px',
      render: (value: string, row: any) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">{row.scheduledTime}</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-green-600">{value}</span>
        </div>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {value}
        </div>
      )
    }
  ]


  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Reports</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">
              Delivered to clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Reports generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <DataTable
        title="Reports"
        description="Generate and manage your cleaning reports"
        data={tableData}
        columns={columns}
        addButton={{
          label: "Generate Report",
          icon: Plus,
          onClick: () => setIsGenerateDialogOpen(true)
        }}
        onRowClick={(row) => row.reportUrl}
        searchPlaceholder="Search reports by job title or client name..."
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'true', label: 'Sent' },
            { value: 'false', label: 'Pending' }
          ]}
        ]}
        customActions={[
          {
            label: 'View',
            icon: Eye,
            onClick: (row) => handleViewReport(row.reportUrl)
          },
          {
            label: 'Download',
            icon: Download,
            onClick: (row) => handleDownloadReport({ id: row.id, job: row.job, report_url: row.reportUrl, email_sent: row.emailSent } as ReportWithJob)
          },
          {
            label: 'Copy Link',
            icon: Copy,
            onClick: (row) => handleCopyReportLink(row.reportUrl)
          },
          {
            label: 'Resend Email',
            icon: Send,
            onClick: (row) => handleResendEmail({ id: row.id, job: row.job, report_url: row.reportUrl, email_sent: row.emailSent } as ReportWithJob),
            show: (row) => !row.emailSent
          }
        ]}
      />

      {/* Generate Report Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Create a professional report for a completed job
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="job">Select Job</Label>
              <Select
                value={selectedJob}
                onValueChange={setSelectedJob}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a completed job" />
                </SelectTrigger>
                <SelectContent>
                  {getCompletedJobs().map((job) => {
                    const client = clients.find(c => c.id === job.client_id)
                    return (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {client?.name} ({formatDate(job.scheduled_date)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to the report..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Report Builder Dialog */}
      <Dialog open={showReportBuilder} onOpenChange={setShowReportBuilder}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Report Builder</DialogTitle>
            <DialogDescription>
              Customize your report with photo selection and task filtering
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'select' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`text-sm ${currentStep === 'select' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  Select Job
                </span>
                <div className="w-8 h-1 bg-gray-200"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'photos' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-sm ${currentStep === 'photos' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  Photos
                </span>
                <div className="w-8 h-1 bg-gray-200"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'tasks' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`text-sm ${currentStep === 'tasks' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  Tasks
                </span>
                <div className="w-8 h-1 bg-gray-200"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'generate' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  4
                </div>
                <span className={`text-sm ${currentStep === 'generate' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  Generate
                </span>
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 'select' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-select">Select Job</Label>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a completed job" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCompletedJobs().map((job) => {
                        const client = clients.find(c => c.id === job.client_id)
                        return (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title} - {client?.name} ({formatDate(job.scheduled_date)})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 'photos' && selectedJob && (
              <PhotoSelector jobId={selectedJob} />
            )}

            {currentStep === 'tasks' && selectedJob && (
              <TaskSelector jobId={selectedJob} />
            )}

            {currentStep === 'generate' && selectedJob && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ready to Generate Report</CardTitle>
                    <CardDescription>
                      Review your selections and generate the final report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Selected Job:</span>
                        <span className="font-medium">
                          {jobs.find(j => j.id === selectedJob)?.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Photos Included:</span>
                        <span className="font-medium">Custom selection</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tasks Included:</span>
                        <span className="font-medium">Custom selection</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowReportBuilder(false)}
            >
              Cancel
            </Button>
            {currentStep !== 'select' && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePreviousStep}
              >
                Previous
              </Button>
            )}
            <Button 
              onClick={handleNextStep}
              disabled={currentStep === 'select' && !selectedJob}
            >
              {currentStep === 'generate' ? 'Generate Report' : 'Next'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Configuration Dialog */}
      <Dialog open={showConfiguration} onOpenChange={setShowConfiguration}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Configuration</DialogTitle>
            <DialogDescription>
              Customize your report appearance and content settings
            </DialogDescription>
          </DialogHeader>
          
          <ReportConfiguration />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowConfiguration(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fallback PDF Generation Dialog */}
      <Dialog open={showFallbackPDF} onOpenChange={setShowFallbackPDF}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Alternative PDF Generation</DialogTitle>
            <DialogDescription>
              The server-side PDF generation failed. You can use these client-side alternatives to generate your report.
            </DialogDescription>
          </DialogHeader>
          
          {fallbackReportData && (
            <div className="py-4">
              <ClientPDFGenerator 
                reportData={fallbackReportData}
                jobTitle={jobs.find(j => j.id === selectedJob)?.title || 'Job Report'}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowFallbackPDF(false)
                setFallbackReportData(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 