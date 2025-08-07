import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Parse request body
    const { job_id, sub_contractor_id, notes } = await request.json()

    if (!job_id || !sub_contractor_id) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'job_id and sub_contractor_id are required',
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // Verify that the sub-contractor belongs to the current admin
    const { data: subContractor, error: subContractorError } = await supabase
      .from('sub_contractors')
      .select('id, status')
      .eq('id', sub_contractor_id)
      .eq('admin_id', user.id)
      .single()

    if (subContractorError || !subContractor) {
      return NextResponse.json({ 
        error: 'Sub-contractor not found or access denied',
        details: 'The sub-contractor does not exist or you do not have permission to assign them',
        code: 'NOT_FOUND'
      }, { status: 404 })
    }

    if (subContractor.status !== 'active') {
      return NextResponse.json({ 
        error: 'Sub-contractor is not active',
        details: 'Only active sub-contractors can be assigned to jobs',
        code: 'INVALID_STATUS'
      }, { status: 400 })
    }

    // Verify that the job belongs to the current user
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ 
        error: 'Job not found or access denied',
        details: 'The job does not exist or you do not have permission to assign it',
        code: 'NOT_FOUND'
      }, { status: 404 })
    }

    // Check if the sub-contractor is already assigned to this job
    const { data: existingAssignment, error: existingError } = await supabase
      .from('sub_contractor_job_assignments')
      .select('id')
      .eq('job_id', job_id)
      .eq('sub_contractor_id', sub_contractor_id)
      .single()

    if (existingAssignment) {
      return NextResponse.json({ 
        error: 'Sub-contractor already assigned',
        details: 'This sub-contractor is already assigned to this job',
        code: 'DUPLICATE_ASSIGNMENT'
      }, { status: 409 })
    }

    // Create the job assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_contractor_job_assignments')
      .insert({
        job_id,
        sub_contractor_id,
        notes: notes || null,
        status: 'assigned'
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Error creating job assignment:', assignmentError)
      return NextResponse.json({ 
        error: 'Failed to create job assignment',
        details: assignmentError.message,
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Job assigned successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/sub-contractors/assign-job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
