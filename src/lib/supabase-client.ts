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
export const getJobs = async (limit?: number, offset?: number) => {
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

    console.log('Fetching jobs for user:', user.id, 'limit:', limit, 'offset:', offset)

    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(name, email)
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })

    // Add pagination if provided
    if (limit !== undefined) {
      query = query.limit(limit)
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 20) - 1)
    }

    const { data, error } = await query
    
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

export const getJobsCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Supabase getJobsCount error:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    return count || 0
  } catch (error) {
    console.error('getJobsCount error:', error)
    throw error
  }
}

// Get jobs for a specific date range (useful for calendar views)
export const getJobsForDateRange = async (startDate: string, endDate: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(name, email),
        recurring_job:recurring_jobs(title, frequency)
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching jobs for date range:', error)
    throw error
  }
}

// Get jobs for a specific client, including recurring job instances
export const getJobsForClient = async (clientId: string, limit?: number, offset?: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(name, email),
        recurring_job:recurring_jobs(title, frequency)
      `)
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }
    
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching jobs for client:', error)
    throw error
  }
}

export const createJob = async (jobData: {
  client_id: string
  title: string
  description: string
  scheduled_date: string
  scheduled_time: string
  agreed_hours?: string
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

    // Add user_id to the job data and process agreed_hours
    const jobDataWithUser = {
      ...jobData,
      user_id: user.id,
      agreed_hours: jobData.agreed_hours ? parseFloat(jobData.agreed_hours) : null
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

export const deleteRecurringJob = async (
  jobId: string, 
  deleteType: 'single' | 'all' | 'future'
) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the job to check if it's recurring
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, recurring_job_id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError) {
      throw new Error(`Failed to fetch job: ${jobError.message}`)
    }

    if (!job) {
      throw new Error('Job not found')
    }

    switch (deleteType) {
      case 'single':
        // Delete only this specific job instance
        const { error: singleDeleteError } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId)
          .eq('user_id', user.id)
        
        if (singleDeleteError) {
          throw new Error(`Failed to delete job: ${singleDeleteError.message}`)
        }
        break

      case 'future':
        // Delete this job and all future instances with the same recurring_job_id
        if (!job.recurring_job_id) {
          // If no recurring_job_id, just delete this job
          const { error: futureDeleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId)
            .eq('user_id', user.id)
          
          if (futureDeleteError) {
            throw new Error(`Failed to delete job: ${futureDeleteError.message}`)
          }
        } else {
          // Delete this job and all future jobs in the series
          const { error: futureDeleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('recurring_job_id', job.recurring_job_id)
            .gte('scheduled_date', job.scheduled_date)
            .eq('user_id', user.id)
          
          if (futureDeleteError) {
            throw new Error(`Failed to delete future jobs: ${futureDeleteError.message}`)
          }
        }
        break

      case 'all':
        // Delete all instances of this recurring job series
        if (!job.recurring_job_id) {
          // If no recurring_job_id, just delete this job
          const { error: allDeleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId)
            .eq('user_id', user.id)
          
          if (allDeleteError) {
            throw new Error(`Failed to delete job: ${allDeleteError.message}`)
          }
        } else {
          // Delete all jobs in the recurring series
          const { error: allDeleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('recurring_job_id', job.recurring_job_id)
            .eq('user_id', user.id)
          
          if (allDeleteError) {
            throw new Error(`Failed to delete all recurring jobs: ${allDeleteError.message}`)
          }

          // Also delete the recurring job template
          const { error: recurringDeleteError } = await supabase
            .from('recurring_jobs')
            .delete()
            .eq('id', job.recurring_job_id)
            .eq('user_id', user.id)
          
          if (recurringDeleteError) {
            console.warn('Failed to delete recurring job template:', recurringDeleteError.message)
          }
        }
        break

      default:
        throw new Error('Invalid delete type')
    }
  } catch (error) {
    console.error('deleteRecurringJob error:', error)
    throw error
  }
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
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Add default category if it doesn't exist in the data
    return (data || []).map(note => ({
      ...note,
      category: note.category || 'general'
    }))
  } catch (error) {
    console.error('Error fetching notes:', error)
    throw error
  }
}

export const createNote = async (noteData: {
  job_id: string
  content: string
  category?: string
}) => {
  try {
    // First try with category, fallback without if column doesn't exist
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single()

    if (error) {
      // If category column doesn't exist, try without it
      if (error.code === 'PGRST204' && error.message.includes('category')) {
        console.warn('Notes table does not have category column, creating note without category')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('notes')
          .insert([{ job_id: noteData.job_id, content: noteData.content }])
          .select()
          .single()

        if (fallbackError) throw fallbackError
        return { ...fallbackData, category: 'general' } // Add default category for consistency
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

export const updateNote = async (id: string, noteData: Partial<{
  content: string
  category: string
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
      .eq('user_id', user.id)
      .single()
    
    // Handle missing table or other errors gracefully
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - this is fine, return null
        console.log('No profile found for user, returning null')
        return null
      } else if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        // Table doesn't exist - return default profile
        console.log('user_profiles table does not exist, returning default profile')
        return {
          user_id: user.id,
          subscription_tier: 'free',
          hourly_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } else {
        console.error('Supabase getUserProfile error:', error)
        // Return default profile instead of throwing
        console.log('Database error, returning default profile')
        return {
          user_id: user.id,
          subscription_tier: 'free',
          hourly_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
    
    console.log('Retrieved profile:', data)
    return data
  } catch (error) {
    console.error('getUserProfile error:', error)
    // Return default profile instead of throwing
    return {
      user_id: '',
      subscription_tier: 'free',
      hourly_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
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
    
    // Handle missing table or other errors gracefully
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      } else if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        // Table doesn't exist
        console.log('calendar_integrations table does not exist, returning null')
        return null
      } else {
        console.error('Supabase getCalendarIntegration error:', error)
        return null
      }
    }
    
    return data
  } catch (error) {
    console.error('getCalendarIntegration error:', error)
    return null
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
export const getRecurringJobs = async (limit?: number, offset?: number) => {
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

    console.log('Fetching recurring jobs for user:', user.id, 'limit:', limit, 'offset:', offset)

    let query = supabase
      .from('recurring_jobs')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Add pagination if provided
    if (limit !== undefined) {
      query = query.limit(limit)
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 20) - 1)
    }

    const { data, error } = await query
    
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

export const getRecurringJobsCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { count, error } = await supabase
      .from('recurring_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (error) {
      console.error('getRecurringJobsCount error:', error)
      throw error
    }
    
    return count || 0
  } catch (error) {
    console.error('getRecurringJobsCount error:', error)
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
  agreed_hours?: string
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
      user_id: user.id,
      agreed_hours: jobData.agreed_hours ? parseFloat(jobData.agreed_hours) : null
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
  agreed_hours?: number | null
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

export const getJobsForRecurringJob = async (recurringJobId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('recurring_job_id', recurringJobId)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting jobs for recurring job:', error)
    throw error
  }
}

// Generate job instances from a recurring job
export const generateJobInstances = async (recurringJobId: string, untilDate?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get the recurring job details
    const { data: recurringJob, error: fetchError } = await supabase
      .from('recurring_jobs')
      .select('*, client:clients(name)')
      .eq('id', recurringJobId)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) throw fetchError
    if (!recurringJob) throw new Error('Recurring job not found')
    
    // Calculate the dates for job instances based on frequency
    const instances = []
    const startDate = new Date(recurringJob.start_date)
    
    // For recurring jobs without end date, generate 1 year ahead
    // For those with end date, respect the end date
    const endDate = untilDate ? new Date(untilDate) : 
                    recurringJob.end_date ? new Date(recurringJob.end_date) :
                    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default to 1 year
    
    const currentDate = new Date(startDate)
    let instanceCount = 0
    const maxInstances = 365 // Safety limit to prevent infinite loops
    
    while (currentDate <= endDate && instanceCount < maxInstances) {
      // Check if instance already exists for this date
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('recurring_job_id', recurringJobId)
        .eq('recurring_instance_date', currentDate.toISOString().split('T')[0])
        .single()
      
      if (!existingJob) {
        instances.push({
          user_id: user.id,
          client_id: recurringJob.client_id,
          title: recurringJob.title,
          description: recurringJob.description,
          scheduled_date: currentDate.toISOString().split('T')[0],
          scheduled_time: recurringJob.scheduled_time,
          end_time: null, // Can be set individually
          recurring_job_id: recurringJobId,
          recurring_instance_date: currentDate.toISOString().split('T')[0],
          status: 'scheduled' as const,
          agreed_hours: recurringJob.agreed_hours || null
        })
      }
      
      // Increment date based on frequency
      switch (recurringJob.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'bi_weekly':
          currentDate.setDate(currentDate.getDate() + 14)
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
      }
      
      instanceCount++
    }
    
    // Insert all new instances in batches to avoid database limits
    if (instances.length > 0) {
      const batchSize = 100
      const insertedData = []
      
      for (let i = 0; i < instances.length; i += batchSize) {
        const batch = instances.slice(i, i + batchSize)
        const { data, error: insertError } = await supabase
          .from('jobs')
          .insert(batch)
          .select()
        
        if (insertError) throw insertError
        if (data) insertedData.push(...data)
      }
      
      // Update last_generated_date
      await supabase
        .from('recurring_jobs')
        .update({ last_generated_date: new Date().toISOString() })
        .eq('id', recurringJobId)
      
      return insertedData
    }
    
    return []
  } catch (error) {
    console.error('Error generating job instances:', error)
    throw error
  }
}

// Generate future instances dynamically as needed (called from calendar view)
export const ensureJobInstancesUpTo = async (recurringJobId: string, targetDate: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get the recurring job details
    const { data: recurringJob, error: fetchError } = await supabase
      .from('recurring_jobs')
      .select('*')
      .eq('id', recurringJobId)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) throw fetchError
    if (!recurringJob) throw new Error('Recurring job not found')

    // Check if we have instances up to the target date
    const { data: latestInstance } = await supabase
      .from('jobs')
      .select('scheduled_date')
      .eq('recurring_job_id', recurringJobId)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .single()

    const latestDate = latestInstance ? new Date(latestInstance.scheduled_date) : new Date(recurringJob.start_date)
    const target = new Date(targetDate)

    // If we need more instances, generate them
    if (latestDate < target) {
      return await generateJobInstances(recurringJobId, targetDate)
    }

    return []
  } catch (error) {
    console.error('Error ensuring job instances:', error)
    return []
  }
}

// Get recurring jobs for a specific client (just the template, not instances)
export const getRecurringJobsForClient = async (clientId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('recurring_jobs')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recurring jobs for client:', error)
    throw error
  }
}

// AI Task Suggestions Functions
export const saveTaskSuggestion = async (suggestion: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('task_suggestions')
      .insert([{
        user_id: user.id,
        client_id: suggestion.clientId,
        recurring_job_id: suggestion.recurringJobId,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        suggested_task: suggestion.suggestedTask,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        status: suggestion.status || 'pending'
      }])
      .select()

    if (error) {
      // If task_suggestions table doesn't exist or has issues, log and return mock data
      if (error.code === 'PGRST200' || error.code === '42P01' || error.message.includes('schema cache') || error.message.includes('task_suggestions') || error.message.includes('does not exist')) {
        console.warn('Task suggestions table not available, returning mock suggestion')
        return { ...suggestion, id: `mock_${Date.now()}`, created_at: new Date().toISOString() }
      }
      throw error
    }
    return data?.[0]
  } catch (error) {
    console.error('Error saving task suggestion:', error)
    // Return mock data to prevent component crash
    if (error instanceof Error && (error.message.includes('schema cache') || error.message.includes('task_suggestions') || error.message.includes('does not exist'))) {
      return { ...suggestion, id: `mock_${Date.now()}`, created_at: new Date().toISOString() }
    }
    throw error
  }
}

export const getTaskSuggestions = async (clientId?: string, status?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First try with relationships, fallback to basic query if relationships don't exist
    let query = supabase
      .from('task_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    // If the table doesn't exist or has schema issues, return empty array
    if (error) {
      if (error.code === 'PGRST200' || error.code === '42P01' || error.message.includes('schema cache') || error.message.includes('relationship') || error.message.includes('does not exist')) {
        console.warn('Task suggestions table not properly configured, returning empty results')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching task suggestions:', error)
    // Return empty array instead of throwing to prevent page crash
    if (error instanceof Error && (error.message.includes('schema cache') || error.message.includes('relationship') || error.message.includes('does not exist'))) {
      return []
    }
    throw error
  }
}

export const updateTaskSuggestionStatus = async (suggestionId: string, status: string, implementedTaskId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (implementedTaskId) {
      updateData.implemented_task_id = implementedTaskId
    }

    const { data, error } = await supabase
      .from('task_suggestions')
      .update(updateData)
      .eq('id', suggestionId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error updating task suggestion status:', error)
    throw error
  }
}

export const getClientTaskCompletionHistory = async (clientId: string, days: number = 90) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        scheduled_date,
        status,
        tasks(id, title, is_completed)
      `)
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })

    if (error) throw error

    // Process the data to get completion history
    const history = data?.map((job: any) => {
      const totalTasks = job.tasks?.length || 0
      const completedTasks = job.tasks?.filter((task: any) => task.is_completed).length || 0
      const skippedTasks = job.tasks?.filter((task: any) => !task.is_completed).map((task: any) => task.title) || []

      return {
        date: job.scheduled_date,
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        skipped_tasks: skippedTasks,
        job_status: job.status
      }
    }) || []

    return history
  } catch (error) {
    console.error('Error fetching client task completion history:', error)
    throw error
  }
}

