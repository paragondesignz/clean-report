import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessCode = searchParams.get('access')
    
    // Validate access code is provided
    if (!accessCode) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 401 }
      )
    }
    
    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // Verify the access code against user_profiles
    const { data: userProfile, error: authError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('mobile_access_code', accessCode)
      .single()
    
    if (authError || !userProfile) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      )
    }
    
    // Get jobs for the authenticated user
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
      .eq('user_id', userProfile.user_id)
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