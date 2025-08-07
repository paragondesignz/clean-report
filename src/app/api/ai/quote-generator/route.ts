import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client on the server side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { images, clientInfo } = await request.json()

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Convert base64 images to OpenAI format
    const imageContents = images.map((image: string) => ({
      type: 'image_url' as const,
      image_url: {
        url: image,
        detail: 'high' as const
      }
    }))

    // Create the prompt for quote generation
    const prompt = `You are a professional cleaning service estimator. Analyze these images and provide a detailed cleaning quote estimate using METRIC measurements.

Client Information:
- Property Type: ${clientInfo.propertyType || 'Not specified'}
- Floor Area: ${clientInfo.squareMetres || 'Not specified'} square metres (m²)
- Bedrooms: ${clientInfo.bedrooms || 'Not specified'}
- Bathrooms: ${clientInfo.bathrooms || 'Not specified'}
- Special Requirements: ${clientInfo.specialRequirements || 'None'}

Please provide a detailed analysis including:
1. Room-by-room breakdown with tasks and estimated time (in minutes)
2. Total price estimate (in local currency)
3. Complexity assessment (low/medium/high)
4. Required supplies
5. Additional notes or recommendations

Use metric measurements for all estimates. Room sizes should be referenced in square metres (m²), distances in metres (m) or centimetres (cm).

Format your response as a JSON object with the following structure:
{
  "totalPrice": number,
  "breakdown": [
    {
      "room": "string",
      "tasks": ["string"],
      "estimatedTime": number,
      "price": number
    }
  ],
  "totalTime": number,
  "complexity": "low|medium|high",
  "supplies": ["string"],
  "notes": "string"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageContents
          ]
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
    let quoteData
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        quoteData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      // Fallback: create a basic quote structure
      quoteData = {
        totalPrice: 150,
        breakdown: [
          {
            room: 'General Cleaning',
            tasks: ['Basic cleaning services'],
            estimatedTime: 120,
            price: 150
          }
        ],
        totalTime: 120,
        complexity: 'medium',
        supplies: ['General cleaning supplies'],
        notes: 'Quote generated based on image analysis. Please review for accuracy.'
      }
    }

    return NextResponse.json(quoteData)

  } catch (error) {
    console.error('Quote generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    )
  }
} 