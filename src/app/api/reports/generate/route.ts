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
    const htmlContent = await generateServerPDF(reportData)

    // Upload HTML to Supabase Storage
    console.log('Uploading HTML report to Supabase storage...')
    const fileName = `reports/${jobId}/${Date.now()}-report.html`
    
    // Check if the reports bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Available storage buckets:', buckets?.map(b => b.name) || [])
    
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError)
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, htmlContent, {
        contentType: 'text/html',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError)
      console.error('Upload error details:', {
        message: uploadError.message,
        statusCode: (uploadError as any).statusCode,
        error: uploadError
      })
      
      // If the bucket doesn't exist, try to create it
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket_not_found')) {
        console.log('Attempting to create reports bucket...')
        const { data: createBucket, error: createError } = await supabase.storage
          .createBucket('reports', {
            public: true,
            allowedMimeTypes: ['text/html', 'application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          })
        
        if (createError) {
          console.error('Failed to create bucket:', createError)
          throw new Error(`Failed to create storage bucket: ${createError.message}`)
        }
        
        // Retry upload
        console.log('Retrying upload after creating bucket...')
        const { data: retryUpload, error: retryError } = await supabase.storage
          .from('reports')
          .upload(fileName, htmlContent, {
            contentType: 'text/html',
            cacheControl: '3600'
          })
          
        if (retryError) {
          throw new Error(`Failed to upload PDF after bucket creation: ${retryError.message}`)
        }
      } else {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`)
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    // Create report record in database
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        job_id: jobId,
        user_id: userId,
        email_sent: false,
        report_url: urlData.publicUrl,
        report_data: JSON.stringify(reportData),
        status: 'generated'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report record:', reportError)
      throw new Error('Failed to create report record')
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      reportUrl: urlData.publicUrl,
      downloadUrl: urlData.publicUrl,
      reportData: reportData,
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