export const generateAITaskSuggestions = async (clientId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // This would call the AI suggestion engine
    // For now, return a placeholder response
    console.log('AI suggestion generation would happen here for client:', clientId)
    return []
  } catch (error) {
    console.error('Error generating AI task suggestions:', error)
    throw error
  }
}

// Get job instances for a recurring job
export const getRecurringJobInstances = async (recurringJobId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('jobs')
      .select('*, client:clients(name)')
      .eq('recurring_job_id', recurringJobId)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching recurring job instances:', error)
    throw error
  }
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

// Recurring Task Propagation Functions
export const addTaskToFutureInstances = async (
  recurringJobId: string, 
  taskTitle: string, 
  taskDescription: string,
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'bi_annual' | 'annual' | 'custom',
  customWeeks?: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get all future job instances for this recurring job
    const today = new Date().toISOString().split('T')[0]
    const { data: futureJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, scheduled_date')
      .eq('recurring_job_id', recurringJobId)
      .eq('user_id', user.id)
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })

    if (jobsError) throw jobsError
    if (!futureJobs || futureJobs.length === 0) return { tasksAdded: 0 }

    // Calculate which instances should get this task based on frequency
    let jobsToAddTaskTo: string[] = []
    
    if (frequency === 'weekly' || frequency === 'bi_weekly' || frequency === 'monthly') {
      // Add to all future instances (they already follow the base frequency)
      jobsToAddTaskTo = futureJobs.map(job => job.id)
    } else {
      // For quarterly, bi-annual, annual, or custom - calculate specific instances
      const frequencyInWeeks = getFrequencyInWeeks(frequency, customWeeks)
      const startDate = new Date(futureJobs[0].scheduled_date)
      
      futureJobs.forEach((job, index) => {
        const jobDate = new Date(job.scheduled_date)
        const weeksSinceStart = Math.floor((jobDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        
        // Add task if this job falls on the specified frequency
        if (weeksSinceStart % frequencyInWeeks === 0) {
          jobsToAddTaskTo.push(job.id)
        }
      })
    }

    // Create tasks for the selected job instances
    const tasksToCreate = jobsToAddTaskTo.map(jobId => ({
      user_id: user.id,
      job_id: jobId,
      title: taskTitle,
      description: taskDescription,
      is_completed: false,
      created_from_recurring_pattern: true,
      recurring_frequency: frequency
    }))

    if (tasksToCreate.length > 0) {
      const { data, error: createError } = await supabase
        .from('tasks')
        .insert(tasksToCreate)
        .select()

      if (createError) throw createError
      return { tasksAdded: data?.length || 0, taskIds: data?.map(task => task.id) }
    }

    return { tasksAdded: 0 }
  } catch (error) {
    console.error('Error adding task to future instances:', error)
    throw error
  }
}

