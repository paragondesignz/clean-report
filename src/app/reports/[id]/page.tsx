"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  CheckCircle,
  Sparkles,
  Star
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
import type { Report, Job, Client, UserProfile } from "@/types/database"

export default function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [report, setReport] = useState<Report | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { id } = await params
        
        // Fetch report data
        const { data: reportData, error: reportError } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single()

        if (reportError) {
          setError('Report not found')
          return
        }

        setReport(reportData)

        // Fetch job data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', reportData.job_id)
          .single()

        if (jobError) {
          setError('Job not found')
          return
        }

        setJob(jobData)

        // Fetch client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', jobData.client_id)
          .single()

        if (clientError) {
          setError('Client not found')
          return
        }

        setClient(clientData)

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', jobData.user_id)
          .single()

        setUserProfile(profileData)

      } catch (error) {
        console.error('Error fetching report:', error)
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params])

  const handleDownload = () => {
    // Generate and download PDF
    const content = generatePDFContent()
    const blob = new Blob([content], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clean-report-${report?.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generatePDFContent = () => {
    return `
      ${userProfile?.company_name || 'Clean Report'}
      ===========================================
      
      Cleaning Service Report
      
      Job Details:
      - Service: ${job?.title || 'Unknown'}
      - Date: ${job ? formatDate(job.scheduled_date) : 'Unknown'}
      - Time: ${job ? formatTime(job.scheduled_time) : 'Unknown'}
      - Status: ${job?.status || 'Unknown'}
      
      Client Information:
      - Name: ${client?.name || 'Unknown'}
      - Email: ${client?.email || 'Unknown'}
      - Phone: ${client?.phone || 'Unknown'}
      - Address: ${client?.address || 'Unknown'}
      
      Report Information:
      - Report ID: ${report?.id || 'Unknown'}
      - Generated: ${report ? formatDate(report.created_at) : 'Unknown'}
      - Email Sent: ${report?.email_sent ? 'Yes' : 'No'}
      
      Thank you for choosing our services!
    `
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!report || !job || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-600">The requested report could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile?.company_name || 'Clean Report'}
            </h1>
          </div>
          <p className="text-gray-600">Professional Cleaning Service Report</p>
        </div>

        {/* Main Report Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription>Cleaning Service Report</CardDescription>
              </div>
              <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Date: {formatDate(job.scheduled_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Time: {formatTime(job.scheduled_time)}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
            </div>

            <Separator />

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{client.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{client.address}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Report Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Report Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Report ID:</span>
                  <span className="text-sm text-gray-900">{report.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Generated:</span>
                  <span className="text-sm text-gray-900">{formatDate(report.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Email Status:</span>
                  <div className="flex items-center space-x-1">
                    {report.email_sent ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Sent</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                {report.email_sent && report.sent_at && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Sent:</span>
                    <span className="text-sm text-gray-900">{formatDate(report.sent_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Rate Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Thank you for choosing {userProfile?.company_name || 'Clean Report'}!</p>
          <p className="mt-1">For questions or concerns, please contact us.</p>
        </div>
      </div>
    </div>
  )
} 