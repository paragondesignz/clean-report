import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FeedbackData {
  id: string
  rating?: number
  comment?: string
  job_title?: string
  service_date?: string
  submitted_at: string
}

interface FeedbackInsights {
  summary: string
  strengths: string[]
  areas_for_improvement: string[]
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  average_rating: number
  total_feedback_count: number
  key_themes: string[]
  recommendations: string[]
}

export class FeedbackInsightsService {
  static async generateInsights(feedbackData: FeedbackData[]): Promise<FeedbackInsights> {
    if (!feedbackData || feedbackData.length === 0) {
      return {
        summary: "No customer feedback available yet. Encourage customers to leave feedback to gain valuable insights.",
        strengths: [],
        areas_for_improvement: [],
        overall_sentiment: 'neutral',
        average_rating: 0,
        total_feedback_count: 0,
        key_themes: [],
        recommendations: ["Actively collect customer feedback through your customer portal and post-service follow-ups"]
      }
    }

    // Calculate basic metrics
    const totalFeedback = feedbackData.length
    const ratingsOnly = feedbackData.filter(f => f.rating).map(f => f.rating!)
    const averageRating = ratingsOnly.length > 0 
      ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length 
      : 0
    
    const commentsOnly = feedbackData.filter(f => f.comment && f.comment.trim().length > 0)

    // Prepare data for AI analysis
    const feedbackForAI = feedbackData.map(feedback => ({
      rating: feedback.rating || 'No rating',
      comment: feedback.comment || 'No comment',
      service: feedback.job_title || 'Service',
      date: feedback.service_date || feedback.submitted_at
    }))

    try {
      const prompt = `
Analyze the following customer feedback data for a cleaning service business and provide insights in JSON format.

Customer Feedback Data:
${JSON.stringify(feedbackForAI, null, 2)}

Statistics:
- Total feedback entries: ${totalFeedback}
- Average rating: ${averageRating.toFixed(1)}/5
- Feedback with comments: ${commentsOnly.length}

Please analyze this feedback and respond with a JSON object containing:

{
  "summary": "A 2-3 sentence natural language summary of overall customer satisfaction",
  "strengths": ["Array of 3-5 key strengths mentioned by customers"],
  "areas_for_improvement": ["Array of 2-4 specific areas customers want improved"],
  "overall_sentiment": "positive|neutral|negative",
  "key_themes": ["Array of 3-5 main themes/topics customers discuss"],
  "recommendations": ["Array of 3-4 actionable recommendations for the business"]
}

Guidelines:
- Use natural, professional language
- Focus on actionable insights
- Be specific about cleaning service aspects
- If ratings are mostly 4-5, sentiment is positive; 3 is neutral; 1-2 is negative
- Identify specific service aspects (timeliness, thoroughness, communication, etc.)
- Keep insights concise but meaningful
- If no comments available, base analysis primarily on ratings and note the need for more detailed feedback
`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst specializing in customer feedback analysis for service businesses. Provide clear, actionable insights in the exact JSON format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const aiResponse = response.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No response from AI service')
      }

      // Parse AI response
      let aiInsights
      try {
        aiInsights = JSON.parse(aiResponse)
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse)
        throw new Error('Invalid AI response format')
      }

      return {
        summary: aiInsights.summary || "Unable to generate summary from available feedback.",
        strengths: aiInsights.strengths || [],
        areas_for_improvement: aiInsights.areas_for_improvement || [],
        overall_sentiment: aiInsights.overall_sentiment || 'neutral',
        average_rating: averageRating,
        total_feedback_count: totalFeedback,
        key_themes: aiInsights.key_themes || [],
        recommendations: aiInsights.recommendations || []
      }

    } catch (error) {
      console.error('Error generating AI insights:', error)
      
      // Fallback to basic analysis if AI fails
      const sentiment = averageRating >= 4 ? 'positive' : averageRating >= 3 ? 'neutral' : 'negative'
      
      return {
        summary: `Based on ${totalFeedback} customer feedback entries with an average rating of ${averageRating.toFixed(1)}/5, customer satisfaction appears ${sentiment}.`,
        strengths: averageRating >= 4 ? ["High customer satisfaction ratings", "Positive customer experience"] : [],
        areas_for_improvement: averageRating < 4 ? ["Service quality improvement needed", "Customer satisfaction enhancement required"] : [],
        overall_sentiment: sentiment,
        average_rating: averageRating,
        total_feedback_count: totalFeedback,
        key_themes: ["Service quality", "Customer satisfaction"],
        recommendations: [
          "Continue collecting detailed customer feedback",
          "Monitor service quality metrics",
          "Follow up with customers post-service"
        ]
      }
    }
  }

  static async getFeedbackInsights(userId: string): Promise<FeedbackInsights> {
    try {
      // This would typically fetch from your database
      // For now, we'll return a placeholder that will be replaced by actual database integration
      const response = await fetch('/api/feedback/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feedback insights')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching feedback insights:', error)
      throw error
    }
  }
}

export type { FeedbackInsights }