// Helper function to convert frequency to weeks
const getFrequencyInWeeks = (frequency: string, customWeeks?: number): number => {
  switch (frequency) {
    case 'weekly': return 1
    case 'bi_weekly': return 2
    case 'monthly': return 4
    case 'quarterly': return 12
    case 'bi_annual': return 26
    case 'annual': return 52
    case 'custom': return customWeeks || 4
    default: return 4
  }
}

// Recurring Job Note Management Functions
export const addRecurringJobNote = async (
  recurringJobId: string,
  content: string,
  category: 'general' | 'maintenance' | 'client_preference' | 'access_instructions' | 'special_requirements' = 'general'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('recurring_job_notes')
      .insert([{
        user_id: user.id,
        recurring_job_id: recurringJobId,
        content,
        category,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding recurring job note:', error)
    throw error
  }
}

export const getRecurringJobNotes = async (recurringJobId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('recurring_job_notes')
      .select('*')
      .eq('recurring_job_id', recurringJobId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting recurring job notes:', error)
    throw error
  }
}

export const updateRecurringJobNote = async (noteId: string, content: string, category?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = { 
      content,
      updated_at: new Date().toISOString()
    }
    if (category) updateData.category = category

    const { data, error } = await supabase
      .from('recurring_job_notes')
      .update(updateData)
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating recurring job note:', error)
    throw error
  }
}

export const deleteRecurringJobNote = async (noteId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('recurring_job_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting recurring job note:', error)
    throw error
  }
}

