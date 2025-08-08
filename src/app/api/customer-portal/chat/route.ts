import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context information
    let contextInfo = ""
    
    if (context) {
      const { jobs, stats } = context
      
      if (stats) {
        contextInfo += `Customer Statistics:
- Total Jobs: ${stats.total_jobs}
- Completed Jobs: ${stats.completed_jobs}
- Total Hours: ${stats.total_hours?.toFixed(1)}h
- Total Spent: $${stats.total_cost?.toFixed(2)}
`
      }

      if (jobs && jobs.length > 0) {
        contextInfo += `
Recent Jobs:
${jobs.slice(0, 5).map((job: any, index: number) => 
  `${index + 1}. ${job.title} - ${job.status} (${new Date(job.scheduled_date).toLocaleDateString()})`
).join('\n')}
`
      }
    }

    // Build conversation history
    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\nRecent conversation:\n" + 
        conversationHistory.map((msg: any) => 
          `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`
        ).join('\n')
    }

    const systemPrompt = `You are a helpful AI assistant for a professional cleaning service company's customer portal. You help customers with questions about their cleaning services, scheduling, pricing, and general inquiries.

Key Information:
- You can help with scheduling questions, service details, pricing explanations
- Business hours: Monday-Friday 8AM-6PM, Saturday 9AM-4PM
- Contact: (555) 123-4567 or support@cleaningservice.com
- Services include: general cleaning, deep cleaning, kitchen/bathroom cleaning, carpet cleaning, window cleaning, move in/out cleaning
- Pricing is based on allocated hours and actual time worked
- 24-hour notice required for rescheduling
- All cleaning supplies provided unless customer prefers their own
- Satisfaction guaranteed within 24 hours

${contextInfo}${conversationContext}

Guidelines:
- Be friendly, professional, and helpful
- Provide specific, actionable answers
- If you don't know something specific about their account, suggest contacting support
- For scheduling changes, direct them to call or use the contact information
- Be empathetic and understanding
- Keep responses concise but thorough
- Always maintain a positive, solution-oriented tone`

    if (!openai) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I was unable to process your request. Please try again or contact our support team.'

    return NextResponse.json({
      response: aiResponse,
      success: true
    })

  } catch (error) {
    console.error('Error in customer portal chat API:', error)
    
    // Fallback response for common queries
    const fallbackResponse = "I apologize, but I'm experiencing some technical difficulties right now. For immediate assistance, please contact our support team at (555) 123-4567 or email support@cleaningservice.com. Our team is available Monday-Friday 8AM-6PM and Saturday 9AM-4PM."

    return NextResponse.json({
      response: fallbackResponse,
      success: false,
      error: 'AI service temporarily unavailable'
    })
  }
}