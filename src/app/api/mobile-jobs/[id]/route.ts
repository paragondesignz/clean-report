import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-client'

export async function GET(
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

    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // Get specific job with all related data
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(
          name,
          email,
          phone,
          address
        ),
        tasks(
          id,
          title,
          description,
          is_completed,
          order_index,
          photos(
            id,
            file_path,
            file_name,
            created_at
          )
        ),
        notes(
          id,
          content,
          created_at
        )
      `)
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Process job to include photo URLs and flatten photos from tasks
    const allPhotos = job.tasks?.flatMap(task => 
      task.photos?.map(photo => ({
        ...photo,
        photo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.file_path}`,
        task_id: task.id
      })) || []
    ) || []
    
    const processedJob = {
      ...job,
      photos: allPhotos
    }

    return NextResponse.json(processedJob)

  } catch (error) {
    console.error('Mobile job API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const updates = await request.json()
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // Update job
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Mobile job update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}