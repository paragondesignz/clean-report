"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info
} from "lucide-react"
import { getCalendarIntegration } from "@/lib/supabase-client"
import type { CalendarIntegration } from "@/types/database"

export function GoogleCalendarIntegration() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [icalUrl, setIcalUrl] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [integration, setIntegration] = useState<CalendarIntegration | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegration()
  }, [])

  const loadIntegration = async () => {
    try {
      const data = await getCalendarIntegration()
      if (data) {
        setIntegration(data)
        // Generate feed URL for this user
        const feedUrl = `${window.location.origin}/api/calendar/feed/${user?.id}`
        setIcalUrl(feedUrl)
      }
    } catch (error) {
      console.log("No existing calendar integration:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!icalUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your Google Calendar iCal URL first.",
        variant: "destructive"
      })
      return
    }

    setTesting(true)
    try {
      const result = await testICalConnection(icalUrl.trim())
      
      if (result.success) {
        toast({
          title: "Connection Successful!",
          description: result.message || "Calendar connection test passed.",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to calendar.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the calendar connection.",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save calendar settings.",
        variant: "destructive"
      })
      return
    }

    setSyncing(true)
    try {
      // Push jobs to calendar feed
      const response = await fetch('/api/calendar/push-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Calendar Feed Generated!",
          description: `Calendar feed created with ${result.eventCount || 0} jobs. Use the instructions below to add it to Google Calendar.`
        })
        
        // Generate and store the feed URL for display
        const feedUrl = `${window.location.origin}/api/calendar/feed/${user.id}`
        setIcalUrl(feedUrl)
        
        // Reload integration data
        await loadIntegration()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to generate calendar feed.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "An error occurred while generating calendar feed.",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleSync = async () => {
    if (!user) return

    setSyncing(true)
    try {
      // Refresh the calendar feed with latest jobs
      const response = await fetch('/api/calendar/push-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Feed Updated",
          description: `Calendar feed updated with ${result.eventCount || 0} jobs.`
        })
        
        // Reload integration data
        await loadIntegration()
      } else {
        toast({
          title: "Sync Failed", 
          description: result.error || "Failed to update calendar feed.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "An error occurred during calendar sync.",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Google Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Google Calendar</span>
          {integration?.is_active && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          Export your Clean Report jobs to Google Calendar as an iCal feed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {integration && (
          <div className={`p-3 rounded-lg border ${
            integration.is_active 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {integration.is_active ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                integration.is_active ? 'text-green-800' : 'text-red-800'
              }`}>
                {integration.is_active ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {integration.last_sync && (
              <p className="text-xs text-gray-600 mt-1">
                Last synced: {new Date(integration.last_sync).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">
                How to add your Clean Report jobs to Google Calendar:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click "Generate Calendar Feed" below to create your job feed</li>
                <li>Copy the feed URL that appears</li>
                <li>Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Calendar</a></li>
                <li>Click the + next to "Other calendars"</li>
                <li>Select "From URL"</li>
                <li>Paste the feed URL and click "Add calendar"</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                Your scheduled jobs will appear as calendar events with 🧹 icons.
              </p>
            </div>
          </div>
        </div>

        {/* Feed URL Display */}
        {icalUrl && (
          <div className="space-y-2">
            <Label htmlFor="feed-url">Your Calendar Feed URL</Label>
            <div className="relative">
              <Input
                id="feed-url"
                type="url"
                value={icalUrl}
                readOnly
                className="font-mono text-sm bg-gray-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-1 top-1 h-8"
                onClick={() => {
                  navigator.clipboard.writeText(icalUrl)
                  toast({
                    title: "Copied!",
                    description: "Feed URL copied to clipboard"
                  })
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use this URL to subscribe to your jobs in Google Calendar
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Feed...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Calendar Feed
              </>
            )}
          </Button>

          {icalUrl && (
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Feed
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>
            This creates a calendar feed that shows your scheduled Clean Report jobs in Google Calendar.
            The feed updates automatically when you add or modify jobs. Events are read-only in Google Calendar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}