"use client"

import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { Notification } from "@/components/ui/notification"

export interface NotificationItem {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "warning" | "error" | "info"
  autoClose?: boolean
  duration?: number
  timestamp: Date
}

interface NotificationState {
  notifications: NotificationItem[]
}

type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: NotificationItem }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_ALL" }

interface NotificationContextType {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      }
    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
      }
    default:
      return state
  }
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] })

  const addNotification = (notification: Omit<NotificationItem, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }

  const clearAll = () => {
    dispatch({ type: "CLEAR_ALL" })
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
          autoClose={notification.autoClose}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          className="animate-in slide-in-from-right-full duration-300"
        />
      ))}
    </div>
  )
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
} 