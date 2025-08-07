"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react"
import { FeedbackService } from "@/lib/feedback-service"
import { useAuth } from "@/components/auth/auth-provider"

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  ratingDistribution: Record<number, number>
}

export function FeedbackDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        const feedbackStats = await FeedbackService.getFeedbackStats(user.id)
        setStats(feedbackStats)
      } catch (error) {
        console.error('Error fetching feedback stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No feedback data available</p>
        </CardContent>
      </Card>
    )
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return "Unknown"
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return "bg-red-100 text-red-800"
      case 2: return "bg-orange-100 text-orange-800"
      case 3: return "bg-yellow-100 text-yellow-800"
      case 4: return "bg-blue-100 text-blue-800"
      case 5: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Stats Row - Takes full width */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <div>
            <div className="text-xl font-bold">{stats.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">Total Feedback</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Star className="h-8 w-8 text-yellow-500" />
          <div>
            <div className="text-xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-green-500" />
          <div>
            <div className="text-xl font-bold">
              {stats.totalFeedback > 0 
                ? Math.round(((stats.ratingDistribution[4] || 0) + (stats.ratingDistribution[5] || 0)) / stats.totalFeedback * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Rating Distribution - Compact horizontal view */}
      <div className="lg:col-span-8">
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-3">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0
            const percentage = stats.totalFeedback > 0 ? (count / stats.totalFeedback) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1 w-10">
                  <span className="font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-600 w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights - Compact */}
      <div className="lg:col-span-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-3">Insights</h4>
          <div className="space-y-2">
            {stats.averageRating >= 4.5 && (
              <div className="flex items-center space-x-2 text-green-600 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>Excellent performance!</span>
              </div>
            )}
            
            {stats.averageRating >= 4.0 && stats.averageRating < 4.5 && (
              <div className="flex items-center space-x-2 text-blue-600 text-xs">
                <Star className="h-3 w-3" />
                <span>Good performance</span>
              </div>
            )}
            
            {stats.averageRating < 4.0 && stats.totalFeedback > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 text-xs">
                <MessageSquare className="h-3 w-3" />
                <span>Room for improvement</span>
              </div>
            )}
            
            {stats.totalFeedback === 0 && (
              <div className="flex items-center space-x-2 text-gray-600 text-xs">
                <Users className="h-3 w-3" />
                <span>No feedback yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 