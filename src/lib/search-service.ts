import { supabase } from './supabase-client'

export interface SearchResult {
  id: string
  type: 'client' | 'job' | 'report'
  title: string
  subtitle: string
  description?: string
  url: string
  date?: string
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
}

export const searchAll = async (query: string): Promise<SearchResponse> => {
  if (!query.trim()) {
    return { results: [], totalCount: 0 }
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const searchTerm = `%${query.toLowerCase()}%`
    const results: SearchResult[] = []

    // Search clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email, phone, address, created_at')
      .eq('user_id', user.id)
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},address.ilike.${searchTerm}`)
      .limit(10)

    if (!clientsError && clients) {
      clients.forEach(client => {
        results.push({
          id: client.id,
          type: 'client',
          title: client.name,
          subtitle: client.email,
          description: client.phone,
          url: `/clients/${client.id}`,
          date: client.created_at
        })
      })
    }

    // Search jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id, title, description, status, scheduled_date, created_at,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10)

    if (!jobsError && jobs) {
      jobs.forEach(job => {
        const clientName = job.client && typeof job.client === 'object' && 'name' in job.client 
          ? job.client.name 
          : 'Unknown Client'
        
        results.push({
          id: job.id,
          type: 'job',
          title: job.title,
          subtitle: `${clientName} • ${job.status}`,
          description: job.description?.substring(0, 100) + (job.description && job.description.length > 100 ? '...' : ''),
          url: `/jobs/${job.id}`,
          date: job.scheduled_date || job.created_at
        })
      })
    }

    // Search reports
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        id, created_at,
        job:jobs(
          title,
          client:clients(name)
        )
      `)
      .eq('user_id', user.id)
      .limit(10)

    if (!reportsError && reports) {
      reports.forEach(report => {
        const job = report.job && typeof report.job === 'object' && 'title' in report.job ? report.job : null
        const client = job && typeof job === 'object' && 'client' in job && job.client && typeof job.client === 'object' && 'name' in job.client 
          ? job.client 
          : null
        
        const jobTitle = job?.title || 'Unknown Job'
        const clientName = client?.name || 'Unknown Client'
        
        // Only include if the search matches job title or client name
        if (jobTitle.toLowerCase().includes(query.toLowerCase()) || 
            clientName.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: report.id,
            type: 'report',
            title: `Report for ${jobTitle}`,
            subtitle: clientName,
            url: `/reports/${report.id}`,
            date: report.created_at
          })
        }
      })
    }

    // Sort results by relevance (exact matches first, then by date)
    results.sort((a, b) => {
      const queryLower = query.toLowerCase()
      const aExact = a.title.toLowerCase().includes(queryLower) || a.subtitle.toLowerCase().includes(queryLower)
      const bExact = b.title.toLowerCase().includes(queryLower) || b.subtitle.toLowerCase().includes(queryLower)
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Sort by date if both are exact matches or both are not
      const aDate = new Date(a.date || 0)
      const bDate = new Date(b.date || 0)
      return bDate.getTime() - aDate.getTime()
    })

    return {
      results: results.slice(0, 20), // Limit to 20 total results
      totalCount: results.length
    }

  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

export const searchClients = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return []

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const searchTerm = `%${query.toLowerCase()}%`
    
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, created_at')
      .eq('user_id', user.id)
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .order('name', { ascending: true })
      .limit(10)

    if (error) throw error

    return clients?.map(client => ({
      id: client.id,
      type: 'client' as const,
      title: client.name,
      subtitle: client.email,
      description: client.phone,
      url: `/clients/${client.id}`,
      date: client.created_at
    })) || []

  } catch (error) {
    console.error('Client search error:', error)
    throw error
  }
}

export const searchJobs = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return []

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const searchTerm = `%${query.toLowerCase()}%`
    
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id, title, description, status, scheduled_date,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .order('scheduled_date', { ascending: false })
      .limit(10)

    if (error) throw error

    return jobs?.map(job => {
      const clientName = job.client && typeof job.client === 'object' && 'name' in job.client 
        ? job.client.name 
        : 'Unknown Client'
      
      return {
        id: job.id,
        type: 'job' as const,
        title: job.title,
        subtitle: `${clientName} • ${job.status}`,
        description: job.description?.substring(0, 100) + (job.description && job.description.length > 100 ? '...' : ''),
        url: `/jobs/${job.id}`,
        date: job.scheduled_date
      }
    }) || []

  } catch (error) {
    console.error('Job search error:', error)
    throw error
  }
}