import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client (with fallback for missing env vars)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Service role client for admin operations
export const createServiceClient = () => {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Client operations
export const getClients = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getClients:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching clients for user:', user.id)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase getClients error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    console.log('Clients fetched successfully:', data?.length || 0, 'clients')
    return data
  } catch (error) {
    console.error('getClients error:', error)
    throw error
  }
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
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getClient:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching client with ID:', clientId, 'for user:', user.id)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)  // Add user filtering for security
      .single()
    
    if (error) {
      console.error('Supabase getClient error:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    if (!data) {
      throw new Error(`Client not found with ID: ${clientId}`)
    }
    
    console.log('Client fetched successfully:', data)
    return data
  } catch (error) {
    console.error('getClient error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// Job operations
export const getJobs = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getJobs:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching jobs for user:', user.id)

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(name, email)
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
    
    if (error) {
      console.error('Supabase getJobs error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    console.log('Jobs fetched successfully:', data?.length || 0, 'jobs')
    return data
  } catch (error) {
    console.error('getJobs error:', error)
    throw error
  }
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
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    // First get the job with client info
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()
    
    if (jobError) {
      console.error('Supabase getJob error:', jobError)
      throw new Error(`Database error: ${jobError.message} (Code: ${jobError.code})`)
    }

    if (!jobData) {
      throw new Error('Job not found')
    }

    // Then get related data separately to avoid relationship issues
    const [tasksResult, notesResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('job_id', jobId),
      supabase.from('notes').select('*').eq('job_id', jobId)
    ])

    // Get photos for all tasks of this job
    let photosResult: { data: Array<{
      id: string
      task_id: string
      file_path: string
      file_name: string
      file_size: number
      created_at: string
    }> | null } = { data: [] }
    if (tasksResult.data && tasksResult.data.length > 0) {
      const taskIds = tasksResult.data.map(task => task.id)
      photosResult = await supabase
        .from('photos')
        .select('*')
        .in('task_id', taskIds)
    }

    // Combine the data
    const result = {
      ...jobData,
      tasks: tasksResult.data || [],
      notes: notesResult.data || [],
      photos: photosResult.data || []
    }
    
    console.log('Job data retrieved:', result)
    return result
  } catch (error) {
    console.error('getJob error:', error)
    throw error
  }
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
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase createTask error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('createTask error:', error)
    throw error
  }
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

// Note operations
export const getNotes = async (jobId: string) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createNote = async (noteData: {
  job_id: string
  content: string
}) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([noteData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateNote = async (id: string, noteData: Partial<{
  content: string
}>) => {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
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

export const getPhotosForJob = async (jobId: string) => {
  // First get all tasks for the job
  const tasks = await getTasks(jobId)
  
  // Then get photos for all tasks
  const photoPromises = tasks.map(task => getPhotos(task.id))
  const photosArrays = await Promise.all(photoPromises)
  
  // Flatten the arrays
  return photosArrays.flat()
}

export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

export const deletePhoto = async (photoId: string, filePath: string) => {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([filePath])
  
  if (storageError) throw storageError
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
  
  if (dbError) throw dbError
}

// Job-level photo function for mobile portal
export const addPhoto = async (jobId: string, file: File) => {
  try {
    // Get the first task for this job (or create a general task if none exist)
    const tasks = await getTasks(jobId)
    let taskId = tasks[0]?.id
    
    if (!taskId) {
      // Create a general task for photos if none exist
      const generalTask = await createTask(jobId, {
        title: 'General Photos',
        description: 'Photos added via mobile portal',
        order_index: 0
      })
      taskId = generalTask.id
    }
    
    // Upload the photo using existing uploadPhoto function
    return await uploadPhoto(file, taskId)
  } catch (error) {
    console.error('addPhoto error:', error)
    throw error
  }
}

// Note operations
export const addNote = async (jobId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        job_id: jobId,
        content: content.trim()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase addNote error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('addNote error:', error)
    throw error
  }
}

// Report operations
export const createReport = async (jobId: string, reportUrl: string) => {
  try {
    // Get current user for user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        job_id: jobId,
        report_url: reportUrl,
        user_id: user.id
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
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getReports:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching reports for user:', user.id)

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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase getReports error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Reports fetched successfully:', data?.length || 0, 'reports')
    return data
  } catch (error) {
    console.error('getReports error:', error)
    throw error
  }
}

// User profile operations
export const getUserProfile = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Getting profile for user:', user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)  // Add WHERE clause
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase getUserProfile error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    console.log('Retrieved profile:', data)
    return data
  } catch (error) {
    console.error('getUserProfile error:', error)
    throw error
  }
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
  subscription_tier?: 'free' | 'pro'
}) => {
  try {
    console.log('createUserProfile called with:', profileData)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Auth result:', { user: user?.id, error: userError })
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const insertData = {
      ...profileData,
      user_id: user.id,
      subscription_tier: profileData.subscription_tier || 'free'
    }
    console.log('Inserting data:', insertData)

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([insertData])
      .select()
      .single()
    
    console.log('Supabase response:', { data, error })
    
    if (error) {
      console.error('Supabase createUserProfile error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('createUserProfile error:', error)
    throw error
  }
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
  subscription_tier: 'free' | 'pro'
}>) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Updating profile for user:', user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)  // Add WHERE clause
      .select()
      .single()
    
    if (error) {
      console.error('Supabase updateUserProfile error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('updateUserProfile error:', error)
    throw error
  }
}

// Calendar integration operations
export const getCalendarIntegration = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase getCalendarIntegration error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('getCalendarIntegration error:', error)
    throw error
  }
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
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('calendar_integrations')
      .update(integrationData)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase updateCalendarIntegration error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    return data
  } catch (error) {
    console.error('updateCalendarIntegration error:', error)
    throw error
  }
}

