"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star, MessageSquare, CheckCircle, Calendar, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Feedback } from "@/types/database"

export default function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [jobDetails, setJobDetails] = useState({
    title: "",
    client_name: "",
    completed_date: "",
    description: ""
  })
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ""
  })

  useEffect(() => {
    // TODO: Fetch feedback token details from Supabase
    // For now, using placeholder data
    setJobDetails({
      title: "Cleaning Service",
      client_name: "Client",
      completed_date: "2025-08-04",
      description: "Cleaning service completed"
    })
    setLoading(false)
  }, [token])

  const handleRatingClick = (rating: number) => {
    setFeedback({ ...feedback, rating })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // TODO: Submit feedback to Supabase
      // For now, just simulate success
      setSubmitted(true)
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your input and will use it to improve our services.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                We hope to see you again soon for your next cleaning service!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Service Feedback</h1>
          </div>
          <p className="text-gray-600">Help us improve by sharing your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How was your cleaning service?</CardTitle>
            <CardDescription>
              We value your feedback and use it to improve our services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Job Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Service Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Client: {jobDetails.client_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Completed: {formatDate(jobDetails.completed_date)}</span>
                </div>
                <div>
                  <span className="font-medium">Service:</span> {jobDetails.title}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {jobDetails.description}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Rate your experience</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        feedback.rating >= star
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  {feedback.rating === 0 && "Click a star to rate"}
                  {feedback.rating === 1 && "Poor - We're sorry to hear that"}
                  {feedback.rating === 2 && "Fair - We'll work to improve"}
                  {feedback.rating === 3 && "Good - Thank you for your feedback"}
                  {feedback.rating === 4 && "Very Good - We're glad you're satisfied"}
                  {feedback.rating === 5 && "Excellent - We're thrilled you loved it!"}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Tell us more about your experience, what went well, or what we could improve..."
                  rows={4}
                />
              </div>

              {/* Rating Guide */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Rating Guide</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 1 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Poor - Service was not satisfactory</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 2 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Fair - Service needs improvement</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 3 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Good - Service was adequate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Very Good - Service exceeded expectations</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <span>Excellent - Outstanding service experience</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || feedback.rating === 0}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Feedback Matters</CardTitle>
            <CardDescription>
              We use your feedback to improve our services and ensure customer satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                • Your feedback helps us maintain high service standards
              </p>
              <p>
                • We review all feedback and use it to train our team
              </p>
              <p>
                • Low ratings are immediately flagged for follow-up
              </p>
              <p>
                • We may contact you for additional details if needed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 