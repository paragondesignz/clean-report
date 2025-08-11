import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
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

    // Get job assignments for the specific job
    const { data: assignments, error } = await supabase
      .from('sub_contractor_job_assignments')
      .select(`
        *,
        sub_contractors (
          id,
          first_name,
          last_name,
          email,
          phone,
          status,
          hourly_rate,
          specialties
        )
      `)
      .eq('job_id', jobId)
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching job assignments:', error)
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "sub_contractor_job_assignments" does not exist')) {
        return NextResponse.json([])
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch job assignments',
        details: error.message,
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    // Transform the data to include sub-contractor details
    const transformedAssignments = assignments?.map(assignment => ({
      id: assignment.id,
      job_id: assignment.job_id,
      sub_contractor_id: assignment.sub_contractor_id,
      assigned_at: assignment.assigned_at,
      status: assignment.status,
      notes: assignment.notes,
      admin_notes: assignment.admin_notes,
      sub_contractor: assignment.sub_contractors ? {
        id: assignment.sub_contractors.id,
        name: `${assignment.sub_contractors.first_name} ${assignment.sub_contractors.last_name}`,
        email: assignment.sub_contractors.email,
        phone: assignment.sub_contractors.phone,
        status: assignment.sub_contractors.status,
        hourlyRate: assignment.sub_contractors.hourly_rate,
        specialties: assignment.sub_contractors.specialties || []
      } : null
    })) || []

    return NextResponse.json(transformedAssignments)
  } catch (error) {
    console.error('Error in GET /api/sub-contractors/job-assignments/[jobId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
