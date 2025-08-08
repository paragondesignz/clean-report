"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Star, Send, ThumbsUp } from "lucide-react"

interface GeneralFeedbackFormProps {
  clientId: string
  onSubmitted?: () => void
}

export function GeneralFeedbackForm({ clientId, onSubmitted }: GeneralFeedbackFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [feedbackType, setFeedbackType] = useState<'general' | 'suggestion' | 'complaint'>('general')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting feedback.",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/feedback/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          rating,
          comment: comment.trim(),
          feedbackType,
          source: 'customer_portal'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
        variant: "default"
      })

      // Reset form
      setRating(0)
      setComment('')
      setFeedbackType('general')
      
      onSubmitted?.()

    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1
      return (
        <button
          key={index}
          type="button"
          className={`text-2xl transition-colors ${
            (hoverRating || rating) >= starValue 
              ? 'text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      )
    })
  }

  const getFeedbackTypeDescription = () => {
    switch (feedbackType) {
      case 'general':
        return 'Share your overall experience with our cleaning service'
      case 'suggestion':
        return 'Help us improve by sharing your ideas and suggestions'
      case 'complaint':
        return 'Let us know about any issues so we can address them promptly'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Share Your Feedback</CardTitle>
        </div>
        <CardDescription>
          Help us improve our service by sharing your thoughts and experiences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type of Feedback</Label>
            <RadioGroup 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="text-sm">General Feedback</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="suggestion" />
                <Label htmlFor="suggestion" className="text-sm">Suggestion for Improvement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complaint" id="complaint" />
                <Label htmlFor="complaint" className="text-sm">Complaint or Issue</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-600 mt-1">
              {getFeedbackTypeDescription()}
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comments {feedbackType === 'complaint' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedbackType === 'general' 
                  ? "Tell us about your experience with our cleaning service..."
                  : feedbackType === 'suggestion'
                  ? "What suggestions do you have for improving our service?"
                  : "Please describe the issue you experienced so we can address it..."
              }
              rows={4}
              className="resize-none"
              required={feedbackType === 'complaint'}
            />
            <p className="text-xs text-gray-500">
              {feedbackType === 'complaint' 
                ? "Please provide details about the issue to help us resolve it."
                : "Your detailed feedback helps us provide better service."}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}