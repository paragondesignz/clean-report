import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { status, notes, admin_notes } = await request.json()

    // Verify that the assignment belongs to a sub-contractor of the current admin
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_contractor_job_assignments')
      .select(`
        *,
        sub_contractors!inner(admin_id)
      `)
      .eq('id', id)
      .eq('sub_contractors.admin_id', user.id)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or access denied',
        details: 'The assignment does not exist or you do not have permission to modify it',
        code: 'NOT_FOUND'
      }, { status: 404 })
    }

    // Update the assignment
    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const { data: updatedAssignment, error: updateError } = await supabase
      .from('sub_contractor_job_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating assignment:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update assignment',
        details: updateError.message,
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: 'Assignment updated successfully'
    })
  } catch (error) {
    console.error('Error in PATCH /api/sub-contractors/assignments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify that the assignment belongs to a sub-contractor of the current admin
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_contractor_job_assignments')
      .select(`
        *,
        sub_contractors!inner(admin_id)
      `)
      .eq('id', id)
      .eq('sub_contractors.admin_id', user.id)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or access denied',
        details: 'The assignment does not exist or you do not have permission to delete it',
        code: 'NOT_FOUND'
      }, { status: 404 })
    }

    // Delete the assignment
    const { error: deleteError } = await supabase
      .from('sub_contractor_job_assignments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting assignment:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete assignment',
        details: deleteError.message,
        code: 'DATABASE_ERROR'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/sub-contractors/assignments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
