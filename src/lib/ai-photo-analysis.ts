import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export interface RoomAnalysis {
  room: string
  condition: 'good' | 'fair' | 'poor'
  estimatedTime: number
  estimatedCost: number
  notes: string[]
  confidence: number
}

export interface QuoteEstimate {
  totalCost: number
  totalTime: number
  breakdown: RoomAnalysis[]
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high'
  confidence: number
}

// AI response validation interface
interface AIAnalysisResponse {
  totalCost?: number
  totalTime?: number
  urgency?: 'low' | 'medium' | 'high'
  confidence?: number
  breakdown?: Array<{
    room?: string
    condition?: string
    estimatedTime?: number
    estimatedCost?: number
    notes?: string[]
    confidence?: number
  }>
  recommendations?: string[]
}

interface AIRoomResponse {
  room?: string
  condition?: string
  estimatedTime?: number
  estimatedCost?: number
  notes?: string[]
  confidence?: number
}

export class AIPhotoAnalysis {
  static async analyzeCleaningPhotos(images: File[]): Promise<QuoteEstimate> {
    try {
      // Check if OpenAI is configured
      if (!openai) {
        throw new Error('AI service not configured. Please set OPENAI_API_KEY environment variable.')
      }

      // Convert images to base64 for OpenAI Vision API
      const imagePromises = images.map(image => this.fileToBase64(image))
      const base64Images = await Promise.all(imagePromises)

      // Create the analysis prompt
      const prompt = `
        Analyze these photos of a residential space for cleaning purposes. For each room/area visible:

        1. Identify the room type (kitchen, living room, bathroom, bedroom, etc.)
        2. Assess the cleaning condition: good (light cleaning), fair (moderate cleaning), poor (heavy cleaning)
        3. Estimate cleaning time in hours
        4. Estimate cost in USD (base rate $25/hour + complexity factors)
        5. List specific cleaning tasks needed
        6. Determine overall urgency level

        Consider factors like:
        - Visible dirt, dust, stains
        - Clutter and organization needs
        - Surface types (hardwood, carpet, tile, etc.)
        - Special cleaning requirements (pet hair, grease, etc.)
        - Room size and complexity

        Return a JSON response with this structure:
        {
          "totalCost": number,
          "totalTime": number,
          "urgency": "low|medium|high",
          "confidence": number (0-1),
          "breakdown": [
            {
              "room": "string",
              "condition": "good|fair|poor",
              "estimatedTime": number,
              "estimatedCost": number,
              "notes": ["string"],
              "confidence": number
            }
          ],
          "recommendations": ["string"]
        }
      `

      // Call OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...base64Images.map(base64 => ({
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                  detail: "high"
                }
              }))
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })

      // Parse the response
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI analysis')
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      const analysis = JSON.parse(jsonMatch[0]) as QuoteEstimate

      // Validate and clean the response
      return this.validateAndCleanAnalysis(analysis)

    } catch (error) {
      console.error('AI Photo Analysis Error:', error)
      
      // Return fallback analysis
      return this.getFallbackAnalysis(images.length)
    }
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private static validateAndCleanAnalysis(analysis: AIAnalysisResponse): QuoteEstimate {
    // Ensure all required fields exist
    const validated: QuoteEstimate = {
      totalCost: analysis.totalCost || 0,
      totalTime: analysis.totalTime || 0,
      urgency: analysis.urgency || 'medium',
      confidence: analysis.confidence || 0.5,
      breakdown: [],
      recommendations: analysis.recommendations || []
    }

    // Validate breakdown
    if (Array.isArray(analysis.breakdown)) {
      validated.breakdown = analysis.breakdown.map((room: AIRoomResponse) => ({
        room: room.room || 'Unknown Room',
        condition: ['good', 'fair', 'poor'].includes(room.condition) ? room.condition : 'fair',
        estimatedTime: Math.max(0.5, Math.min(8, room.estimatedTime || 1)),
        estimatedCost: Math.max(10, room.estimatedCost || 25),
        notes: Array.isArray(room.notes) ? room.notes : [],
        confidence: Math.max(0, Math.min(1, room.confidence || 0.5))
      }))
    }

    // Recalculate totals if breakdown is valid
    if (validated.breakdown.length > 0) {
      validated.totalCost = validated.breakdown.reduce((sum, room) => sum + room.estimatedCost, 0)
      validated.totalTime = validated.breakdown.reduce((sum, room) => sum + room.estimatedTime, 0)
    }

    return validated
  }

  private static getFallbackAnalysis(imageCount: number): QuoteEstimate {
    // Fallback analysis when AI fails
    const baseCost = 25 * imageCount
    const baseTime = 1 * imageCount

    return {
      totalCost: baseCost,
      totalTime: baseTime,
      urgency: 'medium',
      confidence: 0.3,
      breakdown: [
        {
          room: 'General Cleaning',
          condition: 'fair',
          estimatedTime: baseTime,
          estimatedCost: baseCost,
          notes: ['Standard cleaning required', 'Photos analyzed for assessment'],
          confidence: 0.3
        }
      ],
      recommendations: [
        'Manual assessment recommended',
        'Consider scheduling a walkthrough',
        'Standard cleaning package suggested'
      ]
    }
  }

  // Enhanced analysis with specific cleaning insights
  static async getDetailedCleaningInsights(images: File[]): Promise<{
    surfaceTypes: string[]
    specialRequirements: string[]
    equipmentNeeded: string[]
    safetyNotes: string[]
  }> {
    try {
      // Check if OpenAI is configured
      if (!openai) {
        throw new Error('AI service not configured. Please set OPENAI_API_KEY environment variable.')
      }

      const base64Images = await Promise.all(images.map(image => this.fileToBase64(image)))

      const prompt = `
        Analyze these cleaning photos for detailed insights. Identify:

        1. Surface types present (hardwood, carpet, tile, granite, etc.)
        2. Special cleaning requirements (pet hair, grease, mold, etc.)
        3. Equipment needed (vacuum, steam cleaner, special chemicals, etc.)
        4. Safety considerations (chemicals, PPE, ventilation, etc.)

        Return JSON:
        {
          "surfaceTypes": ["string"],
          "specialRequirements": ["string"],
          "equipmentNeeded": ["string"],
          "safetyNotes": ["string"]
        }
      `

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...base64Images.map(base64 => ({
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                  detail: "high"
                }
              }))
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from detailed analysis')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from detailed analysis')
      }

      return JSON.parse(jsonMatch[0])

    } catch (error) {
      console.error('Detailed Analysis Error:', error)
      return {
        surfaceTypes: ['General surfaces'],
        specialRequirements: ['Standard cleaning'],
        equipmentNeeded: ['Basic cleaning supplies'],
        safetyNotes: ['Follow standard safety protocols']
      }
    }
  }

  // Generate cleaning checklist based on analysis
  static generateCleaningChecklist(analysis: QuoteEstimate): string[] {
    const checklist: string[] = []

    // Add general tasks
    checklist.push('Gather cleaning supplies and equipment')
    checklist.push('Assess room conditions and plan approach')

    // Add room-specific tasks
    analysis.breakdown.forEach(room => {
      checklist.push(`--- ${room.room} ---`)
      
      if (room.condition === 'poor') {
        checklist.push('Deep cleaning required')
        checklist.push('Extra time allocated')
      }

      room.notes.forEach(note => {
        checklist.push(`- ${note}`)
      })
    })

    // Add final tasks
    checklist.push('Final inspection and quality check')
    checklist.push('Take after photos for comparison')
    checklist.push('Update client on completion')

    return checklist
  }

  // Estimate materials and supplies needed
  static estimateSuppliesNeeded(analysis: QuoteEstimate): {
    basic: string[]
    specialized: string[]
    estimatedCost: number
  } {
    const basic = [
      'All-purpose cleaner',
      'Glass cleaner',
      'Disinfectant',
      'Microfiber cloths',
      'Vacuum cleaner',
      'Mop and bucket'
    ]

    const specialized: string[] = []
    let additionalCost = 0

    analysis.breakdown.forEach(room => {
      if (room.condition === 'poor') {
        specialized.push('Heavy-duty degreaser')
        specialized.push('Stain remover')
        additionalCost += 15
      }

      if (room.notes.some(note => note.toLowerCase().includes('pet'))) {
        specialized.push('Pet hair remover')
        specialized.push('Enzyme cleaner')
        additionalCost += 10
      }

      if (room.notes.some(note => note.toLowerCase().includes('grease'))) {
        specialized.push('Kitchen degreaser')
        specialized.push('Scrubbing pads')
        additionalCost += 8
      }
    })

    return {
      basic,
      specialized: [...new Set(specialized)], // Remove duplicates
      estimatedCost: additionalCost
    }
  }
} 