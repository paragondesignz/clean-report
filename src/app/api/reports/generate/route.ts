import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateServerPDF } from '@/lib/pdf-generator-server'

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
      .in('task_id', tasks?.map(t => t.id) || [])

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    // Get report configuration (handle missing table gracefully)
    let config = null
    try {
      const { data } = await supabase
        .from('report_configurations')
        .select('*')
        .eq('user_id', userId)
        .single()
      config = data
    } catch (configError) {
      console.log('Report configuration table not found, using defaults')
    }

    // Get or create report photos (handle missing table gracefully)
    let reportPhotos = []
    try {
      const { data } = await supabase
        .from('report_photos')
        .select('*')
        .eq('report_id', jobId)
      reportPhotos = data || []
    } catch (photoError) {
      console.log('Report photos table not found, skipping')
    }

    // Get or create report tasks (handle missing table gracefully)
    let reportTasks = []
    try {
      const { data } = await supabase
        .from('report_tasks')
        .select('*')
        .eq('report_id', jobId)
      reportTasks = data || []
    } catch (taskError) {
      console.log('Report tasks table not found, skipping')
    }

    // Prepare report data
    const reportData = {
      job,
      tasks: tasks || [],
      photos: photos || [],
      notes: notes || [],
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
      },
      reportPhotos: reportPhotos,
      reportTasks: reportTasks
    }

    // Generate HTML report (avoiding PDFKit binary issues in Vercel)
    console.log('Generating HTML report...')
    let htmlContent: string
    try {
      htmlContent = await generateServerPDF(reportData)
      console.log('HTML generation successful, length:', htmlContent.length)
    } catch (htmlError) {
      console.error('HTML generation failed:', htmlError)
      // Fallback to basic HTML if generation fails
      htmlContent = `
        <html>
          <head><title>Job Report - ${reportData.job?.title || 'Untitled'}</title></head>
          <body>
            <h1>Job Report: ${reportData.job?.title || 'Untitled Job'}</h1>
            <p>Generated: ${new Date().toISOString()}</p>
            <p>Client: ${reportData.job?.client?.name || 'N/A'}</p>
            <p>Status: ${reportData.job?.status || 'N/A'}</p>
            <p>Note: Full report generation failed, this is a basic fallback.</p>
          </body>
        </html>
      `
    }

    // For now, skip storage and return the HTML content directly
    // This will help us identify if the issue is with storage or HTML generation
    console.log('Skipping storage upload for debugging, returning HTML directly')
    
    // Create a data URL for the HTML content
    const htmlDataUrl = `data:text/html;base64,${Buffer.from(htmlContent).toString('base64')}`

    return NextResponse.json({
      success: true,
      reportId: `temp-${Date.now()}`,
      reportUrl: htmlDataUrl,
      downloadUrl: htmlDataUrl,
      reportData: reportData,
      htmlContent: htmlContent,
      message: 'HTML report generated successfully! Use browser print or client-side PDF generation for PDF output.'
    })

  } catch (error) {
    console.error('Error generating report:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}
