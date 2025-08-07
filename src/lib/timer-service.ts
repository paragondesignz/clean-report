import { supabase } from './supabase-client'
import type { Job } from '@/types/database'

export interface TimerState {
  isRunning: boolean
  startTime: Date | null
  elapsedSeconds: number
  totalSeconds: number
}

export class TimerService {
  private static timers = new Map<string, TimerState>()
  private static intervals = new Map<string, NodeJS.Timeout>()

  /**
   * Check if timer columns exist in the database
   */
  static async checkTimerColumns(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('timer_started_at, timer_ended_at, total_time_seconds')
        .limit(1)

      if (error) {
        console.error('Timer columns check failed:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking timer columns:', error)
      return false
    }
  }

  /**
   * Start timer for a job
   */
  static async startTimer(jobId: string): Promise<boolean> {
    try {
      // Check if timer columns exist
      const columnsExist = await this.checkTimerColumns()
      if (!columnsExist) {
        console.error('Timer columns do not exist. Please run the database migration.')
        return false
      }

      const startTime = new Date()
      
      // Update job in database
      const { error } = await supabase
        .from('jobs')
        .update({
          timer_started_at: startTime.toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) {
        console.error('Error starting timer:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      // Initialize timer state
      const timerState: TimerState = {
        isRunning: true,
        startTime,
        elapsedSeconds: 0,
        totalSeconds: 0
      }

      this.timers.set(jobId, timerState)

      // Start interval to update elapsed time
      const interval = setInterval(() => {
        const state = this.timers.get(jobId)
        if (state && state.isRunning && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime.getTime()) / 1000)
          state.elapsedSeconds = elapsed
        }
      }, 1000)

      this.intervals.set(jobId, interval)

      return true
    } catch (error) {
      console.error('Error starting timer:', error)
      return false
    }
  }

  /**
   * Stop timer for a job
   */
  static async stopTimer(jobId: string): Promise<boolean> {
    try {
      // Check if timer columns exist
      const columnsExist = await this.checkTimerColumns()
      if (!columnsExist) {
        console.error('Timer columns do not exist. Please run the database migration.')
        return false
      }

      const state = this.timers.get(jobId)
      if (!state || !state.isRunning) {
        return false
      }

      const endTime = new Date()
      const totalSeconds = state.totalSeconds + state.elapsedSeconds

      // Update job in database
      const { error } = await supabase
        .from('jobs')
        .update({
          timer_ended_at: endTime.toISOString(),
          total_time_seconds: totalSeconds,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) {
        console.error('Error stopping timer:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      // Clear interval
      const interval = this.intervals.get(jobId)
      if (interval) {
        clearInterval(interval)
        this.intervals.delete(jobId)
      }

      // Update timer state
      state.isRunning = false
      state.totalSeconds = totalSeconds
      state.elapsedSeconds = 0

      return true
    } catch (error) {
      console.error('Error stopping timer:', error)
      return false
    }
  }

  /**
   * Pause timer for a job (without completing)
   */
  static async pauseTimer(jobId: string): Promise<boolean> {
    try {
      // Check if timer columns exist
      const columnsExist = await this.checkTimerColumns()
      if (!columnsExist) {
        console.error('Timer columns do not exist. Please run the database migration.')
        return false
      }

      const state = this.timers.get(jobId)
      if (!state || !state.isRunning) {
        return false
      }

      const totalSeconds = state.totalSeconds + state.elapsedSeconds

      // Update job in database
      const { error } = await supabase
        .from('jobs')
        .update({
          total_time_seconds: totalSeconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) {
        console.error('Error pausing timer:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      // Clear interval
      const interval = this.intervals.get(jobId)
      if (interval) {
        clearInterval(interval)
        this.intervals.delete(jobId)
      }

      // Update timer state
      state.isRunning = false
      state.totalSeconds = totalSeconds
      state.elapsedSeconds = 0

      return true
    } catch (error) {
      console.error('Error pausing timer:', error)
      return false
    }
  }

  /**
   * Resume timer for a job
   */
  static async resumeTimer(jobId: string): Promise<boolean> {
    try {
      // Check if timer columns exist
      const columnsExist = await this.checkTimerColumns()
      if (!columnsExist) {
        console.error('Timer columns do not exist. Please run the database migration.')
        return false
      }

      const state = this.timers.get(jobId)
      if (!state || state.isRunning) {
        return false
      }

      const startTime = new Date()
      
      // Update job in database
      const { error } = await supabase
        .from('jobs')
        .update({
          timer_started_at: startTime.toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) {
        console.error('Error resuming timer:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      // Update timer state
      state.isRunning = true
      state.startTime = startTime
      state.elapsedSeconds = 0

      // Start interval to update elapsed time
      const interval = setInterval(() => {
        const currentState = this.timers.get(jobId)
        if (currentState && currentState.isRunning && currentState.startTime) {
          const elapsed = Math.floor((Date.now() - currentState.startTime.getTime()) / 1000)
          currentState.elapsedSeconds = elapsed
        }
      }, 1000)

      this.intervals.set(jobId, interval)

      return true
    } catch (error) {
      console.error('Error resuming timer:', error)
      return false
    }
  }

  /**
   * Get timer state for a job
   */
  static getTimerState(jobId: string): TimerState | null {
    return this.timers.get(jobId) || null
  }

  /**
   * Initialize timer state from job data
   */
  static initializeTimer(job: Job): void {
    const state: TimerState = {
      isRunning: false,
      startTime: job?.timer_started_at ? new Date(job.timer_started_at) : null,
      elapsedSeconds: 0,
      totalSeconds: job.total_time_seconds || 0
    }

    // If timer is currently running, start the interval
    if (job?.timer_started_at && !job?.timer_ended_at) {
      state.isRunning = true
      state.startTime = new Date(job.timer_started_at)
      
      const interval = setInterval(() => {
        const currentState = this.timers.get(job.id)
        if (currentState && currentState.isRunning && currentState.startTime) {
          const elapsed = Math.floor((Date.now() - currentState.startTime.getTime()) / 1000)
          currentState.elapsedSeconds = elapsed
        }
      }, 1000)

      this.intervals.set(job.id, interval)
    }

    this.timers.set(job.id, state)
  }

  /**
   * Format time in HH:MM:SS format
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Get total time for a job (including current session)
   */
  static getTotalTime(jobId: string): number {
    const state = this.timers.get(jobId)
    if (!state) return 0

    return state.totalSeconds + state.elapsedSeconds
  }

  /**
   * Clean up timers when component unmounts
   */
  static cleanup(jobId: string): void {
    const interval = this.intervals.get(jobId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(jobId)
    }
    this.timers.delete(jobId)
  }

  /**
   * Check if a job has an active timer
   */
  static isTimerActive(jobId: string): boolean {
    const state = this.timers.get(jobId)
    return state?.isRunning || false
  }
} 