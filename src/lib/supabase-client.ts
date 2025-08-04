import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Service role client for admin operations
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Client operations
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createClientRecord = async (clientData: {
  name: string
  email: string
  phone: string
  address: string
}) => {
  try {
    // Check if we have the required environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user to ensure authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Add user_id to the client data
    const clientDataWithUser = {
      ...clientData,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([clientDataWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error details:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('createClientRecord error:', error)
    throw error
  }
}

export const updateClientRecord = async (id: string, clientData: Partial<{
  name: string
  email: string
  phone: string
  address: string
}>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error details:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('updateClientRecord error:', error)
    throw error
  }
}

export const deleteClientRecord = async (id: string) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const getClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      notes:client_notes(*)
    `)
    .eq('id', clientId)
    .single()
  
  if (error) throw error
  return data
}

// Job operations
export const getJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:clients(name, email)
    `)
    .order('scheduled_date', { ascending: true })
  
  if (error) throw error
  return data
}

export const createJob = async (jobData: {
  client_id: string
  title: string
  description: string
  scheduled_date: string
  scheduled_time: string
  status?: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}) => {
  try {
    // Check if we have the required environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user to ensure authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Add user_id to the job data
    const jobDataWithUser = {
      ...jobData,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([jobDataWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase job creation error details:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('createJob error:', error)
    throw error
  }
}

export const updateJob = async (id: string, jobData: Partial<{
  title: string
  description: string
  scheduled_date: string
  scheduled_time: string
  status: 'enquiry' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}>) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(jobData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteJob = async (id: string) => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const getJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:clients(*),
      tasks:tasks(*),
      notes:notes(*),
      photos:photos(*)
    `)
    .eq('id', jobId)
    .single()
  
  if (error) throw error
  return data
}

// Task operations
export const getTasks = async (jobId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('job_id', jobId)
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data
}

export const createTask = async (taskData: {
  job_id: string
  title: string
  description: string
  order_index: number
}) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateTask = async (id: string, taskData: Partial<{
  title: string
  description: string
  is_completed: boolean
  order_index: number
}>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Photo operations
export const uploadPhoto = async (file: File, taskId: string) => {
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${taskId}/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filePath, file)
  
  if (error) throw error
  
  // Create photo record
  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .insert([{
      task_id: taskId,
      file_path: data.path,
      file_name: file.name,
      file_size: file.size
    }])
    .select()
    .single()
  
  if (photoError) throw photoError
  return photoData
}

export const getPhotos = async (taskId: string) => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// Report operations
export const createReport = async (jobId: string, reportUrl: string) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        job_id: jobId,
        report_url: reportUrl
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase report creation error details:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('createReport error:', error)
    throw error
  }
}

export const updateReport = async (reportId: string, reportData: Partial<{
  email_sent: boolean
  sent_at: string
}>) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update(reportData)
      .eq('id', reportId)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase report update error details:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('updateReport error:', error)
    throw error
  }
}

export const getReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      job:jobs(
        title,
        scheduled_date,
        client:clients(name)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// User profile operations
export const getUserProfile = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const createUserProfile = async (profileData: {
  company_name: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  email_template?: string
  contact_email?: string
  contact_phone?: string
  website_url?: string
}) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      ...profileData,
      user_id: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateUserProfile = async (profileData: Partial<{
  company_name: string
  logo_url: string
  primary_color: string
  secondary_color: string
  email_template: string
  contact_email: string
  contact_phone: string
  website_url: string
}>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Calendar integration operations
export const getCalendarIntegration = async () => {
  const { data, error } = await supabase
    .from('calendar_integrations')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const createCalendarIntegration = async (integrationData: {
  calendar_url: string
  calendar_type?: 'google' | 'outlook' | 'ical'
  is_active?: boolean
}) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('calendar_integrations')
    .insert([{
      ...integrationData,
      user_id: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateCalendarIntegration = async (integrationData: Partial<{
  calendar_url: string
  calendar_type: 'google' | 'outlook' | 'ical'
  is_active: boolean
  last_sync: string | null
}>) => {
  const { data, error } = await supabase
    .from('calendar_integrations')
    .update(integrationData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Recurring job operations
export const getRecurringJobs = async () => {
  const { data, error } = await supabase
    .from('recurring_jobs')
    .select(`
      *,
      client:clients(name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createRecurringJob = async (jobData: {
  client_id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly'
  start_date: string
  end_date?: string
  scheduled_time: string
  is_active?: boolean
}) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('recurring_jobs')
    .insert([{
      ...jobData,
      user_id: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateRecurringJob = async (id: string, jobData: Partial<{
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly'
  start_date: string
  end_date?: string
  scheduled_time: string
  is_active: boolean
}>) => {
  const { data, error } = await supabase
    .from('recurring_jobs')
    .update(jobData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteRecurringJob = async (id: string) => {
  const { error } = await supabase
    .from('recurring_jobs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Supply operations
export const getSupplies = async () => {
  const { data, error } = await supabase
    .from('supplies')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data
}

export const createSupply = async (supplyData: {
  name: string
  description?: string
  current_stock: number
  low_stock_threshold: number
  unit: string
}) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('supplies')
    .insert([{
      ...supplyData,
      user_id: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateSupply = async (id: string, supplyData: Partial<{
  name: string
  description: string
  current_stock: number
  low_stock_threshold: number
  unit: string
}>) => {
  const { data, error } = await supabase
    .from('supplies')
    .update(supplyData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteSupply = async (id: string) => {
  const { error } = await supabase
    .from('supplies')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Booking operations
export const createBookingRequest = async (bookingData: {
  client_name: string
  client_email: string
  client_phone: string
  requested_date: string
  requested_time: string
  service_type: string
  description?: string
  booking_token: string
}) => {
  const { data, error } = await supabase
    .from('booking_requests')
    .insert([bookingData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getBookingRequests = async () => {
  const { data, error } = await supabase
    .from('booking_requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateBookingRequest = async (id: string, status: 'pending' | 'confirmed' | 'rejected' | 'cancelled') => {
  const { data, error } = await supabase
    .from('booking_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const createJobFromBookingRequest = async (bookingData: {
  client_name: string
  client_email: string
  client_phone: string
  requested_date: string
  requested_time: string
  service_types: string[]
  description: string
  booking_token: string
}) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // First, create or find the client
    let clientId: string
    
    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('email', bookingData.client_email)
      .single()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          user_id: user.id,
          name: bookingData.client_name,
          email: bookingData.client_email,
          phone: bookingData.client_phone,
          address: '' // Will be filled in later
        }])
        .select()
        .single()

      if (clientError) throw clientError
      clientId = newClient.id
    }

    // Create the job with 'enquiry' status
    const serviceTypesDisplay = bookingData.service_types
      .map(type => {
        const serviceMap: Record<string, string> = {
          'general_cleaning': 'General Cleaning',
          'deep_cleaning': 'Deep Cleaning',
          'kitchen_cleaning': 'Kitchen Cleaning',
          'bathroom_cleaning': 'Bathroom Cleaning',
          'carpet_cleaning': 'Carpet Cleaning',
          'window_cleaning': 'Window Cleaning',
          'move_in_out': 'Move In/Out Cleaning'
        }
        return serviceMap[type] || type
      })
      .join(', ')

    const jobTitle = `Booking Request - ${bookingData.client_name}`
    const jobDescription = `Services: ${serviceTypesDisplay}\n${bookingData.description ? `Additional Details: ${bookingData.description}\n` : ''}Booking Token: ${bookingData.booking_token}`

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert([{
        user_id: user.id,
        client_id: clientId,
        title: jobTitle,
        description: jobDescription,
        scheduled_date: bookingData.requested_date,
        scheduled_time: bookingData.requested_time,
        status: 'enquiry'
      }])
      .select()
      .single()

    if (jobError) throw jobError

    return {
      job,
      clientId,
      message: 'Job created successfully from booking request'
    }
  } catch (error) {
    console.error('Error creating job from booking request:', error)
    throw error
  }
}

// Feedback operations
export const createFeedback = async (feedbackData: {
  job_id: string
  rating: number
  comment?: string
  feedback_token: string
}) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([feedbackData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getFeedback = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      job:jobs(
        title,
        scheduled_date,
        client:clients(name)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateFeedback = async (id: string, feedbackData: {
  rating: number
  comment?: string
  is_submitted: boolean
  submitted_at: string
}) => {
  const { data, error } = await supabase
    .from('feedback')
    .update(feedbackData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Utility functions
export const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const testDatabaseConnection = async () => {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Database connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    console.error('Database connection test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const getDashboardStats = async () => {
  const [
    { count: totalJobs },
    { count: completedJobs },
    { count: totalClients },
    { count: totalReports }
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true })
  ])

  return {
    totalJobs: totalJobs || 0,
    completedJobs: completedJobs || 0,
    totalClients: totalClients || 0,
    totalReports: totalReports || 0
  }
} 