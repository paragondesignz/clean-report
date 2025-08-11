import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
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
    const { first_name, last_name, email, phone, hourly_rate, specialties, status } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if the sub contractor belongs to the current admin
    const { data: existingContractor } = await supabase
      .from('sub_contractors')
      .select('id, email')
      .eq('id', id)
      .eq('admin_id', user.id)
      .single()

    if (!existingContractor) {
      return NextResponse.json({ error: 'Sub contractor not found' }, { status: 404 })
    }

    // Check if email is being changed and if it already exists
    if (email !== existingContractor.email) {
      const { data: emailExists } = await supabase
        .from('sub_contractors')
        .select('id')
        .eq('admin_id', user.id)
        .eq('email', email)
        .neq('id', id)
        .single()

      if (emailExists) {
        return NextResponse.json({ error: 'A sub contractor with this email already exists' }, { status: 400 })
      }
    }

    // Update the sub contractor
    const { data: updatedContractor, error } = await supabase
      .from('sub_contractors')
      .update({
        first_name,
        last_name,
        email,
        phone,
        hourly_rate: hourly_rate || 0,
        specialties: specialties || [],
        status: status || 'pending'
      })
      .eq('id', id)
      .eq('admin_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating sub contractor:', error)
      return NextResponse.json({ error: 'Failed to update sub contractor' }, { status: 500 })
    }

    return NextResponse.json({
      id: updatedContractor.id,
      name: `${updatedContractor.first_name} ${updatedContractor.last_name}`,
      email: updatedContractor.email,
      phone: updatedContractor.phone,
      status: updatedContractor.status,
      hourlyRate: updatedContractor.hourly_rate,
      specialties: updatedContractor.specialties || [],
      created_at: updatedContractor.created_at,
      updated_at: updatedContractor.updated_at
    })
  } catch (error) {
    console.error('Error in PUT /api/sub-contractors/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
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

    // Check if the sub contractor belongs to the current admin
    const { data: existingContractor } = await supabase
      .from('sub_contractors')
      .select('id')
      .eq('id', id)
      .eq('admin_id', user.id)
      .single()

    if (!existingContractor) {
      return NextResponse.json({ error: 'Sub contractor not found' }, { status: 404 })
    }

    // Delete the sub contractor
    const { error } = await supabase
      .from('sub_contractors')
      .delete()
      .eq('id', id)
      .eq('admin_id', user.id)

    if (error) {
      console.error('Error deleting sub contractor:', error)
      return NextResponse.json({ error: 'Failed to delete sub contractor' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Sub contractor deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/sub-contractors/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
