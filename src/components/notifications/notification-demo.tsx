"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotifications } from "@/hooks/use-notifications"
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Bell,
  Plus,
  Users,
  FileText
} from "lucide-react"

export const NotificationDemo: React.FC = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showJobCreated,
    showClientAdded,
    showReportGenerated,
    showDatabaseError,
    showNetworkError
  } = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notification System Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => showSuccess("Success!", "This is a success notification")}
            className="justify-start"
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Success
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showError("Error!", "This is an error notification")}
            className="justify-start"
          >
            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            Error
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showWarning("Warning!", "This is a warning notification")}
            className="justify-start"
          >
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
            Warning
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showInfo("Info!", "This is an info notification")}
            className="justify-start"
          >
            <Info className="h-4 w-4 mr-2 text-blue-600" />
            Info
          </Button>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Business Notifications</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => showJobCreated("Kitchen Deep Clean")}
              className="justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Job Created
            </Button>
            
            <Button
              variant="outline"
              onClick={() => showClientAdded("John Smith")}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Client Added
            </Button>
            
            <Button
              variant="outline"
              onClick={() => showReportGenerated("Monthly Report - March 2024")}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Report Generated
            </Button>
            
            <Button
              variant="outline"
              onClick={() => showDatabaseError("Connection timeout")}
              className="justify-start"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Database Error
            </Button>
            
            <Button
              variant="outline"
              onClick={() => showNetworkError()}
              className="justify-start"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Network Error
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 