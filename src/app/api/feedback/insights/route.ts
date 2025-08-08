import { NextRequest, NextResponse } from 'next/server'
import { FeedbackInsightsService } from '@/lib/ai-feedback-insights'
import { createServiceClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use service role client for admin operations (API endpoint)
    const supabase = createServiceClient()

    // Fetch all feedback data for the user's jobs
    const { data: feedbackData, error } = await supabase
      .from('feedback')
      .select(`
        id,
        rating,
        comment,
        submitted_at,
        is_submitted,
        job:jobs!inner(
          title,
          scheduled_date,
          user_id
        )
      `)
      .eq('job.user_id', userId)
      .eq('is_submitted', true)
      .order('submitted_at', { ascending: false })
      .limit(100) // Analyze last 100 feedback entries

    if (error) {
      console.error('Error fetching feedback data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch feedback data' },
        { status: 500 }
      )
    }

    // Transform data for AI analysis
    const transformedData = (feedbackData || []).map(item => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      job_title: item.job?.title,
      service_date: item.job?.scheduled_date,
      submitted_at: item.submitted_at
    }))

    // Generate AI insights
    const insights = await FeedbackInsightsService.generateInsights(transformedData)

    return NextResponse.json(insights)

  } catch (error) {
    console.error('Error in feedback insights API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}