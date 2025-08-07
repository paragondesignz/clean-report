"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, FileText, Printer, Globe } from 'lucide-react'
// Import only jsPDF methods to avoid server-side dependencies
import { jsPDF } from 'jspdf'

interface ClientPDFGeneratorProps {
  reportData: any
  jobTitle?: string
}

export function ClientPDFGenerator({ reportData, jobTitle = 'Job Report' }: ClientPDFGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const generateClientSidePDF = async () => {
    try {
      setGenerating(true)
      
      // Generate PDF using jsPDF on client-side
      const doc = generateClientPDF(reportData, jobTitle)
      
      // Download the PDF
      const fileName = `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`
      doc.save(fileName)
      
      toast({
        title: "PDF Generated!",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      console.error('Client-side PDF generation error:', error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const generatePrintableHTML = () => {
    try {
      const htmlContent = generateHTMLContent(reportData)
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        toast({
          title: "Print Preview Ready",
          description: "Your report has opened in a new tab for printing.",
        })
      }
    } catch (error) {
      console.error('Print generation error:', error)
      toast({
        title: "Preview Failed",
        description: "Unable to generate print preview.",
        variant: "destructive"
      })
    }
  }

  const generateHTMLReport = () => {
    try {
      const htmlContent = generateHTMLContent(reportData)
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      toast({
        title: "HTML Report Downloaded",
        description: "Your HTML report has been saved successfully.",
      })
    } catch (error) {
      console.error('HTML generation error:', error)
      toast({
        title: "Download Failed",
        description: "Unable to generate HTML report.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2 mb-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <span className="font-medium">Alternative PDF Generation</span>
        <Badge variant="outline">Client-side</Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          onClick={generateClientSidePDF}
          disabled={generating}
          variant="outline"
          size="sm"
          className="flex items-center justify-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{generating ? 'Generating...' : 'Download PDF'}</span>
        </Button>
        
        <Button
          onClick={generatePrintableHTML}
          variant="outline"
          size="sm"
          className="flex items-center justify-center space-x-2"
        >
          <Printer className="h-4 w-4" />
          <span>Print Preview</span>
        </Button>
        
        <Button
          onClick={generateHTMLReport}
          variant="outline"
          size="sm"
          className="flex items-center justify-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>Save HTML</span>
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        These options work entirely in your browser and don't require server processing.
      </p>
    </div>
  )
}

// Local PDF generation functions to avoid server-side dependencies
function generateClientPDF(reportData: any, jobTitle: string): jsPDF {
  const { job, tasks, photos, notes, configuration } = reportData

  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm'
  })

  let yPosition = 20

  // Company Header
  doc.setFontSize(20)
  doc.setTextColor(51, 122, 183) // Bootstrap primary blue
  doc.text(configuration?.company_name || 'Your Company', 20, yPosition)
  yPosition += 15

  // Job Title
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`Job Report: ${job?.title || 'Untitled Job'}`, 20, yPosition)
  yPosition += 10

  // Job Details
  yPosition = addJobDetailsClient(doc, job, yPosition)
  
  // Tasks Section
  if (tasks && tasks.length > 0) {
    yPosition = addTasksSectionClient(doc, tasks, yPosition)
  }

  // Notes Section
  if (notes && notes.length > 0) {
    yPosition = addNotesSectionClient(doc, notes, yPosition)
  }

  // Footer
  addFooterClient(doc, configuration)

  return doc
}

function addJobDetailsClient(doc: jsPDF, job: any, yPos: number): number {
  doc.setFontSize(12)
  doc.text('Job Details:', 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.text(`Client: ${job?.client?.name || 'N/A'}`, 20, yPos)
  yPos += 6
  doc.text(`Address: ${job?.client?.address || 'N/A'}`, 20, yPos)
  yPos += 6
  doc.text(`Status: ${job?.status || 'N/A'}`, 20, yPos)
  yPos += 6
  doc.text(`Date: ${job?.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A'}`, 20, yPos)
  yPos += 10

  if (job?.description) {
    doc.text('Description:', 20, yPos)
    yPos += 6
    const lines = doc.splitTextToSize(job.description, 170)
    doc.text(lines, 20, yPos)
    yPos += lines.length * 6 + 10
  }

  return yPos
}

function addTasksSectionClient(doc: jsPDF, tasks: any[], yPos: number): number {
  doc.setFontSize(12)
  doc.text('Tasks:', 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  tasks.forEach((task, index) => {
    if (yPos > 280) {
      doc.addPage()
      yPos = 20
    }

    doc.text(`${index + 1}. ${task.name} (${task.status})`, 20, yPos)
    yPos += 6
    if (task.description) {
      const lines = doc.splitTextToSize(task.description, 170)
      doc.text(lines, 25, yPos)
      yPos += lines.length * 6 + 3
    }
  })

  return yPos + 10
}

function addNotesSectionClient(doc: jsPDF, notes: any[], yPos: number): number {
  doc.setFontSize(12)
  doc.text('Notes:', 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  notes.forEach(note => {
    if (yPos > 280) {
      doc.addPage()
      yPos = 20
    }

    doc.text(note.created_at ? new Date(note.created_at).toLocaleDateString() : '', 20, yPos)
    yPos += 6
    const lines = doc.splitTextToSize(note.content, 170)
    doc.text(lines, 20, yPos)
    yPos += lines.length * 6 + 5
  })

  return yPos
}

function addFooterClient(doc: jsPDF, config: any) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(`Generated by ${config?.company_name || 'Your Company'}`, 20, pageHeight - 10)
}

function generateHTMLContent(reportData: any): string {
  const { job, tasks, photos, notes, configuration } = reportData
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Job Report - ${job?.title}</title>
      <style>
          ${getPrintCSS(configuration)}
      </style>
  </head>
  <body>
      <div class="report">
          <header class="report-header">
              <h1>${configuration?.company_name || 'Your Company'}</h1>
              <h2>Job Report: ${job?.title || 'Untitled Job'}</h2>
              <div class="report-meta">
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Client:</strong> ${job?.client?.name || 'N/A'}</p>
                  <p><strong>Address:</strong> ${job?.client?.address || 'N/A'}</p>
              </div>
          </header>

          <main class="report-content">
              <section class="job-details">
                  <h3>Job Details</h3>
                  <div class="detail-grid">
                      <div><strong>Status:</strong> ${job?.status || 'N/A'}</div>
                      <div><strong>Priority:</strong> ${job?.priority || 'Normal'}</div>
                      <div><strong>Scheduled:</strong> ${job?.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A'}</div>
                      <div><strong>Duration:</strong> ${job?.estimated_duration ? `${job.estimated_duration} hours` : 'N/A'}</div>
                  </div>
                  ${job?.description ? `<p class="job-description">${job.description}</p>` : ''}
              </section>

              ${tasks && tasks.length > 0 ? `
              <section class="tasks-section">
                  <h3>Tasks Completed</h3>
                  <div class="tasks-grid">
                      ${tasks.map((task: any) => `
                          <div class="task-item">
                              <h4>${task.name}</h4>
                              <p class="task-status status-${task.status}">${task.status}</p>
                              ${task.description ? `<p>${task.description}</p>` : ''}
                              ${task.time_spent ? `<p class="time-spent">Time: ${task.time_spent} minutes</p>` : ''}
                          </div>
                      `).join('')}
                  </div>
              </section>
              ` : ''}

              ${notes && notes.length > 0 ? `
              <section class="notes-section">
                  <h3>Notes</h3>
                  <div class="notes-list">
                      ${notes.map((note: any) => `
                          <div class="note-item">
                              <div class="note-meta">
                                  <strong>${note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</strong>
                              </div>
                              <p>${note.content}</p>
                          </div>
                      `).join('')}
                  </div>
              </section>
              ` : ''}

              ${photos && photos.length > 0 ? `
              <section class="photos-section">
                  <h3>Photos</h3>
                  <div class="photos-grid">
                      ${photos.slice(0, 12).map((photo: any) => `
                          <div class="photo-item">
                              <img src="${photo.file_path}" alt="Job photo" />
                              ${photo.description ? `<p>${photo.description}</p>` : ''}
                          </div>
                      `).join('')}
                  </div>
              </section>
              ` : ''}
          </main>

          <footer class="report-footer">
              <p>Generated on ${new Date().toLocaleDateString()} by ${configuration?.company_name || 'Your Company'}</p>
              <div class="signature-area">
                  <div class="signature-line">
                      <p>Technician Signature: ________________________</p>
                  </div>
                  <div class="signature-line">
                      <p>Customer Signature: ________________________</p>
                  </div>
              </div>
          </footer>
      </div>

      <script>
          // Auto-print when ready
          window.onload = function() {
              setTimeout(function() {
                  window.print();
              }, 500);
          };
      </script>
  </body>
  </html>
  `
}

function getPrintCSS(config: any): string {
  return `
    @media print {
      body { margin: 0; }
      .report { page-break-inside: avoid; }
    }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .report-header {
      text-align: center;
      border-bottom: 3px solid ${config?.primary_color || '#3B82F6'};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .report-header h1 {
      color: ${config?.primary_color || '#3B82F6'};
      margin: 0;
      font-size: 24px;
    }
    
    .report-header h2 {
      margin: 10px 0;
      font-size: 18px;
      color: #666;
    }
    
    .report-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    
    .report-meta p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    section {
      margin-bottom: 30px;
    }
    
    h3 {
      color: ${config?.primary_color || '#3B82F6'};
      border-bottom: 2px solid #eee;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .job-description {
      background: #f9f9f9;
      padding: 15px;
      border-left: 4px solid ${config?.primary_color || '#3B82F6'};
      margin: 15px 0;
    }
    
    .tasks-grid {
      display: grid;
      gap: 15px;
    }
    
    .task-item {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid ${config?.accent_color || '#10B981'};
    }
    
    .task-item h4 {
      margin: 0 0 10px 0;
      color: #333;
    }
    
    .task-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-completed { background: #d4edda; color: #155724; }
    .status-in_progress { background: #fff3cd; color: #856404; }
    .status-pending { background: #f8d7da; color: #721c24; }
    
    .time-spent {
      font-style: italic;
      color: #666;
      margin-top: 10px;
    }
    
    .notes-list {
      display: grid;
      gap: 15px;
    }
    
    .note-item {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }
    
    .note-meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .photo-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .photo-item p {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .report-footer {
      border-top: 2px solid #eee;
      padding-top: 20px;
      margin-top: 40px;
      text-align: center;
    }
    
    .signature-area {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
    }
    
    .signature-line p {
      border-bottom: 1px solid #333;
      padding-bottom: 20px;
      margin-bottom: 5px;
    }
  `
}