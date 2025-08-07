// Server-side PDF generator using HTML generation
// This approach avoids binary dependencies and works better in serverless

export interface ReportData {
  job: any
  tasks: any[]
  photos: any[]
  notes: any[]
  configuration: any
}

export async function generateServerPDF(reportData: ReportData): Promise<string> {
  console.log('Generating HTML report for server-side processing...')
  
  const { job, tasks, photos, notes, configuration } = reportData
  
  // For now, let's return the HTML content that can be processed differently
  // This avoids the PDFKit binary dependency issue
  const htmlContent = generateReportHTML(reportData)
  
  console.log('HTML report generated successfully')
  return htmlContent
}

function generateReportHTML(reportData: ReportData): string {
  const { job, tasks, photos, notes, configuration } = reportData
  
  // Ensure we have at least basic job data
  const jobData = job || { title: 'Untitled Job', client: { name: 'Unknown Client', address: 'No Address' } }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Job Report - ${jobData.title}</title>
      <style>
          ${getReportCSS(configuration)}
      </style>
  </head>
  <body>
      <div class="report">
          <header class="report-header">
              <h1>${configuration?.company_name || 'Your Company'}</h1>
              <h2>Job Report: ${jobData.title || 'Untitled Job'}</h2>
              <div class="report-meta">
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Client:</strong> ${jobData.client?.name || 'N/A'}</p>
                  <p><strong>Address:</strong> ${jobData.client?.address || 'N/A'}</p>
              </div>
          </header>

          <main class="report-content">
              <section class="job-details">
                  <h3>Job Details</h3>
                  <div class="detail-grid">
                      <div><strong>Status:</strong> ${jobData.status || 'N/A'}</div>
                      <div><strong>Priority:</strong> ${jobData.priority || 'Normal'}</div>
                      <div><strong>Scheduled:</strong> ${jobData.scheduled_date ? new Date(jobData.scheduled_date).toLocaleDateString() : 'N/A'}</div>
                      <div><strong>Duration:</strong> ${jobData.estimated_duration ? `${jobData.estimated_duration} hours` : 'N/A'}</div>
                  </div>
                  ${jobData.description ? `<p class="job-description">${jobData.description}</p>` : ''}
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
  </body>
  </html>
  `
}

function getReportCSS(config: any): string {
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