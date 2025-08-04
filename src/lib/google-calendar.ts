// Google Calendar API integration utilities

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  calendarId: string
}

// Initialize Google Calendar API
export const initializeGoogleCalendar = (config: GoogleCalendarConfig) => {
  return new Promise<void>((resolve, reject) => {
    // Load Google API client
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: config.apiKey,
          clientId: config.clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.events'
        }).then(() => {
          resolve()
        }).catch(reject)
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Authenticate with Google Calendar
export const authenticateGoogleCalendar = async () => {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance()
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn()
    }
    return true
  } catch (error) {
    console.error('Google Calendar authentication failed:', error)
    return false
  }
}

// Get events from Google Calendar
export const getGoogleCalendarEvents = async (
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    return response.result.items || []
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error)
    throw error
  }
}

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (
  calendarId: string,
  event: Omit<GoogleCalendarEvent, 'id'>
): Promise<GoogleCalendarEvent> => {
  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId,
      resource: event
    })
    
    return response.result
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error)
    throw error
  }
}

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (
  calendarId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> => {
  try {
    const response = await window.gapi.client.calendar.events.update({
      calendarId,
      eventId,
      resource: event
    })
    
    return response.result
  } catch (error) {
    console.error('Failed to update Google Calendar event:', error)
    throw error
  }
}

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (
  calendarId: string,
  eventId: string
): Promise<void> => {
  try {
    await window.gapi.client.calendar.events.delete({
      calendarId,
      eventId
    })
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error)
    throw error
  }
}

// Parse Google Calendar URL to extract calendar ID
export const parseGoogleCalendarUrl = (url: string): string | null => {
  try {
    // Handle different Google Calendar URL formats
    const patterns = [
      /calendar\.google\.com\/calendar\/embed\?src=([^&]+)/,
      /calendar\.google\.com\/calendar\/u\/0\/r\?cid=([^&]+)/,
      /calendar\.google\.com\/calendar\/u\/0\/r\?src=([^&]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return decodeURIComponent(match[1])
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to parse Google Calendar URL:', error)
    return null
  }
}

// Convert cleaning job to Google Calendar event
export const jobToGoogleCalendarEvent = (
  job: { scheduled_date: string; scheduled_time: string; title: string; description: string },
  client: { name: string; address: string; email: string }
): Omit<GoogleCalendarEvent, 'id'> => {
  const startTime = new Date(`${job.scheduled_date}T${job.scheduled_time}`)
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
  
  return {
    summary: `${job.title} - ${client.name}`,
    description: job.description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: client.address,
    attendees: [
      {
        email: client.email,
        displayName: client.name
      }
    ]
  }
}

// Sync jobs with Google Calendar
export const syncJobsWithGoogleCalendar = async (
  jobs: Array<{ id: string; scheduled_date: string; scheduled_time: string; title: string; description: string; client_id: string }>,
  clients: Array<{ id: string; name: string; address: string; email: string }>,
  calendarId: string
): Promise<void> => {
  try {
    // Authenticate first
    const isAuthenticated = await authenticateGoogleCalendar()
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Google Calendar')
    }
    
    // Get existing events for the next 30 days
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const existingEvents = await getGoogleCalendarEvents(
      calendarId,
      now.toISOString(),
      thirtyDaysFromNow.toISOString()
    )
    
    // Create a map of existing events by job ID
    const existingEventMap = new Map<string, GoogleCalendarEvent>()
    existingEvents.forEach(event => {
      const jobId = event.description?.match(/Job ID: (\w+)/)?.[1]
      if (jobId) {
        existingEventMap.set(jobId, event)
      }
    })
    
    // Sync each job
    for (const job of jobs) {
      const client = clients.find(c => c.id === job.client_id)
      if (!client) continue
      
      const eventData = jobToGoogleCalendarEvent(job, client)
      
      if (existingEventMap.has(job.id)) {
        // Update existing event
        const existingEvent = existingEventMap.get(job.id)
        if (existingEvent) {
          await updateGoogleCalendarEvent(calendarId, existingEvent.id, eventData)
        }
      } else {
        // Create new event
        await createGoogleCalendarEvent(calendarId, eventData)
      }
    }
    
    // Remove events for jobs that no longer exist
    for (const [jobId, event] of existingEventMap.entries()) {
      if (!jobs.find(j => j.id === jobId)) {
        await deleteGoogleCalendarEvent(calendarId, event.id)
      }
    }
  } catch (error) {
    console.error('Failed to sync jobs with Google Calendar:', error)
    throw error
  }
}

// Declare global gapi for TypeScript
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (config: { apiKey: string; clientId: string; discoveryDocs: string[]; scope: string }) => Promise<void>
        calendar: {
          events: {
            list: (params: { calendarId: string; timeMin: string; timeMax: string; singleEvents: boolean; orderBy: string }) => Promise<{ result: { items: GoogleCalendarEvent[] } }>
            insert: (params: { calendarId: string; resource: Omit<GoogleCalendarEvent, 'id'> }) => Promise<{ result: GoogleCalendarEvent }>
            update: (params: { calendarId: string; eventId: string; resource: Partial<GoogleCalendarEvent> }) => Promise<{ result: GoogleCalendarEvent }>
            delete: (params: { calendarId: string; eventId: string }) => Promise<void>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean
          }
          signIn: () => Promise<void>
        }
      }
    }
  }
} 