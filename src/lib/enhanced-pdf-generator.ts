import puppeteer from 'puppeteer'
import { supabase } from './supabase-client'
import type { Job, Client, Task, Photo, Note, ReportPhoto, ReportTask, ReportConfiguration } from '@/types/database'

interface ReportData {
  job: Job & { client: Client }
  tasks: Task[]
  photos: Photo[]
  notes: Note[]
  reportPhotos: ReportPhoto[]
  reportTasks: ReportTask[]
  configuration: ReportConfiguration
  timerData?: {
    totalTime: number
    startTime?: string
    endTime?: string
  }
}

export class EnhancedPDFGenerator {
  private configuration: ReportConfiguration

  constructor(configuration: ReportConfiguration) {
    this.configuration = configuration
  }

  async generateReport(reportData: ReportData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      const html = await this.generateHTML(reportData)
      
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      })

      return pdf
    } finally {
      await browser.close()
    }
  }

  private async generateHTML(data: ReportData): Promise<string> {
    const { job, tasks, photos, notes, reportPhotos, reportTasks, configuration, timerData } = data
    
    // Filter photos and tasks based on report selections
    const selectedPhotos = photos.filter(photo => 
      reportPhotos.find(rp => rp.photo_id === photo.id && rp.include_in_report)
    )
    
    const selectedTasks = tasks.filter(task => 
      reportTasks.find(rt => rt.task_id === task.id && rt.include_in_report)
    )

    const css = this.generateCSS()
    const header = this.generateHeader(job, configuration)
    const jobInfo = this.generateJobInfo(job, timerData)
    const tasksSection = configuration.include_tasks ? this.generateTasksSection(selectedTasks, reportTasks) : ''
    const photosSection = configuration.include_photos ? this.generatePhotosSection(selectedPhotos, reportPhotos) : ''
    const notesSection = configuration.include_notes ? this.generateNotesSection(notes) : ''
    const footer = this.generateFooter(configuration)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Job Report - ${job.title}</title>
          <style>${css}</style>
        </head>
        <body>
          ${header}
          ${jobInfo}
          ${tasksSection}
          ${photosSection}
          ${notesSection}
          ${footer}
        </body>
      </html>
    `
  }

  private generateCSS(): string {
    const { primary_color, secondary_color, accent_color, font_family } = this.configuration
    
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: '${font_family}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: ${secondary_color};
        background: white;
      }
      
      .header {
        background: linear-gradient(135deg, ${primary_color}, ${accent_color});
        color: white;
        padding: 30px;
        text-align: center;
        margin-bottom: 30px;
        border-radius: 10px;
      }
      
      .company-logo {
        max-width: 200px;
        max-height: 80px;
        margin-bottom: 15px;
      }
      
      .header h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .header p {
        font-size: 16px;
        opacity: 0.9;
      }
      
      .section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      
      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: ${primary_color};
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid ${accent_color};
      }
      
      .job-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .info-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid ${primary_color};
      }
      
      .info-card h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        color: ${primary_color};
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .info-label {
        font-weight: 500;
        color: ${secondary_color};
      }
      
      .info-value {
        color: #374151;
      }
      
      .tasks-grid {
        display: grid;
        gap: 15px;
      }
      
      .task-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .task-status {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .task-status.completed {
        background: ${accent_color};
        color: white;
      }
      
      .task-status.pending {
        background: #f3f4f6;
        border: 2px solid #d1d5db;
      }
      
      .task-content {
        flex: 1;
      }
      
      .task-title {
        font-weight: 600;
        margin-bottom: 5px;
        color: ${secondary_color};
      }
      
      .task-description {
        font-size: 14px;
        color: #6b7280;
      }
      
      .photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .photo-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        page-break-inside: avoid;
      }
      
      .photo-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        background: #f3f4f6;
      }
      
      .photo-caption {
        padding: 10px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
      }
      
      .photo-type-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: ${primary_color};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
      }
      
      .notes-section {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
      }
      
      .note-item {
        background: white;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        border-left: 3px solid ${accent_color};
      }
      
      .note-content {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
      }
      
      .note-date {
        font-size: 12px;
        color: #6b7280;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
      }
      
      .timer-info {
        background: ${accent_color}15;
        border: 1px solid ${accent_color}30;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .timer-info h4 {
        color: ${accent_color};
        margin-bottom: 10px;
        font-size: 16px;
      }
      
      .timer-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        font-size: 14px;
      }
      
      @media print {
        .section {
          page-break-inside: avoid;
        }
        
        .photo-item {
          page-break-inside: avoid;
        }
      }
    `
  }

  private generateHeader(job: Job & { client: Client }, config: ReportConfiguration): string {
    const logoHtml = config.include_company_logo && config.company_logo_url 
      ? `<img src="${config.company_logo_url}" alt="${config.company_name}" class="company-logo">`
      : ''

    return `
      <div class="header">
        ${logoHtml}
        <h1>${job.title}</h1>
        <p>Professional Cleaning Report</p>
        <p>${config.company_name}</p>
      </div>
    `
  }

  private generateJobInfo(job: Job & { client: Client }, timerData?: any): string {
    const timerHtml = timerData ? `
      <div class="timer-info">
        <h4>⏱️ Time Tracking</h4>
        <div class="timer-details">
          <div class="info-item">
            <span class="info-label">Total Time:</span>
            <span class="info-value">${this.formatTime(timerData.totalTime)}</span>
          </div>
          ${timerData.startTime ? `
            <div class="info-item">
              <span class="info-label">Started:</span>
              <span class="info-value">${new Date(timerData.startTime).toLocaleString()}</span>
            </div>
          ` : ''}
          ${timerData.endTime ? `
            <div class="info-item">
              <span class="info-label">Completed:</span>
              <span class="info-value">${new Date(timerData.endTime).toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''

    return `
      <div class="section">
        <h2 class="section-title">Job Information</h2>
        ${timerHtml}
        <div class="job-info">
          <div class="info-card">
            <h3>📅 Schedule</h3>
            <div class="info-item">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(job.scheduled_date).toLocaleDateString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Time:</span>
              <span class="info-value">${new Date(`2000-01-01T${job.scheduled_time}`).toLocaleTimeString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">${job?.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</span>
            </div>
          </div>
          
          <div class="info-card">
            <h3>👤 Client Details</h3>
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">${job.client.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${job.client.phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${job.client.email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address:</span>
              <span class="info-value">${job.client.address}</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private generateTasksSection(tasks: Task[], reportTasks: ReportTask[]): string {
    if (!tasks.length) return ''

    const taskItems = tasks.map(task => {
      const reportTask = reportTasks.find(rt => rt.task_id === task.id)
      const isCompleted = reportTask?.is_completed || task.is_completed
      const statusIcon = isCompleted ? '✓' : '○'
      const statusClass = isCompleted ? 'completed' : 'pending'

      return `
        <div class="task-item">
          <div class="task-status ${statusClass}">
            ${statusIcon}
          </div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
          </div>
        </div>
      `
    }).join('')

    return `
      <div class="section">
        <h2 class="section-title">✅ Tasks Completed</h2>
        <div class="tasks-grid">
          ${taskItems}
        </div>
      </div>
    `
  }

  private generatePhotosSection(photos: Photo[], reportPhotos: ReportPhoto[]): string {
    if (!photos.length) return ''

    const photoItems = photos.map(photo => {
      const reportPhoto = reportPhotos.find(rp => rp.photo_id === photo.id)
      const caption = reportPhoto?.caption || photo.file_name
      const photoType = reportPhoto?.photo_type || 'general'
      
      return `
        <div class="photo-item">
          <div style="position: relative;">
            <img src="${this.getPhotoUrl(photo.file_path)}" alt="${photo.file_name}" class="photo-image">
            <div class="photo-type-badge">${photoType.toUpperCase()}</div>
          </div>
          <div class="photo-caption">${caption}</div>
        </div>
      `
    }).join('')

    return `
      <div class="section">
        <h2 class="section-title">📸 Work Documentation</h2>
        <div class="photos-grid">
          ${photoItems}
        </div>
      </div>
    `
  }

  private generateNotesSection(notes: Note[]): string {
    if (!notes.length) return ''

    const noteItems = notes.map(note => `
      <div class="note-item">
        <div class="note-content">${note.content}</div>
        <div class="note-date">${new Date(note.created_at).toLocaleString()}</div>
      </div>
    `).join('')

    return `
      <div class="section">
        <h2 class="section-title">📝 Notes & Observations</h2>
        <div class="notes-section">
          ${noteItems}
        </div>
      </div>
    `
  }

  private generateFooter(config: ReportConfiguration): string {
    const customFooter = config.custom_footer_text || ''
    
    return `
      <div class="footer">
        <p>Report generated by ${config.company_name}</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        ${customFooter ? `<p>${customFooter}</p>` : ''}
      </div>
    `
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  private getPhotoUrl(filePath: string): string {
    // This would need to be implemented based on your storage setup
    // For now, returning a placeholder
    return `https://your-storage-bucket.supabase.co/storage/v1/object/public/photos/${filePath}`
  }
}