// Job Worker Assignment operations
export const getJobWorkerAssignments = async (jobId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('job_worker_assignments')
      .select(`
        *,
        sub_contractors(
          id,
          first_name,
          last_name,
          email,
          hourly_rate
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting job worker assignments:', error)
    throw error
  }
}

export const assignWorkerToJob = async (assignmentData: {
  job_id: string
  worker_id: string
  worker_type: 'owner' | 'sub_contractor'
  hourly_rate: number
  assigned_hours?: number
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('job_worker_assignments')
      .insert([{
        ...assignmentData,
        is_clocked_in: false,
        actual_hours: 0,
        total_cost: 0
      }])
      .select()
      .single()

    if (error) throw error
    
    // Update job estimated cost
    await updateJobEstimatedCost(assignmentData.job_id)
    
    return data
  } catch (error) {
    console.error('Error assigning worker to job:', error)
    throw error
  }
}

export const removeWorkerFromJob = async (assignmentId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get the assignment to get job_id for cost update
    const { data: assignment } = await supabase
      .from('job_worker_assignments')
      .select('job_id')
      .eq('id', assignmentId)
      .single()

    const { error } = await supabase
      .from('job_worker_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) throw error

    // Update job costs
    if (assignment) {
      await updateJobCosts(assignment.job_id)
    }
    
    return true
  } catch (error) {
    console.error('Error removing worker from job:', error)
    throw error
  }
}

export const clockInWorker = async (assignmentId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('job_worker_assignments')
      .update({
        clock_in_time: new Date().toISOString(),
        is_clocked_in: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error clocking in worker:', error)
    throw error
  }
}

export const clockOutWorker = async (assignmentId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First get the current assignment data
    const { data: assignment, error: getError } = await supabase
      .from('job_worker_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (getError || !assignment) throw getError || new Error('Assignment not found')
    if (!assignment.clock_in_time) throw new Error('Worker is not clocked in')

    const clockOutTime = new Date().toISOString()
    const clockInTime = new Date(assignment.clock_in_time)
    const hoursWorked = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
    const totalCost = hoursWorked * assignment.hourly_rate
    const newActualHours = (assignment.actual_hours || 0) + hoursWorked

    const { data, error } = await supabase
      .from('job_worker_assignments')
      .update({
        clock_out_time: clockOutTime,
        is_clocked_in: false,
        actual_hours: newActualHours,
        total_cost: newActualHours * assignment.hourly_rate,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error

    // Update job actual cost
    await updateJobCosts(assignment.job_id)
    
    return data
  } catch (error) {
    console.error('Error clocking out worker:', error)
    throw error
  }
}

export const updateJobEstimatedCost = async (jobId: string) => {
  try {
    const { data: assignments, error } = await supabase
      .from('job_worker_assignments')
      .select('hourly_rate, assigned_hours')
      .eq('job_id', jobId)

    if (error) throw error

    const estimatedCost = assignments?.reduce((total, assignment) => {
      return total + (assignment.hourly_rate * (assignment.assigned_hours || 0))
    }, 0) || 0

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ estimated_cost: estimatedCost })
      .eq('id', jobId)

    if (updateError) throw updateError
    return estimatedCost
  } catch (error) {
    console.error('Error updating job estimated cost:', error)
    throw error
  }
}

export const updateJobCosts = async (jobId: string) => {
  try {
    const { data: assignments, error } = await supabase
      .from('job_worker_assignments')
      .select('hourly_rate, assigned_hours, actual_hours, total_cost')
      .eq('job_id', jobId)

    if (error) throw error

    const estimatedCost = assignments?.reduce((total, assignment) => {
      return total + (assignment.hourly_rate * (assignment.assigned_hours || 0))
    }, 0) || 0

    const actualCost = assignments?.reduce((total, assignment) => {
      return total + (assignment.total_cost || 0)
    }, 0) || 0

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        estimated_cost: estimatedCost,
        actual_cost: actualCost
      })
      .eq('id', jobId)

    if (updateError) throw updateError
    return { estimatedCost, actualCost }
  } catch (error) {
    console.error('Error updating job costs:', error)
    throw error
  }
}

// User Profile operations for hourly rate
export const updateUserHourlyRate = async (hourlyRate: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ hourly_rate: hourlyRate })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user hourly rate:', error)
    throw error
  }
}

export const getUserHourlyRate = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('hourly_rate')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data?.hourly_rate || 0
  } catch (error) {
    console.error('Error getting user hourly rate:', error)
    throw error
  }
}

 