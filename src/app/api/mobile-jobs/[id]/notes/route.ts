import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const { content } = await request.json()
    
    if (!jobId || !content) {
      return NextResponse.json(
        { error: 'Job ID and content are required' },
        { status: 400 }
      )
    }

    // Create service client for admin-level access
    const supabase = createServiceClient()
    
    // Add note
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        job_id: jobId,
        content: content.trim()
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to add note' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Mobile note API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}