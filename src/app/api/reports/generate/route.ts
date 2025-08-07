import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { jobId, userId } = await request.json()

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: 'Missing jobId or userId' },
        { status: 400 }
      )
    }

    // Get job data with client
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('job_id', jobId)
      .order('order_index')

    // Get photos
    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .eq('task_id', tasks?.map(t => t.id) || [])

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    // Get report configuration
    const { data: config } = await supabase
      .from('report_configurations')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get or create report photos
    const { data: reportPhotos } = await supabase
      .from('report_photos')
      .select('*')
      .eq('report_id', jobId)

    // Get or create report tasks
    const { data: reportTasks } = await supabase
      .from('report_tasks')
      .select('*')
      .eq('report_id', jobId)

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      const html = generateHTML({
        job,
        tasks: tasks || [],
        photos: photos || [],
        notes: notes || [],
        reportPhotos: reportPhotos || [],
        reportTasks: reportTasks || [],
        configuration: config || {
          company_name: 'Your Company',
          primary_color: '#3B82F6',
          secondary_color: '#1F2937',
          accent_color: '#10B981',
          font_family: 'Inter',
          include_company_logo: true,
          include_company_colors: true,
          include_photos: true,
          include_tasks: true,
          include_notes: true,
          include_timer_data: true,
          photo_layout: 'grid',
          max_photos_per_report: 20,
          report_template: 'standard',
          custom_header_text: null,
          custom_footer_text: null
        }
      })
      
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

      // Upload to Supabase Storage
      const fileName = `reports/${jobId}/${Date.now()}-report.pdf`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, pdf, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName)

      // Save report record
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          job_id: jobId,
          report_url: urlData.publicUrl,
          user_id: userId,
          email_sent: false
        })
        .select()
        .single()

      if (reportError) {
        throw reportError
      }

      return NextResponse.json({
        success: true,
        reportUrl: urlData.publicUrl,
        reportId: report.id
      })

    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateHTML(data: any): string {
  const { job, tasks, photos, notes, reportPhotos, reportTasks, configuration } = data
  
  // Filter photos and tasks based on report selections
  const selectedPhotos = photos.filter((photo: any) => 
    reportPhotos.find((rp: any) => rp.photo_id === photo.id && rp.include_in_report)
  )
  
  const selectedTasks = tasks.filter((task: any) => 
    reportTasks.find((rt: any) => rt.task_id === task.id && rt.include_in_report)
  )

  const css = generateCSS(configuration)
  const header = generateHeader(job, configuration)
  const jobInfo = generateJobInfo(job)
  const tasksSection = configuration.include_tasks ? generateTasksSection(selectedTasks, reportTasks) : ''
  const photosSection = configuration.include_photos ? generatePhotosSection(selectedPhotos, reportPhotos) : ''
  const notesSection = configuration.include_notes ? generateNotesSection(notes) : ''
  const footer = generateFooter(configuration)

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

function generateCSS(config: any): string {
  const { primary_color, secondary_color, accent_color, font_family } = config
  
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
  `
}

function generateHeader(job: any, config: any): string {
  return `
    <div class="header">
      <h1>${job.title}</h1>
      <p>Professional Cleaning Report</p>
      <p>${config.company_name}</p>
    </div>
  `
}

function generateJobInfo(job: any): string {
  return `
    <div class="section">
      <h2 class="section-title">Job Information</h2>
      <div class="job-info">
        <div class="info-card">
          <h3>📅 Schedule</h3>
          <div class="info-item">
            <span class="info-label">Date:</span>
            <span class="info-value">${new Date(job.scheduled_date).toLocaleDateString()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Time:</span>
            <span class="info-value">${new Date('2000-01-01T' + job.scheduled_time).toLocaleTimeString()}</span>
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

function generateTasksSection(tasks: any[], reportTasks: any[]): string {
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

function generatePhotosSection(photos: any[], reportPhotos: any[]): string {
  if (!photos.length) return ''

  const photoItems = photos.map(photo => {
    const reportPhoto = reportPhotos.find(rp => rp.photo_id === photo.id)
    const caption = reportPhoto?.caption || photo.file_name
    
    return `
      <div class="photo-item">
        <div style="position: relative;">
          <div class="photo-image"></div>
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

function generateNotesSection(notes: any[]): string {
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

function generateFooter(config: any): string {
  return `
    <div class="footer">
      <p>Report generated by ${config.company_name}</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
  `
}
