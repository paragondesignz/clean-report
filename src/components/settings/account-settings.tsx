"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Download,
  Trash2,
  Save,
  Upload,
  Palette,
  Globe,
  Phone,
  Building,
  AlertTriangle
} from "lucide-react"
import { getUserProfile, updateUserProfile, createUserProfile } from "@/lib/supabase-client"
import type { UserProfile } from "@/types/database"

export function AccountSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  
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

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    jobReminders: true,
    reportAlerts: true,
    marketingEmails: false,
    weeklyDigest: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await getUserProfile()
        if (profileData) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, toast])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      if (profile.id) {
        await updateUserProfile(profile)
      } else {
        await createUserProfile(profile)
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      // In a real app, this would call your auth API to change password
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
      setShowPasswordDialog(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setSaving(true)
      // In a real app, this would call your API to delete the account
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      })
      // Redirect to landing page
      window.location.href = '/'
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, this would upload to your storage service
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          logo_url: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const exportData = () => {
    // In a real app, this would generate and download a data export
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Update your personal and company information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.contact_email}
                onChange={(e) => setProfile(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="contact@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={profile.contact_phone}
                onChange={(e) => setProfile(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                value={profile.website_url}
                onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_template">Email Template</Label>
            <Textarea
              id="email_template"
              value={profile.email_template}
              onChange={(e) => setProfile(prev => ({ ...prev, email_template: e.target.value }))}
              placeholder="Custom email template for client communications..."
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Branding</span>
          </CardTitle>
          <CardDescription>
            Customize your company branding and colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center space-x-4">
              {profile.logo_url && (
                <img 
                  src={profile.logo_url} 
                  alt="Company logo" 
                  className="w-16 h-16 object-contain border rounded-lg"
                />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 200x200px, PNG or JPG
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={profile.primary_color}
                  onChange={(e) => setProfile(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={profile.primary_color}
                  onChange={(e) => setProfile(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={profile.secondary_color}
                  onChange={(e) => setProfile(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={profile.secondary_color}
                  onChange={(e) => setProfile(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Choose how and when you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Job Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded about upcoming jobs</p>
              </div>
              <Switch
                checked={notifications.jobReminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, jobReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Report Alerts</Label>
                <p className="text-sm text-muted-foreground">Notifications when reports are generated</p>
              </div>
              <Switch
                checked={notifications.reportAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reportAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
              </div>
              <Switch
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Weekly summary of your business activity</p>
              </div>
              <Switch
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyDigest: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Account Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm">
              Change Email
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <p className="text-sm text-muted-foreground">Last changed: 30 days ago</p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={saving}>
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your data or delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Export Data</Label>
              <p className="text-sm text-muted-foreground">Download all your data as a ZIP file</p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-red-600">Delete Account</Label>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Warning</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    <li>• All your data will be permanently deleted</li>
                    <li>• This action cannot be undone</li>
                    <li>• You will lose access to all features</li>
                    <li>• Any active subscriptions will be cancelled</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={saving}>
                    {saving ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 