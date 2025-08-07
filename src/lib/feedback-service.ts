import { supabase } from './supabase-client'
import type { Feedback, Job, Client } from '@/types/database'

export interface FeedbackData {
  rating: number
  comment?: string
}

export interface FeedbackTokenData {
  job: Job
  client: Client
  feedback?: Feedback
}

export class FeedbackService {
  /**
   * Create a feedback token for a job
   */
  static async createFeedbackToken(jobId: string): Promise<string | null> {
    try {
      // Check if feedback already exists for this job
      const { data: existingFeedback, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .eq('job_id', jobId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing feedback:', fetchError)
        return null
      }

      if (existingFeedback) {
        return existingFeedback.feedback_token
      }

      // Generate a unique token
      const token = this.generateToken()
      
      // Create feedback record
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          job_id: jobId,
          feedback_token: token,
          is_submitted: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating feedback token:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return null
      }

      return token
    } catch (error) {
      console.error('Error creating feedback token:', error)
      return null
    }
  }

  /**
   * Get feedback data by token
   */
  static async getFeedbackByToken(token: string): Promise<FeedbackTokenData | null> {
    try {
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('feedback_token', token)
        .single()

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError)
        return null
      }

      // Get job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', feedback.job_id)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        return null
      }

      // Get client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single()

      if (clientError) {
        console.error('Error fetching client:', clientError)
        return null
      }

      return {
        job,
        client,
        feedback: feedback.is_submitted ? feedback : undefined
      }
    } catch (error) {
      console.error('Error getting feedback by token:', error)
      return null
    }
  }

  /**
   * Submit feedback
   */
  static async submitFeedback(token: string, feedbackData: FeedbackData): Promise<boolean> {
    try {
      const { data: feedback, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .eq('feedback_token', token)
        .single()

      if (fetchError) {
        console.error('Error fetching feedback for submission:', fetchError)
        return false
      }

      if (feedback.is_submitted) {
        console.error('Feedback already submitted')
        return false
      }

      // Update feedback with rating and comment
      const { error: updateError } = await supabase
        .from('feedback')
        .update({
          rating: feedbackData.rating,
          comment: feedbackData.comment || null,
          is_submitted: true,
          submitted_at: new Date().toISOString()
        })
        .eq('feedback_token', token)

      if (updateError) {
        console.error('Error submitting feedback:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error submitting feedback:', error)
      return false
    }
  }

  /**
   * Get feedback statistics for a user
   */
  static async getFeedbackStats(userId: string): Promise<{
    totalFeedback: number
    averageRating: number
    ratingDistribution: Record<number, number>
  }> {
    try {
      // Get all feedback for jobs belonging to this user
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select(`
          rating,
          jobs!inner(user_id)
        `)
        .eq('jobs.user_id', userId)
        .eq('is_submitted', true)

      if (error) {
        console.error('Error fetching feedback stats:', error)
        return {
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {}
        }
      }

      const ratings = feedback.map(f => f.rating)
      const totalFeedback = ratings.length
      const averageRating = totalFeedback > 0 ? ratings.reduce((a, b) => a + b, 0) / totalFeedback : 0

      // Calculate rating distribution
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      ratings.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1
      })

      return {
        totalFeedback,
        averageRating,
        ratingDistribution
      }
    } catch (error) {
      console.error('Error getting feedback stats:', error)
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {}
      }
    }
  }

  /**
   * Generate a unique token
   */
  private static generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Get feedback URL for a job
   */
  static async getFeedbackUrl(jobId: string): Promise<string | null> {
    const token = await this.createFeedbackToken(jobId)
    if (!token) return null
    
    return `${window.location.origin}/feedback/${token}`
  }

  /**
   * Check if feedback has been submitted for a job
   */
  static async isFeedbackSubmitted(jobId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('is_submitted')
        .eq('job_id', jobId)
        .single()

      if (error) return false
      return data?.is_submitted || false
    } catch (error) {
      console.error('Error checking feedback submission status:', error)
      return false
    }
  }
} 