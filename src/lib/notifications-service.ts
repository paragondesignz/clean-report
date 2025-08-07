import { supabase } from './supabase-client'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  relatedId?: string
  relatedType?: 'job' | 'client' | 'report' | 'booking'
  actionUrl?: string
}

// Mock notifications service for now - can be replaced with real database later
export class NotificationsService {
  private static instance: NotificationsService
  private notifications: Notification[] = []
  private listeners: Array<(notifications: Notification[]) => void> = []

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService()
    }
    return NotificationsService.instance
  }

  async initialize() {
    // Generate some sample notifications based on user data
    await this.generateSampleNotifications()
  }

  private async generateSampleNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get recent jobs to create relevant notifications
      const { data: recentJobs } = await supabase
        .from('jobs')
        .select(`
          id, title, status, scheduled_date,
          client:clients(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const notifications: Notification[] = []

      // Create notifications based on job statuses and dates
      recentJobs?.forEach((job, index) => {
        const clientName = job.client && typeof job.client === 'object' && 'name' in job.client 
          ? job.client.name 
          : 'Unknown Client'

        if (job.status === 'scheduled') {
          const scheduledDate = new Date(job.scheduled_date)
          const today = new Date()
          const diffTime = scheduledDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays <= 1 && diffDays >= 0) {
            notifications.push({
              id: `job-reminder-${job.id}`,
              title: 'Job Reminder',
              message: `"${job.title}" with ${clientName} is scheduled for ${diffDays === 0 ? 'today' : 'tomorrow'}`,
              type: 'warning',
              isRead: index > 2, // Mark some as read
              createdAt: new Date(Date.now() - (index * 3600000)).toISOString(), // Stagger times
              relatedId: job.id,
              relatedType: 'job',
              actionUrl: `/jobs/${job.id}`
            })
          }
        }

        if (job.status === 'completed') {
          notifications.push({
            id: `job-completed-${job.id}`,
            title: 'Job Completed',
            message: `Great work! "${job.title}" has been completed for ${clientName}`,
            type: 'success',
            isRead: index > 1,
            createdAt: new Date(Date.now() - (index * 7200000)).toISOString(),
            relatedId: job.id,
            relatedType: 'job',
            actionUrl: `/jobs/${job.id}`
          })
        }
      })

      // Add some general notifications
      notifications.push(
        {
          id: 'welcome-tip',
          title: 'Welcome Tip',
          message: 'Did you know you can use the search bar to quickly find clients, jobs, and reports?',
          type: 'info',
          isRead: false,
          createdAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        },
        {
          id: 'backup-reminder', 
          title: 'Backup Reminder',
          message: 'Your data is automatically backed up to ensure nothing is lost',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      )

      this.notifications = notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      this.notifyListeners()
    } catch (error) {
      console.error('Error generating sample notifications:', error)
    }
  }

  getNotifications(): Notification[] {
    return this.notifications
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true)
    this.notifyListeners()
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.notifications.unshift(newNotification)
    this.notifyListeners()
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }
}

export const notificationsService = NotificationsService.getInstance()