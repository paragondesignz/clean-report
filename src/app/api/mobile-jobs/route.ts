import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessCode = searchParams.get('access')
    
    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // For now, we'll skip password verification and just return jobs
    // In a production app, you'd verify the access code against user_profiles
    
    // Get all jobs (scheduled, in progress, and completed)
    const { data: jobs, error } = await supabase
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
      .in('status', ['scheduled', 'in_progress', 'completed'])
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    // Process jobs to include photo URLs and flatten photos from tasks
    const processedJobs = jobs?.map(job => {
      // Flatten photos from all tasks
      const allPhotos = job.tasks?.flatMap(task => 
        task.photos?.map(photo => ({
          ...photo,
          photo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.file_path}`,
          task_id: task.id
        })) || []
      ) || []
      
      return {
        ...job,
        photos: allPhotos
      }
    }) || []

    return NextResponse.json(processedJobs)

  } catch (error) {
    console.error('Mobile jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}