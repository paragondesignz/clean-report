"use client"

import { useState, useEffect } from 'react'
import { notificationsService, Notification } from '@/lib/notifications-service'

export function useBellNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationsService.initialize()
        setNotifications(notificationsService.getNotifications())
        setUnreadCount(notificationsService.getUnreadCount())
      } catch (error) {
        console.error('Failed to initialize notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeNotifications()

    // Subscribe to notifications updates
    const unsubscribe = notificationsService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
      setUnreadCount(notificationsService.getUnreadCount())
    })

    return unsubscribe
  }, [])

  const markAsRead = (notificationId: string) => {
    notificationsService.markAsRead(notificationId)
  }

  const markAllAsRead = () => {
    notificationsService.markAllAsRead()
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    notificationsService.addNotification(notification)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification
  }
}