// Recurring job operations
export const getRecurringJobs = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getRecurringJobs:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching recurring jobs for user:', user.id)

    const { data, error } = await supabase
      .from('recurring_jobs')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase getRecurringJobs error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Recurring jobs fetched successfully:', data?.length || 0, 'jobs')
    return data
  } catch (error) {
    console.error('getRecurringJobs error:', error)
    throw error
  }
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

// Service Types operations
export const getServiceTypes = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in getServiceTypes:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Fetching service types for user:', user.id)

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Supabase getServiceTypes error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Service types fetched successfully:', data?.length || 0, 'service types')
    return data
  } catch (error) {
    console.error('getServiceTypes error:', error)
    throw error
  }
}

export const createServiceType = async (serviceTypeData: {
  name: string
  description?: string
}) => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Authentication error in createServiceType:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Creating service type for user:', user.id)
    console.log('Service type data:', serviceTypeData)

    const { data, error } = await supabase
      .from('service_types')
      .insert([{
        ...serviceTypeData,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase createServiceType error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Service type created successfully:', data)
    return data
  } catch (error) {
    console.error('createServiceType error:', error)
    throw error
  }
}

export const updateServiceType = async (id: string, serviceTypeData: Partial<{
  name: string
  description: string
}>) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('service_types')
      .update(serviceTypeData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('updateServiceType error:', error)
    throw error
  }
}

export const deleteServiceType = async (id: string) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('service_types')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  } catch (error) {
    console.error('deleteServiceType error:', error)
    throw error
  }
}

export const testDatabaseConnection = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Missing Supabase environment variables' }
    }

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

export const testServiceTypesTable = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Missing Supabase environment variables' }
    }

    // Test if service_types table exists and is accessible
    const { data, error } = await supabase
      .from('service_types')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Service types table test failed:', error)
      return { success: false, error: error.message, code: error.code }
    }
    
    return { success: true, message: 'Service types table accessible', count: data }
  } catch (error) {
    console.error('Service types table test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const testRecurringJobsTable = async () => {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Missing Supabase environment variables' }
    }

    // Test if recurring_jobs table exists and is accessible
    const { data, error } = await supabase
      .from('recurring_jobs')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Recurring jobs table test failed:', error)
      return { success: false, error: error.message, code: error.code }
    }
    
    return { success: true, message: 'Recurring jobs table accessible', count: data }
  } catch (error) {
    console.error('Recurring jobs table test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const testUserProfilesTable = async () => {
  try {
    // Test if user_profiles table exists and is accessible
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('User profiles table test failed:', error)
      return { success: false, error: error.message, code: error.code }
    }
    
    return { success: true, message: 'User profiles table accessible', count: data }
  } catch (error) {
    console.error('User profiles table test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const checkTableExists = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      return { exists: false, error: error.message, code: error.code }
    }
    
    return { exists: true, message: `Table ${tableName} exists and is accessible` }
  } catch (error) {
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const checkRequiredTables = async () => {
  const requiredTables = [
    'user_profiles',
    'clients',
    'jobs',
    'tasks',
    'calendar_integrations',
    'service_types',
    'recurring_jobs',
    'supplies',
    'reports'
  ]
  
  const results = await Promise.all(
    requiredTables.map(async (table) => {
      const result = await checkTableExists(table)
      return { table, ...result }
    })
  )
  
  const missingTables = results.filter(r => !r.exists)
  const existingTables = results.filter(r => r.exists)
  
  return {
    allTablesExist: missingTables.length === 0,
    existingTables: existingTables.map(r => r.table),
    missingTables: missingTables.map(r => ({ table: r.table, error: r.error })),
    results
  }
}

export const getDashboardStats = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const [
      { count: totalJobs },
      { count: completedJobs },
      { count: totalClients },
      { count: totalReports }
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ])

    return {
      totalJobs: totalJobs || 0,
      completedJobs: completedJobs || 0,
      totalClients: totalClients || 0,
      totalReports: totalReports || 0
    }
  } catch (error) {
    console.error('getDashboardStats error:', error)
    throw error
  }
}


export const getSupplies = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('supplies')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('getSupplies error:', error)
    throw error
  }
}

 