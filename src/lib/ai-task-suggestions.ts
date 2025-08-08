import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TaskPattern {
  taskName: string
  frequency: number // days
  completionRate: number // percentage
  lastCompleted?: string
  recurringJobId: string
  clientType: string // residential, commercial, etc.
}

export interface TaskSuggestion {
  id: string
  type: 'new_task' | 'frequency_adjustment' | 'seasonal_task' | 'maintenance_reminder'
  title: string
  description: string
  suggestedTask: {
    title: string
    description: string
    frequency?: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'bi_annual' | 'annual'
    estimatedDuration?: number // minutes
    priority: 'low' | 'medium' | 'high'
    category: 'cleaning' | 'maintenance' | 'inspection' | 'seasonal'
  }
  confidence: number // 0-100
  reasoning: string
  clientId: string
  recurringJobId?: string
  createdAt: string
  status: 'pending' | 'accepted' | 'dismissed' | 'implemented'
}

export interface ClientAnalysisData {
  clientId: string
  clientName: string
  propertyType: 'residential' | 'commercial' | 'office' | 'retail' | 'restaurant' | 'medical'
  recurringJobs: Array<{
    id: string
    title: string
    frequency: string
    tasks: Array<{
      title: string
      description: string
      completionRate: number
      avgTimeToComplete?: number
    }>
    createdAt: string
    lastModified: string
  }>
  seasonalPatterns?: Array<{
    season: 'spring' | 'summer' | 'autumn' | 'winter'
    additionalTasks: string[]
    frequencyChanges: Record<string, number>
  }>
  completionHistory: Array<{
    date: string
    tasksCompleted: number
    tasksTotal: number
    commonSkippedTasks: string[]
  }>
}

