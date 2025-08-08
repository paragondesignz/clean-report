"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Brain,
  ThumbsUp,
  Target
} from "lucide-react"
import type { FeedbackInsights } from "@/lib/ai-feedback-insights"

export function CustomerFeedbackInsights() {
  const [insights, setInsights] = useState<FeedbackInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError('User not authenticated')
        return
      }

      const response = await fetch('/api/feedback/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        throw new Error('Failed to load feedback insights')
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      console.error('Error loading feedback insights:', err)
      setError('Unable to load feedback insights')
      toast({
        title: "Error",
        description: "Failed to load customer feedback insights",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (user) {
      loadInsights()
    }
  }, [user, loadInsights])

  const getSentimentIcon = () => {
    if (!insights) return <MessageSquare className="h-5 w-5 text-gray-400" />
    
    switch (insights.overall_sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <MessageSquare className="h-5 w-5 text-yellow-600" />
    }
  }

  const getSentimentColor = () => {
    if (!insights) return 'bg-gray-100 text-gray-800'
    
    switch (insights.overall_sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>Customer Feedback Insights</CardTitle>
          </div>
          <CardDescription>AI-powered analysis of customer feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analyzing customer feedback...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>Customer Feedback Insights</CardTitle>
          </div>
          <CardDescription>AI-powered analysis of customer feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center mb-4">{error || 'Failed to load insights'}</p>
          <Button onClick={loadInsights} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>Customer Feedback Insights</CardTitle>
          </div>
          <Button onClick={loadInsights} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>AI-powered analysis of customer feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-2xl font-bold text-gray-900">
                {insights.total_feedback_count}
              </span>
            </div>
            <p className="text-xs text-gray-600">Total Reviews</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              {renderStars(insights.average_rating)}
            </div>
            <p className="text-xs text-gray-600">
              {insights.average_rating.toFixed(1)} Average Rating
            </p>
          </div>
        </div>

        {/* Overall Sentiment */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Sentiment</span>
          <Badge className={getSentimentColor()}>
            {getSentimentIcon()}
            <span className="ml-1 capitalize">{insights.overall_sentiment}</span>
          </Badge>
        </div>

        <Separator />

        {/* AI Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-sm">AI Summary</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {insights.summary}
          </p>
        </div>

        <Separator />

        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-sm">Key Strengths</h4>
            </div>
            <ul className="space-y-1">
              {insights.strengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="flex-1">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {insights.areas_for_improvement.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-sm">Areas for Improvement</h4>
              </div>
              <ul className="space-y-1">
                {insights.areas_for_improvement.slice(0, 3).map((area, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span className="flex-1">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Key Themes */}
        {insights.key_themes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm">Key Themes</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.key_themes.slice(0, 4).map((theme, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-sm">AI Recommendations</h4>
              </div>
              <ul className="space-y-1">
                {insights.recommendations.slice(0, 2).map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="flex-1">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}