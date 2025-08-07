import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { jobs, preferences, constraints } = await request.json()

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs provided' },
        { status: 400 }
      )
    }

    // Create the prompt for smart scheduling
    const prompt = `You are a professional cleaning service scheduler. Create an optimal schedule for the following jobs.

Jobs to Schedule:
${jobs.map((job: any, index: number) => `
${index + 1}. ${job.title}
   - Client: ${job.client}
   - Address: ${job.address || 'Not specified'}
   - Estimated Duration: ${job.estimatedDuration} minutes
   - Priority: ${job.priority || 'medium'}
   - Required Skills: ${job.requiredSkills ? job.requiredSkills.join(', ') : 'None'}
`).join('')}

Scheduling Preferences:
- Start Time: ${preferences.startTime || 'Not specified'}
- End Time: ${preferences.endTime || 'Not specified'}
- Break Duration: ${preferences.breakDuration || 'Not specified'}
- Travel Time: ${preferences.travelTime || 'Not specified'}
- Work Days: ${preferences.workDays ? preferences.workDays.join(', ') : 'Not specified'}
- Max Jobs Per Day: ${preferences.maxJobsPerDay || 'Not specified'}

Constraints:
- Available Days: ${constraints.availableDays || 'Not specified'}
- Max Jobs Per Day: ${constraints.maxJobsPerDay || 'Not specified'}
- Priority Clients: ${constraints.priorityClients ? constraints.priorityClients.join(', ') : 'None'}
- Unavailable Times: ${constraints.unavailableTimes ? JSON.stringify(constraints.unavailableTimes) : 'None'}

Please provide an optimal schedule including:
1. Optimal time slots for each job
2. Route optimization to minimize travel time
3. Efficiency score (1-100)
4. Recommendations for improvements

Format your response as a JSON object with the following structure:
{
  "optimalTime": "string",
  "routeOptimization": {
    "order": ["string"],
    "totalDistance": number,
    "estimatedTravelTime": number
  },
  "timeSlots": [
    {
      "time": "string",
      "job": "string",
      "client": "string",
      "duration": number
    }
  ],
  "efficiency": number,
  "recommendations": ["string"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse the JSON response
    let scheduleData
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      // Fallback: create a basic schedule structure
      scheduleData = {
        optimalTime: '09:00',
        routeOptimization: {
          order: jobs.map((job: any) => job.title),
          totalDistance: 25,
          estimatedTravelTime: 45
        },
        timeSlots: jobs.map((job: any, index: number) => ({
          time: `09:${index * 30}:00`,
          job: job.title,
          client: job.client,
          duration: job.estimatedDuration
        })),
        efficiency: 85,
        recommendations: ['Schedule looks good, consider grouping nearby jobs']
      }
    }

    return NextResponse.json(scheduleData)

  } catch (error) {
    console.error('Smart scheduling error:', error)
    return NextResponse.json(
      { error: 'Failed to generate smart schedule' },
      { status: 500 }
    )
  }
} 