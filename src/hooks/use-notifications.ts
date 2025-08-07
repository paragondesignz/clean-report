import { useNotification } from "@/components/notifications/notification-provider"

export const useNotifications = () => {
  const { addNotification, removeNotification, clearAll, notifications } = useNotification()

  const showSuccess = (title: string, description?: string) => {
    addNotification({
      title,
      description,
      variant: "success",
      autoClose: true,
      duration: 5000
    })
  }

  const showError = (title: string, description?: string) => {
    addNotification({
      title,
      description,
      variant: "error",
      autoClose: true,
      duration: 8000
    })
  }

  const showWarning = (title: string, description?: string) => {
    addNotification({
      title,
      description,
      variant: "warning",
      autoClose: true,
      duration: 6000
    })
  }

  const showInfo = (title: string, description?: string) => {
    addNotification({
      title,
      description,
      variant: "info",
      autoClose: true,
      duration: 5000
    })
  }

  const showJobCreated = (jobTitle: string) => {
    showSuccess(
      "Job Created",
      `"${jobTitle}" has been successfully created and scheduled.`
    )
  }

  const showJobUpdated = (jobTitle: string) => {
    showSuccess(
      "Job Updated",
      `"${jobTitle}" has been successfully updated.`
    )
  }

  const showClientAdded = (clientName: string) => {
    showSuccess(
      "Client Added",
      `${clientName} has been successfully added to your client list.`
    )
  }

  const showReportGenerated = (reportName: string) => {
    showSuccess(
      "Report Generated",
      `"${reportName}" has been successfully generated and is ready for download.`
    )
  }

  const showDatabaseError = (error: string) => {
    showError(
      "Database Error",
      `Unable to complete the operation: ${error}`
    )
  }

  const showNetworkError = () => {
    showError(
      "Network Error",
      "Unable to connect to the server. Please check your internet connection."
    )
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showJobCreated,
    showJobUpdated,
    showClientAdded,
    showReportGenerated,
    showDatabaseError,
    showNetworkError,
    removeNotification,
    clearAll,
    notifications
  }
} 