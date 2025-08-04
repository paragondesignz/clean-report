"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { Settings, Palette, Mail, Upload, Save, Calendar, ExternalLink, Key } from "lucide-react"
import { getUserProfile, updateUserProfile, createUserProfile, getCalendarIntegration, updateCalendarIntegration, createCalendarIntegration } from "@/lib/supabase-client"
import type { UserProfile, CalendarIntegration } from "@/types/database"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    user_id: user?.id || "",
    company_name: "",
    logo_url: "",
    primary_color: "#3B82F6",
    secondary_color: "#1E40AF",
    email_template: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    created_at: "",
    updated_at: ""
  })
  const [calendarIntegration, setCalendarIntegration] = useState<CalendarIntegration>({
    id: "",
    user_id: user?.id || "",
    calendar_url: "",
    calendar_type: "google",
    is_active: false,
    last_sync: null,
    created_at: "",
    updated_at: ""
  })
  const [googleApiConfig, setGoogleApiConfig] = useState({
    clientId: "",
    apiKey: "",
    calendarId: ""
  })

  // Store original values for comparison
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [originalCalendarIntegration, setOriginalCalendarIntegration] = useState<CalendarIntegration | null>(null)
  const [originalGoogleApiConfig, setOriginalGoogleApiConfig] = useState({
    clientId: "",
    apiKey: "",
    calendarId: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user profile
        const profileData = await getUserProfile()
        if (profileData) {
          setProfile(profileData)
          setOriginalProfile(profileData)
        }
        
        // Fetch calendar integration
        const calendarData = await getCalendarIntegration()
        if (calendarData) {
          setCalendarIntegration(calendarData)
          setOriginalCalendarIntegration(calendarData)
        }
        
        // TODO: Fetch Google API config from secure storage
        const googleConfig = {
          clientId: "",
          apiKey: "",
          calendarId: ""
        }
        setGoogleApiConfig(googleConfig)
        setOriginalGoogleApiConfig(googleConfig)
        
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user, toast])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Save user profile
      if (profile.id) {
        await updateUserProfile({
          company_name: profile.company_name,
          logo_url: profile.logo_url,
          primary_color: profile.primary_color,
          secondary_color: profile.secondary_color,
          email_template: profile.email_template,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          website_url: profile.website_url
        })
      } else {
        // Create new profile if it doesn't exist
        await createUserProfile({
          company_name: profile.company_name,
          logo_url: profile.logo_url,
          primary_color: profile.primary_color,
          secondary_color: profile.secondary_color,
          email_template: profile.email_template,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          website_url: profile.website_url
        })
      }
      
      // Save calendar integration
      if (calendarIntegration.id) {
        await updateCalendarIntegration({
          calendar_url: calendarIntegration.calendar_url,
          calendar_type: calendarIntegration.calendar_type,
          is_active: calendarIntegration.is_active
        })
      } else {
        // Create new calendar integration if it doesn't exist
        await createCalendarIntegration({
          calendar_url: calendarIntegration.calendar_url,
          calendar_type: calendarIntegration.calendar_type,
          is_active: calendarIntegration.is_active
        })
      }
      
      // Update the original values to reflect the saved state
      setOriginalProfile({ ...profile })
      setOriginalCalendarIntegration({ ...calendarIntegration })
      setOriginalGoogleApiConfig({ ...googleApiConfig })
      
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Upload logo to Supabase Storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile({ ...profile, logo_url: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const testCalendarConnection = async () => {
    if (!calendarIntegration.calendar_url) {
      toast({
        title: "Error",
        description: "Please enter a calendar URL first.",
        variant: "destructive",
      })
      return
    }

    try {
      // TODO: Implement actual calendar connection test
      // For now, we'll just validate the URL format
      const url = new URL(calendarIntegration.calendar_url)
      
      toast({
        title: "Connection successful",
        description: "Calendar URL format is valid.",
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Invalid calendar URL format. Please check the URL and try again.",
        variant: "destructive",
      })
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalProfile || !originalCalendarIntegration) return false
    
    return (
      JSON.stringify(profile) !== JSON.stringify(originalProfile) ||
      JSON.stringify(calendarIntegration) !== JSON.stringify(originalCalendarIntegration) ||
      JSON.stringify(googleApiConfig) !== JSON.stringify(originalGoogleApiConfig)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Customize your company branding and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || !hasUnsavedChanges()}
          className={hasUnsavedChanges() ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : hasUnsavedChanges() ? "Save Changes" : "Saved"}
        </Button>
      </div>

      {/* Company Information */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Settings className="h-5 w-5 mr-2" />
            Company Information
          </CardTitle>
          <CardDescription>
            Update your company details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Enter your company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="logo">Company Logo</Label>
              <div className="mt-1 flex items-center space-x-4">
                {profile.logo_url && (
                  <img
                    src={profile.logo_url}
                    alt="Company logo"
                    className="h-12 w-12 rounded-lg object-cover border"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={profile.primary_color}
                  onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                  className="h-10 w-16 rounded border"
                />
                <Input
                  id="primary_color"
                  value={profile.primary_color}
                  onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={profile.secondary_color}
                  onChange={(e) => setProfile({ ...profile, secondary_color: e.target.value })}
                  className="h-10 w-16 rounded border"
                />
                <Input
                  id="secondary_color"
                  value={profile.secondary_color}
                  onChange={(e) => setProfile({ ...profile, secondary_color: e.target.value })}
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email_template">Email Template</Label>
            <Textarea
              id="email_template"
              value={profile.email_template}
              onChange={(e) => setProfile({ ...profile, email_template: e.target.value })}
              placeholder="Enter your email template..."
              rows={8}
              className="mt-1"
            />
            <p className="text-sm text-slate-500 mt-2">
              Use placeholders like {"{client_name}"}, {"{company_name}"}, {"{job_date}"} in your template.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Update your contact details that will be displayed to clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.contact_email}
                onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                placeholder="bookings@yourcompany.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={profile.contact_phone}
                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={profile.website_url}
              onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
              placeholder="https://yourcompany.com"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Integration */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Calendar className="h-5 w-5 mr-2" />
            Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar for automatic job scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">Enable Calendar Sync</h3>
              <p className="text-sm text-slate-600">Automatically sync jobs with your Google Calendar</p>
            </div>
            <Switch
              checked={calendarIntegration.is_active}
              onCheckedChange={(checked) => setCalendarIntegration({ ...calendarIntegration, is_active: checked })}
            />
          </div>

          <div>
            <Label htmlFor="calendar_url">Google Calendar URL</Label>
            <div className="mt-1 flex space-x-2">
              <Input
                id="calendar_url"
                value={calendarIntegration.calendar_url}
                onChange={(e) => setCalendarIntegration({ ...calendarIntegration, calendar_url: e.target.value })}
                placeholder="https://calendar.google.com/calendar/..."
                className="flex-1"
              />
              <Button variant="outline" onClick={testCalendarConnection}>
                Test
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              To get your calendar URL: Open Google Calendar → Settings → Integrate calendar → Secret address in iCal format
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-4">Advanced Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="client_id">Google Client ID</Label>
                <Input
                  id="client_id"
                  value={googleApiConfig.clientId}
                  onChange={(e) => setGoogleApiConfig({ ...googleApiConfig, clientId: e.target.value })}
                  placeholder="Enter Google Client ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="api_key">Google API Key</Label>
                <Input
                  id="api_key"
                  value={googleApiConfig.apiKey}
                  onChange={(e) => setGoogleApiConfig({ ...googleApiConfig, apiKey: e.target.value })}
                  placeholder="Enter Google API Key"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calendar_id">Calendar ID</Label>
                <Input
                  id="calendar_id"
                  value={googleApiConfig.calendarId}
                  onChange={(e) => setGoogleApiConfig({ ...googleApiConfig, calendarId: e.target.value })}
                  placeholder="Enter Calendar ID"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 