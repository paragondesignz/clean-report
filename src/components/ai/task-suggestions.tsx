"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Lightbulb,
  Check,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Target
} from "lucide-react"
import { getTaskSuggestions, updateTaskSuggestionStatus, saveTaskSuggestion } from "@/lib/supabase-client"
import { aiTaskSuggestionEngine, prepareClientAnalysisData, type TaskSuggestion } from "@/lib/ai-task-suggestions"

interface TaskSuggestionsProps {
  clientId?: string
  recurringJobId?: string
  onTaskAdded?: (task: any) => void
  showGenerateButton?: boolean
  clientData?: {
    name: string
    propertyType: string
    recurringJobs: any[]
    completionHistory: any[]
  }
}

export function TaskSuggestions({ 
  clientId, 
  recurringJobId, 
  onTaskAdded, 
  showGenerateButton = true,
  clientData 
}: TaskSuggestionsProps) {
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (clientId) {
      loadSuggestions()
    }
  }, [clientId])

  const loadSuggestions = async () => {
    if (!clientId) return

    try {
      setLoading(true)
      const data = await getTaskSuggestions(clientId, 'pending')
      setSuggestions(data)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = async () => {
    if (!clientData || !clientId) return

    try {
      setGenerating(true)
      
      // Prepare data for AI analysis
      const analysisData = await prepareClientAnalysisData(
        clientId,
        clientData.name,
        clientData.propertyType,
        clientData.recurringJobs,
        clientData.completionHistory
      )

      // Generate AI suggestions
      const newSuggestions = await aiTaskSuggestionEngine.generateTaskSuggestions(analysisData)

      // Save suggestions to database
      const savedSuggestions = await Promise.all(
        newSuggestions.map(suggestion => saveTaskSuggestion(suggestion))
      )

      setSuggestions(prev => [...savedSuggestions, ...prev])

      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${newSuggestions.length} intelligent task suggestions based on your patterns.`,
        duration: 5000
      })

    } catch (error) {
      console.error('Error generating suggestions:', error)
      const errorMessage = error instanceof Error && error.message.includes('API key not configured') 
        ? "AI suggestions require OpenAI API key configuration. Please contact administrator."
        : "Could not generate suggestions. Please try again."
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const acceptSuggestion = async (suggestion: TaskSuggestion) => {
    try {
      // Update status to accepted
      await updateTaskSuggestionStatus(suggestion.id, 'accepted')

      // If onTaskAdded callback is provided, call it with the suggested task
      if (onTaskAdded) {
        onTaskAdded({
          title: suggestion.suggestedTask.title,
          description: suggestion.suggestedTask.description,
          estimatedDuration: suggestion.suggestedTask.estimatedDuration,
          priority: suggestion.suggestedTask.priority,
          category: suggestion.suggestedTask.category
        })
      }

      // Remove from pending suggestions
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))

      toast({
        title: "Task Added",
        description: `"${suggestion.suggestedTask.title}" has been added to your task list.`,
        duration: 3000
      })

    } catch (error) {
      console.error('Error accepting suggestion:', error)
      toast({
        title: "Error",
        description: "Could not add the suggested task.",
        variant: "destructive"
      })
    }
  }

  const dismissSuggestion = async (suggestion: TaskSuggestion) => {
    try {
      await updateTaskSuggestionStatus(suggestion.id, 'dismissed')
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))

      toast({
        title: "Suggestion Dismissed",
        description: "The suggestion has been marked as not relevant.",
        duration: 2000
      })

    } catch (error) {
      console.error('Error dismissing suggestion:', error)
      toast({
        title: "Error",
        description: "Could not dismiss the suggestion.",
        variant: "destructive"
      })
    }
  }

  const toggleExpanded = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId)
    } else {
      newExpanded.add(suggestionId)
    }
    setExpandedSuggestions(newExpanded)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'new_task': return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case 'frequency_adjustment': return <Clock className="h-5 w-5 text-blue-500" />
      case 'seasonal_task': return <RefreshCw className="h-5 w-5 text-green-500" />
      case 'maintenance_reminder': return <AlertCircle className="h-5 w-5 text-orange-500" />
      default: return <Sparkles className="h-5 w-5 text-purple-500" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 75) return 'text-blue-600 bg-blue-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Loading AI suggestions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">AI Task Suggestions</CardTitle>
          </div>
          {showGenerateButton && clientData && (
            <Button
              onClick={generateSuggestions}
              disabled={generating}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          )}
        </div>
        <CardDescription>
          AI-powered recommendations based on your cleaning patterns and industry best practices
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No AI suggestions yet</p>
            {showGenerateButton && clientData && (
              <p className="text-sm text-gray-500">
                Click "Generate Suggestions" to get AI-powered task recommendations
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Suggested Task Details */}
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-800">
                          {suggestion.suggestedTask.title}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPriorityColor(suggestion.suggestedTask.priority)}`}>
                            {suggestion.suggestedTask.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.suggestedTask.frequency}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.suggestedTask.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          ~{suggestion.suggestedTask.estimatedDuration} min
                        </span>
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {suggestion.suggestedTask.category}
                        </span>
                      </div>
                    </div>

                    {/* Reasoning (expandable) */}
                    <div className="border-t border-gray-200 pt-3">
                      <button
                        onClick={() => toggleExpanded(suggestion.id)}
                        className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <span className="mr-1">Why this suggestion?</span>
                        {expandedSuggestions.has(suggestion.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      
                      {expandedSuggestions.has(suggestion.id) && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-900">
                            {suggestion.reasoning}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dismissSuggestion(suggestion)}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptSuggestion(suggestion)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}