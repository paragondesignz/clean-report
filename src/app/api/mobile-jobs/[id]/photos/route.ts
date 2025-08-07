import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get the form data with the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // Get the first task for this job (or create a general task if none exist)
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('job_id', jobId)
      .order('order_index', { ascending: true })
      .limit(1)
    
    if (taskError) {
      console.error('Task query error:', taskError)
      return NextResponse.json(
        { error: 'Failed to find job tasks' },
        { status: 500 }
      )
    }
    
    let taskId = tasks?.[0]?.id
    
    if (!taskId) {
      // Create a general task for photos if none exist
      const { data: generalTask, error: createTaskError } = await supabase
        .from('tasks')
        .insert([{
          job_id: jobId,
          title: 'General Photos',
          description: 'Photos added via mobile portal',
          order_index: 0,
          is_completed: false
        }])
        .select()
        .single()
        
      if (createTaskError) {
        console.error('Create task error:', createTaskError)
        return NextResponse.json(
          { error: 'Failed to create task for photos' },
          { status: 500 }
        )
      }
      
      taskId = generalTask.id
    }

    // Generate file path with taskId (following same pattern as regular upload)
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${taskId}/${fileName}`
    
    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Add photo record to database (associated with task, not job)
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert([{
        task_id: taskId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size
      }])
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up the uploaded file if database insert fails
      await supabase.storage.from('photos').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to save photo record' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      ...photo,
      photo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${filePath}`
    })

  } catch (error) {
    console.error('Mobile photo upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}