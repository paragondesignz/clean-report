import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { clientId, rating, comment, feedbackType, source } = await request.json()

    if (!clientId || !rating) {
      return NextResponse.json(
        { error: 'Client ID and rating are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // For complaints, require a comment
    if (feedbackType === 'complaint' && (!comment || comment.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Comment is required for complaints' },
        { status: 400 }
      )
    }

    // Generate a unique feedback token
    const feedbackToken = randomUUID()

    // Create a general feedback entry
    // Since this is general feedback not tied to a specific job,
    // we'll need to handle this differently than job-specific feedback
    const { data, error } = await supabase
      .from('general_feedback')
      .insert({
        id: randomUUID(),
        client_id: clientId,
        rating,
        comment: comment?.trim() || null,
        feedback_type: feedbackType || 'general',
        source: source || 'customer_portal',
        feedback_token: feedbackToken,
        is_submitted: true,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // If general_feedback table doesn't exist, create a job-agnostic entry in feedback table
      console.log('general_feedback table not found, using feedback table with null job_id')
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('feedback')
        .insert({
          id: randomUUID(),
          job_id: null, // No specific job
          client_id: clientId,
          rating,
          comment: comment?.trim() || null,
          feedback_token: feedbackToken,
          is_submitted: true,
          submitted_at: new Date().toISOString(),
          feedback_type: feedbackType || 'general',
          source: source || 'customer_portal'
        })
        .select()
        .single()

      if (fallbackError) {
        console.error('Error creating general feedback:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to submit feedback' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        feedback: fallbackData,
        message: 'Feedback submitted successfully' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      feedback: data,
      message: 'Feedback submitted successfully' 
    })

  } catch (error) {
    console.error('Error in general feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}