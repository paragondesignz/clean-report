import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/sub-contractors - Starting request')
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
    console.log('Auth check:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      console.log('Unauthorized access attempt', { authError: authError?.message, user: !!user })
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Get sub contractors for the current admin
    console.log('Fetching sub contractors for admin:', user.id)
    const { data: subContractors, error } = await supabase
      .from('sub_contractors')
      .select(`
        *,
        sub_contractor_job_assignments (
          id,
          job_id,
          status,
          assigned_at
        )
      `)
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Database query result:', { 
      count: subContractors?.length || 0, 
      error: error?.message 
    })

    if (error) {
      console.error('Error fetching sub contractors:', error)
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "sub_contractors" does not exist')) {
        console.log('Tables don\'t exist, returning empty array')
        return NextResponse.json([])
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch sub contractors',
        details: error.message,
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    // Transform the data to include job statistics
    const transformedSubContractors = subContractors?.map(contractor => {
      const jobAssignments = contractor.sub_contractor_job_assignments || []
      const completedJobs = jobAssignments.filter((job: any) => job.status === 'completed').length
      const totalJobs = jobAssignments.length
      
      return {
        id: contractor.id,
        name: `${contractor.first_name} ${contractor.last_name}`,
        email: contractor.email,
        phone: contractor.phone,
        status: contractor.status,
        hourlyRate: contractor.hourly_rate,
        specialties: contractor.specialties || [],
        jobsCompleted: completedJobs,
        totalJobs: totalJobs,
        lastActive: contractor.updated_at,
        created_at: contractor.created_at,
        updated_at: contractor.updated_at
      }
    }) || []

    return NextResponse.json(transformedSubContractors)
  } catch (error) {
    console.error('Error in GET /api/sub-contractors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, hourly_rate, specialties } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists for this admin
    const { data: existingContractor } = await supabase
      .from('sub_contractors')
      .select('id')
      .eq('admin_id', user.id)
      .eq('email', email)
      .single()

    if (existingContractor) {
      return NextResponse.json({ error: 'A sub contractor with this email already exists' }, { status: 400 })
    }

    // Create new sub contractor
    const { data: newContractor, error } = await supabase
      .from('sub_contractors')
      .insert({
        admin_id: user.id,
        first_name,
        last_name,
        email,
        phone,
        hourly_rate: hourly_rate || 0,
        specialties: specialties || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sub contractor:', error)
      return NextResponse.json({ error: 'Failed to create sub contractor' }, { status: 500 })
    }

    return NextResponse.json({
      id: newContractor.id,
      name: `${newContractor.first_name} ${newContractor.last_name}`,
      email: newContractor.email,
      phone: newContractor.phone,
      status: newContractor.status,
      hourlyRate: newContractor.hourly_rate,
      specialties: newContractor.specialties || [],
      jobsCompleted: 0,
      totalJobs: 0,
      lastActive: newContractor.updated_at,
      created_at: newContractor.created_at,
      updated_at: newContractor.updated_at
    })
  } catch (error) {
    console.error('Error in POST /api/sub-contractors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