class AITaskSuggestionEngine {
  private async analyzeTaskPatterns(clientData: ClientAnalysisData): Promise<string> {
    const prompt = `
You are an AI assistant specialized in commercial and residential cleaning operations. Analyze the following client data and provide intelligent task suggestions.

Client Information:
- Name: ${clientData.clientName}
- Property Type: ${clientData.propertyType}
- Active Recurring Jobs: ${clientData.recurringJobs.length}

Current Recurring Jobs & Tasks:
${clientData.recurringJobs.map(job => `
  Job: "${job.title}" (${job.frequency})
  Tasks:
  ${job.tasks.map(task => `    - ${task.title} (completion rate: ${task.completionRate}%)`).join('\n')}
`).join('\n')}

Recent Completion Patterns:
${clientData.completionHistory.slice(-5).map(h => 
  `  ${h.date}: ${h.tasksCompleted}/${h.tasksTotal} completed${h.commonSkippedTasks.length > 0 ? `, commonly skipped: ${h.commonSkippedTasks.join(', ')}` : ''}`
).join('\n')}

Based on this data, suggest 1-3 intelligent task recommendations that would:
1. Improve cleaning effectiveness
2. Address commonly missed maintenance items
3. Optimize scheduling based on property type
4. Suggest seasonal or periodic deep cleaning tasks

For each suggestion, consider:
- Industry best practices for ${clientData.propertyType} cleaning
- Maintenance schedules that prevent larger issues
- Tasks that complement existing routines
- Frequency recommendations based on usage and wear patterns

Respond in JSON format with suggestions array containing objects with:
{
  "type": "new_task" | "frequency_adjustment" | "seasonal_task" | "maintenance_reminder",
  "title": "Brief suggestion title",
  "description": "User-friendly explanation of why this is beneficial",
  "suggestedTask": {
    "title": "Task name",
    "description": "Detailed task description", 
    "frequency": "weekly|bi_weekly|monthly|quarterly|bi_annual|annual",
    "estimatedDuration": minutes,
    "priority": "low|medium|high",
    "category": "cleaning|maintenance|inspection|seasonal"
  },
  "confidence": 85,
  "reasoning": "Explanation of why this suggestion makes sense based on the data"
}
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are an expert cleaning industry consultant with 20+ years of experience in commercial and residential cleaning operations, maintenance scheduling, and quality assurance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      return response.choices[0].message.content || ""
    } catch (error) {
      console.error('Error calling OpenAI for task analysis:', error)
      throw error
    }
  }

  async generateTaskSuggestions(clientData: ClientAnalysisData): Promise<TaskSuggestion[]> {
    try {
      const aiResponse = await this.analyzeTaskPatterns(clientData)
      const suggestions = JSON.parse(aiResponse)
      
      return suggestions.suggestions?.map((suggestion: any, index: number) => ({
        id: `suggestion_${Date.now()}_${index}`,
        ...suggestion,
        clientId: clientData.clientId,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      })) || []
    } catch (error) {
      console.error('Error generating task suggestions:', error)
      // Fallback to rule-based suggestions if AI fails
      return this.generateFallbackSuggestions(clientData)
    }
  }

  private generateFallbackSuggestions(clientData: ClientAnalysisData): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = []
    const now = new Date().toISOString()

    // Rule-based suggestions as fallback
    const commonMissedTasks = clientData.completionHistory
      .flatMap(h => h.commonSkippedTasks)
      .reduce((acc, task) => {
        acc[task] = (acc[task] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Suggest addressing commonly missed tasks
    Object.entries(commonMissedTasks)
      .filter(([_, count]) => count >= 2)
      .slice(0, 2)
      .forEach(([taskName, count], index) => {
        suggestions.push({
          id: `fallback_${Date.now()}_${index}`,
          type: 'frequency_adjustment',
          title: `Address frequently skipped task: ${taskName}`,
          description: `This task has been skipped ${count} times recently. Consider adjusting the frequency or breaking it into smaller tasks.`,
          suggestedTask: {
            title: taskName,
            description: `Modified approach to ${taskName} - consider shorter, more frequent sessions`,
            frequency: 'bi_weekly',
            estimatedDuration: 15,
            priority: 'medium',
            category: 'cleaning'
          },
          confidence: 75,
          reasoning: `Statistical analysis shows this task is skipped frequently, suggesting current scheduling may not be optimal.`,
          clientId: clientData.clientId,
          createdAt: now,
          status: 'pending'
        })
      })

    // Property-type specific suggestions
    if (clientData.propertyType === 'commercial' || clientData.propertyType === 'office') {
      suggestions.push({
        id: `fallback_commercial_${Date.now()}`,
        type: 'maintenance_reminder',
        title: 'Add quarterly deep sanitization',
        description: 'Commercial spaces benefit from quarterly deep sanitization of high-touch surfaces and air vents.',
        suggestedTask: {
          title: 'Deep Sanitization & Air Vent Cleaning',
          description: 'Comprehensive sanitization of all surfaces, door handles, light switches, and air vent cleaning',
          frequency: 'quarterly',
          estimatedDuration: 120,
          priority: 'high',
          category: 'maintenance'
        },
        confidence: 90,
        reasoning: 'Commercial spaces require regular deep sanitization for health compliance and employee wellbeing.',
        clientId: clientData.clientId,
        createdAt: now,
        status: 'pending'
      })
    }

    return suggestions
  }

  async analyzeLearningPatterns(userId: string): Promise<{
    preferredTaskTypes: string[]
    acceptanceRate: number
    commonReasons: string[]
    preferredCategories: string[]
    avgConfidenceAccepted: number
  }> {
    try {
      // In a real implementation, this would query the task_suggestions table
      // For now, return intelligent defaults that improve over time
      
      // Mock learning analysis - in production this would:
      // 1. Query accepted vs dismissed suggestions
      // 2. Analyze patterns in task types, categories, confidence levels
      // 3. Weight recent decisions more heavily
      // 4. Consider seasonal patterns
      
      return {
        preferredTaskTypes: ['maintenance_reminder', 'seasonal_task'],
        acceptanceRate: 75,
        commonReasons: [
          'Preventive maintenance saves money long-term',
          'Seasonal tasks improve client satisfaction',
          'Regular maintenance prevents larger issues'
        ],
        preferredCategories: ['maintenance', 'cleaning'],
        avgConfidenceAccepted: 80
      }
    } catch (error) {
      console.error('Error analyzing learning patterns:', error)
      return {
        preferredTaskTypes: ['maintenance_reminder'],
        acceptanceRate: 50,
        commonReasons: ['General maintenance'],
        preferredCategories: ['cleaning'],
        avgConfidenceAccepted: 70
      }
    }
  }

  async adjustSuggestionsBasedOnLearning(
    suggestions: TaskSuggestion[], 
    userId: string
  ): Promise<TaskSuggestion[]> {
    try {
      const patterns = await this.analyzeLearningPatterns(userId)
      
      return suggestions.map(suggestion => {
        let adjustedConfidence = suggestion.confidence
        
        // Boost confidence for preferred task types
        if (patterns.preferredTaskTypes.includes(suggestion.type)) {
          adjustedConfidence = Math.min(100, adjustedConfidence + 10)
        }
        
        // Boost confidence for preferred categories
        if (patterns.preferredCategories.includes(suggestion.suggestedTask.category)) {
          adjustedConfidence = Math.min(100, adjustedConfidence + 5)
        }
        
        // Adjust based on user's historical acceptance of confidence levels
        if (suggestion.confidence < patterns.avgConfidenceAccepted - 10) {
          adjustedConfidence = Math.max(20, adjustedConfidence - 5)
        }
        
        return {
          ...suggestion,
          confidence: adjustedConfidence
        }
      }).sort((a, b) => b.confidence - a.confidence) // Sort by adjusted confidence
    } catch (error) {
      console.error('Error adjusting suggestions:', error)
      return suggestions
    }
  }
}

export const aiTaskSuggestionEngine = new AITaskSuggestionEngine()

// Helper functions for data collection
export async function prepareClientAnalysisData(
  clientId: string,
  clientName: string,
  propertyType: string,
  recurringJobs: any[],
  completionHistory: any[]
): Promise<ClientAnalysisData> {
  return {
    clientId,
    clientName,
    propertyType: propertyType as ClientAnalysisData['propertyType'],
    recurringJobs: recurringJobs.map(job => ({
      id: job.id,
      title: job.title,
      frequency: job.frequency,
      tasks: job.tasks || [],
      createdAt: job.created_at,
      lastModified: job.updated_at || job.created_at
    })),
    completionHistory: completionHistory.map(h => ({
      date: h.date,
      tasksCompleted: h.completed_tasks,
      tasksTotal: h.total_tasks,
      commonSkippedTasks: h.skipped_tasks || []
    }))
  }
}