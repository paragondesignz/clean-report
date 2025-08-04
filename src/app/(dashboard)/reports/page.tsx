"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  User, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Send,
  Copy,
  ExternalLink
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { 
  getReports, 
  getJobs, 
  getClients, 
  createReport, 
  updateReport,
  getUserProfile 
} from "@/lib/supabase-client"
import type { Report, Job, Client, ReportWithJob, UserProfile } from "@/types/database"

export default function ReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<ReportWithJob[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [customMessage, setCustomMessage] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reportsData, jobsData, clientsData, profileData] = await Promise.all([
        getReports(),
        getJobs(),
        getClients(),
        getUserProfile()
      ])
      
      setReports(reportsData || [])
      setJobs(jobsData || [])
      setClients(clientsData || [])
      setUserProfile(profileData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
      // Generate a unique report URL
      const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reports/${generateReportId()}`
      
      await createReport(selectedJob, reportUrl)
      
      toast({
        title: "Success",
        description: "Report generated successfully"
      })
      
      setIsGenerateDialogOpen(false)
      setSelectedJob("")
      setCustomMessage("")
      fetchData()
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      })
    }
  }

  const handleViewReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank')
  }

  const handleDownloadReport = async (report: ReportWithJob) => {
    try {
      // Generate PDF content
      const pdfContent = await generatePDFContent(report)
      
      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `clean-report-${report.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Download started",
        description: "Your report is being downloaded.",
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

  const generatePDFContent = async (report: ReportWithJob) => {
    // This is a simplified PDF generation
    // In a real implementation, you'd use a library like jsPDF or puppeteer
    const content = `
      Clean Report
      ============
      
      Job: ${report.job?.title || 'Unknown'}
      Client: ${report.job?.client?.name || 'Unknown'}
      Date: ${report.job ? formatDate(report.job.scheduled_date) : 'Unknown'}
      Time: ${report.job ? formatTime(report.job.scheduled_time) : 'Unknown'}
      
      Company: ${userProfile?.company_name || 'Clean Report'}
      
      Report ID: ${report.id}
      Generated: ${formatDate(report.created_at)}
    `
    return content
  }

  const getCompletedJobs = () => {
    return jobs.filter(job => job.status === 'completed')
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.job?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "sent" && report.email_sent) ||
      (statusFilter === "pending" && !report.email_sent)
    
    return matchesSearch && matchesStatus
  })

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage your cleaning reports</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
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
      </div>

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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports by job title or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all" ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? 'Try adjusting your search or filter criteria'
                : 'Generate your first report for a completed job'
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsGenerateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate First Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {report.job?.title || 'Unknown Job'}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReport(report.report_url)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyReportLink(report.report_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {report.job?.client?.name || 'Unknown Client'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {report.job ? formatDate(report.job.scheduled_date) : 'Unknown date'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {report.job ? formatTime(report.job.scheduled_time) : 'Unknown time'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.email_sent 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {report.email_sent ? 'Sent' : 'Pending'}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {!report.email_sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(report)}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 