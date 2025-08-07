// Separate server and client imports to avoid bundling issues
import { jsPDF } from 'jspdf'
// PDFKit import is handled dynamically in server-side methods

export interface ReportData {
  job: any
  tasks: any[]
  photos: any[]
  notes: any[]
  configuration: any
}

export class AdvancedPDFGenerator {
  /**
   * Server-side PDF generation using PDFKit
   * Works great in serverless environments
   */
  static async generateServerPDF(reportData: ReportData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Dynamic import for server-side only
        const PDFDocument = (await import('pdfkit')).default
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        })

        const chunks: Buffer[] = []
        doc.on('data', chunk => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const { job, tasks, photos, notes, configuration } = reportData

        // Generate PDF content
        this.addHeader(doc, job, configuration)
        this.addJobDetails(doc, job)
        this.addTasksSection(doc, tasks)
        this.addNotesSection(doc, notes)
        this.addFooter(doc, configuration)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Client-side PDF generation using jsPDF
   * Perfect for browser environments
   */
  static generateClientPDF(reportData: ReportData): jsPDF {
    const { job, tasks, photos, notes, configuration } = reportData

    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    })

    let yPosition = 20

    // Company Header
    doc.setFontSize(20)
    doc.setTextColor(51, 122, 183) // Bootstrap primary blue
    doc.text(configuration.company_name || 'Your Company', 20, yPosition)
    yPosition += 15

    // Job Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(`Job Report: ${job.title || 'Untitled Job'}`, 20, yPosition)
    yPosition += 10

    // Job Details
    yPosition = this.addJobDetailsClient(doc, job, yPosition)
    
    // Tasks Section
    if (tasks && tasks.length > 0) {
      yPosition = this.addTasksSectionClient(doc, tasks, yPosition)
    }

    // Notes Section
    if (notes && notes.length > 0) {
      yPosition = this.addNotesSectionClient(doc, notes, yPosition)
    }

    // Footer
    this.addFooterClient(doc, configuration)

    return doc
  }

  /**
   * Generate HTML for browser printing or HTML-to-PDF services
   */
  static generatePrintableHTML(reportData: ReportData): string {
    const { job, tasks, photos, notes, configuration } = reportData
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Job Report - ${job.title}</title>
        <style>
            ${this.getPrintCSS(configuration)}
        </style>
    </head>
    <body>
        <div class="report">
            <header class="report-header">
                <h1>${configuration.company_name || 'Your Company'}</h1>
                <h2>Job Report: ${job.title || 'Untitled Job'}</h2>
                <div class="report-meta">
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Client:</strong> ${job.client?.name || 'N/A'}</p>
                    <p><strong>Address:</strong> ${job.client?.address || 'N/A'}</p>
                </div>
            </header>

            <main class="report-content">
                <section class="job-details">
                    <h3>Job Details</h3>
                    <div class="detail-grid">
                        <div><strong>Status:</strong> ${job.status || 'N/A'}</div>
                        <div><strong>Priority:</strong> ${job.priority || 'Normal'}</div>
                        <div><strong>Scheduled:</strong> ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A'}</div>
                        <div><strong>Duration:</strong> ${job.estimated_duration ? `${job.estimated_duration} hours` : 'N/A'}</div>
                    </div>
                    ${job.description ? `<p class="job-description">${job.description}</p>` : ''}
                </section>

                ${tasks.length > 0 ? `
                <section class="tasks-section">
                    <h3>Tasks Completed</h3>
                    <div class="tasks-grid">
                        ${tasks.map(task => `
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

                ${notes.length > 0 ? `
                <section class="notes-section">
                    <h3>Notes</h3>
                    <div class="notes-list">
                        ${notes.map(note => `
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

                ${photos.length > 0 ? `
                <section class="photos-section">
                    <h3>Photos</h3>
                    <div class="photos-grid">
                        ${photos.slice(0, 12).map(photo => `
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
                <p>Generated on ${new Date().toLocaleDateString()} by ${configuration.company_name || 'Your Company'}</p>
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

  // Server-side PDFKit helper methods
  private static addHeader(doc: any, job: any, config: any) {
    doc.fontSize(20)
      .fillColor(config.primary_color || '#3B82F6')
      .text(config.company_name || 'Your Company', 50, 50)

    doc.fontSize(16)
      .fillColor('#000')
      .text(`Job Report: ${job.title || 'Untitled Job'}`, 50, 80)

    doc.fontSize(10)
      .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 105)
  }

  private static addJobDetails(doc: any, job: any) {
    let yPos = 130

    doc.fontSize(14).text('Job Details', 50, yPos)
    yPos += 20

    doc.fontSize(10)
    doc.text(`Client: ${job.client?.name || 'N/A'}`, 50, yPos)
    yPos += 15
    doc.text(`Address: ${job.client?.address || 'N/A'}`, 50, yPos)
    yPos += 15
    doc.text(`Status: ${job.status || 'N/A'}`, 50, yPos)
    yPos += 15
    doc.text(`Scheduled: ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A'}`, 50, yPos)

    if (job.description) {
      yPos += 20
      doc.text('Description:', 50, yPos)
      yPos += 15
      doc.text(job.description, 50, yPos, { width: 500 })
    }
  }

  private static addTasksSection(doc: any, tasks: any[]) {
    if (!tasks.length) return

    let yPos = 300

    doc.fontSize(14).text('Tasks Completed', 50, yPos)
    yPos += 20

    tasks.forEach((task, index) => {
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      doc.fontSize(12).text(`${index + 1}. ${task.name}`, 50, yPos)
      yPos += 15
      doc.fontSize(10).text(`Status: ${task.status}`, 70, yPos)
      yPos += 12

      if (task.description) {
        doc.text(task.description, 70, yPos, { width: 450 })
        yPos += 15
      }
      yPos += 10
    })
  }

  private static addNotesSection(doc: any, notes: any[]) {
    if (!notes.length) return

    let yPos = 500

    doc.fontSize(14).text('Notes', 50, yPos)
    yPos += 20

    notes.forEach(note => {
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      doc.fontSize(10)
        .text(note.created_at ? new Date(note.created_at).toLocaleDateString() : '', 50, yPos)
      yPos += 12
      doc.text(note.content, 50, yPos, { width: 500 })
      yPos += 20
    })
  }

  private static addFooter(doc: any, config: any) {
    doc.fontSize(8)
      .fillColor('#666')
      .text(`Generated by ${config.company_name || 'Your Company'}`, 50, 750)
  }

  // Client-side jsPDF helper methods
  private static addJobDetailsClient(doc: jsPDF, job: any, yPos: number): number {
    doc.setFontSize(12)
    doc.text('Job Details:', 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.text(`Client: ${job.client?.name || 'N/A'}`, 20, yPos)
    yPos += 6
    doc.text(`Address: ${job.client?.address || 'N/A'}`, 20, yPos)
    yPos += 6
    doc.text(`Status: ${job.status || 'N/A'}`, 20, yPos)
    yPos += 6
    doc.text(`Date: ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A'}`, 20, yPos)
    yPos += 10

    if (job.description) {
      doc.text('Description:', 20, yPos)
      yPos += 6
      const lines = doc.splitTextToSize(job.description, 170)
      doc.text(lines, 20, yPos)
      yPos += lines.length * 6 + 10
    }

    return yPos
  }

  private static addTasksSectionClient(doc: jsPDF, tasks: any[], yPos: number): number {
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

  private static addNotesSectionClient(doc: jsPDF, notes: any[], yPos: number): number {
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

  private static addFooterClient(doc: jsPDF, config: any) {
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated by ${config.company_name || 'Your Company'}`, 20, pageHeight - 10)
  }

  private static getPrintCSS(config: any): string {
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
        border-bottom: 3px solid ${config.primary_color || '#3B82F6'};
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      
      .report-header h1 {
        color: ${config.primary_color || '#3B82F6'};
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
        color: ${config.primary_color || '#3B82F6'};
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
        border-left: 4px solid ${config.primary_color || '#3B82F6'};
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
        border-left: 4px solid ${config.accent_color || '#10B981'};
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
}