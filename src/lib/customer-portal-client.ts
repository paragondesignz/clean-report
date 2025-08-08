import { createClient } from '@supabase/supabase-js'
import type { Database, Client, Job, JobWithClient } from '@/types/database'
import bcrypt from 'bcryptjs'

// Create a Supabase client for customer portal operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LoginResult {
  success: boolean
  client_id?: string
  client?: Client
  error?: string
}

interface CustomerPortalSession {
  client_id: string
  email: string
  loginTime: string
}

// Customer Portal Authentication
export async function loginCustomerPortal(email: string, password: string): Promise<LoginResult> {
  try {
    // Find client portal user by email
    const { data: portalUser, error: userError } = await supabase
      .from('client_portal_users')
      .select(`
        *,
        clients:client_id (*)
      `)
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (userError || !portalUser) {
      return { success: false, error: 'Account not found or inactive' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, portalUser.password_hash)
    
    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' }
    }

    // Update last login
    await supabase
      .from('client_portal_users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', portalUser.id)

    return {
      success: true,
      client_id: portalUser.client_id,
      client: portalUser.clients as Client
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Get customer portal session from sessionStorage
export function getCustomerPortalSession(): CustomerPortalSession | null {
  if (typeof window === 'undefined') return null
  
  try {
    const sessionData = sessionStorage.getItem('customer_portal_session')
    return sessionData ? JSON.parse(sessionData) : null
  } catch {
    return null
  }
}

// Clear customer portal session
export function clearCustomerPortalSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('customer_portal_session')
}

// Get client information
export async function getClientInfo(clientId: string): Promise<Client | null> {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) {
      console.error('Error fetching client info:', error)
      return null
    }

    return client
  } catch (error) {
    console.error('Error fetching client info:', error)
    return null
  }
}

// Get client's jobs with pagination and filters
export async function getClientJobs(
  clientId: string, 
  options: {
    status?: string[]
    limit?: number
    offset?: number
    sortBy?: 'scheduled_date' | 'created_at'
    sortOrder?: 'asc' | 'desc'
  } = {}
): Promise<JobWithClient[]> {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('client_id', clientId)

    // Apply status filter
    if (options.status && options.status.length > 0) {
      query = query.in('status', options.status)
    }

    // Apply sorting
    const sortBy = options.sortBy || 'scheduled_date'
    const sortOrder = options.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching client jobs:', error)
      return []
    }

    return jobs as JobWithClient[]
  } catch (error) {
    console.error('Error fetching client jobs:', error)
    return []
  }
}

// Get job statistics for client
export async function getClientJobStats(clientId: string) {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('status, total_time_seconds, agreed_hours, actual_cost, estimated_cost')
      .eq('client_id', clientId)

    if (error) {
      console.error('Error fetching job stats:', error)
      return null
    }

    const stats = {
      total_jobs: jobs.length,
      completed_jobs: jobs.filter(job => job.status === 'completed').length,
      scheduled_jobs: jobs.filter(job => job.status === 'scheduled').length,
      in_progress_jobs: jobs.filter(job => job.status === 'in_progress').length,
      total_hours: jobs.reduce((sum, job) => sum + (job.total_time_seconds || 0), 0) / 3600,
      agreed_hours: jobs.reduce((sum, job) => sum + (job.agreed_hours || 0), 0),
      total_cost: jobs.reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0)
    }

    return stats
  } catch (error) {
    console.error('Error calculating job stats:', error)
    return null
  }
}

// Get recent client feedback
export async function getClientFeedback(clientId: string, limit = 5) {
  try {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('jobs.client_id', clientId)
      .eq('is_submitted', true)
      .order('submitted_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching client feedback:', error)
      return []
    }

    return feedback
  } catch (error) {
    console.error('Error fetching client feedback:', error)
    return []
  }
}

// Create customer portal user account
export async function createCustomerPortalAccount(
  clientId: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create portal user account
    const { error } = await supabase
      .from('client_portal_users')
      .insert({
        client_id: clientId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        is_active: true
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'An account with this email already exists' }
      }
      console.error('Error creating customer portal account:', error)
      return { success: false, error: 'Failed to create account' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating customer portal account:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

// Send customer portal invitation email
export async function sendCustomerPortalInvitation(
  clientId: string,
  email: string,
  temporaryPassword: string
) {
  try {
    const response = await fetch('/api/customer-portal/send-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        email,
        temporaryPassword
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send invitation')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending customer portal invitation:', error)
    throw error
  }
}