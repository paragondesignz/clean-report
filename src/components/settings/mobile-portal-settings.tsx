"use client"

import { useState, useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle,
  Crown,
  QrCode,
  Download,
  Mail,
  Send,
  UserPlus,
  X
} from "lucide-react"
import { getUserProfile, updateUserProfile } from "@/lib/supabase-client"
import { useTierAccess } from "@/lib/tier-access"
import type { UserProfile } from "@/types/database"

export function MobilePortalSettings() {
  const { toast } = useToast()
  const { access } = useTierAccess()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [originalPassword, setOriginalPassword] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [showQrCode, setShowQrCode] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailForm, setEmailForm] = useState({
    emails: "",
    subject: "",
    message: ""
  })
  const [sendingEmail, setSendingEmail] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  // Regenerate QR code when password changes
  useEffect(() => {
    generateQrCode()
  }, [password])

  const generateQrCode = async () => {
    try {
      // Use local IP for development to enable mobile testing
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      let baseUrl = ''
      
      if (isDevelopment) {
        // Use local IP address for mobile access during development
        baseUrl = 'http://192.168.1.249:3001'
      } else {
        baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      }
      
      let portalUrl = `${baseUrl}/mobile-jobs`
      
      // Add password parameter if set
      if (password.trim()) {
        portalUrl += `?access=${encodeURIComponent(password.trim())}`
      }
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(portalUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#142a0a', // Dark green to match theme
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profileData = await getUserProfile()
      if (profileData) {
        setProfile(profileData)
        const currentPassword = profileData.mobile_portal_password || ""
        setPassword(currentPassword)
        setOriginalPassword(currentPassword)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load mobile portal settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setSaving(true)
      
      const updateData: Partial<UserProfile> = {
        mobile_portal_password: password.trim() || null
      }

      await updateUserProfile(updateData)
      setOriginalPassword(password)
      
      toast({
        title: "Settings saved",
        description: password.trim() 
          ? "Mobile portal password has been updated" 
          : "Mobile portal password has been removed"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update mobile portal settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
  }

  const getPortalUrl = () => {
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    let baseUrl = ''
    
    if (isDevelopment) {
      baseUrl = 'http://192.168.1.249:3001'
    } else {
      baseUrl = window.location.origin
    }
    
    return `${baseUrl}/mobile-jobs`
  }

  const copyPortalUrl = () => {
    const portalUrl = getPortalUrl()
    navigator.clipboard.writeText(portalUrl)
    toast({
      title: "Copied!",
      description: "Mobile portal URL copied to clipboard"
    })
  }

  const openPortal = () => {
    const portalUrl = getPortalUrl()
    window.open(portalUrl, '_blank')
  }

  const downloadQrCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = 'mobile-portal-qr-code.png'
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "QR Code downloaded!",
      description: "Share this QR code with your team for easy mobile access"
    })
  }

  const openEmailDialog = () => {
    let portalUrl = getPortalUrl()
    
    if (password.trim()) {
      portalUrl += `?access=${encodeURIComponent(password.trim())}`
    }

    const defaultSubject = "Mobile Job Portal Access - Clean Report"
    const defaultMessage = `Hi there!

You now have access to our mobile job portal where you can view and manage your assigned cleaning jobs directly from your phone.

🔗 **Portal Access:**
${portalUrl}

📱 **How to Access:**
• Click the link above on your mobile device
• Or scan the attached QR code with your phone camera
${password.trim() ? `• Access code: ${password.trim()}` : '• No password required'}

📋 **What you can do:**
• View your assigned jobs
• Mark tasks as complete
• Upload before/after photos
• Add notes and updates
• Track your progress

If you have any questions, feel free to reach out!

Best regards,
Your Clean Report Team`

    setEmailForm({
      emails: "",
      subject: defaultSubject,
      message: defaultMessage
    })
    setShowEmailDialog(true)
  }

  const sendEmailInvitations = async () => {
    if (!emailForm.emails.trim()) {
      toast({
        title: "Email required",
        description: "Please enter at least one email address",
        variant: "destructive"
      })
      return
    }

    try {
      setSendingEmail(true)
      
      // Parse email addresses
      const emailList = emailForm.emails
        .split(/[,;\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0)

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emailList.filter(email => !emailRegex.test(email))
      
      if (invalidEmails.length > 0) {
        toast({
          title: "Invalid email addresses",
          description: `Please check: ${invalidEmails.join(', ')}`,
          variant: "destructive"
        })
        return
      }

      // Send emails via API
      const response = await fetch('/api/send-mobile-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          subject: emailForm.subject,
          message: emailForm.message,
          qrCodeUrl: qrCodeUrl,
          portalUrl: typeof window !== 'undefined' ? window.location.origin + '/mobile-jobs' : '',
          hasPassword: password.trim().length > 0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      toast({
        title: "Invitations sent!",
        description: `Successfully sent to ${emailList.length} recipient${emailList.length > 1 ? 's' : ''}`
      })
      
      setShowEmailDialog(false)
      setEmailForm({ emails: "", subject: "", message: "" })

    } catch (error) {
      console.error('Error sending email invitations:', error)
      toast({
        title: "Failed to send invitations",
        description: "Please try again or contact support",
        variant: "destructive"
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const hasChanges = password !== originalPassword

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Portal Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-2 text-muted-foreground">Loading settings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!access.subContractors) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Portal Settings
            <Badge className="bg-amber-100 text-amber-800">
              <Crown className="w-3 h-3 mr-1" />
              Pro Feature
            </Badge>
          </CardTitle>
          <CardDescription>
            Mobile portal access for cleaners and sub-contractors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Pro Feature Required</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro to enable mobile portal access for your team members and sub-contractors.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portal Access Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Portal Access
          </CardTitle>
          <CardDescription>
            Provide mobile access to your cleaners and sub-contractors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={copyPortalUrl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Portal URL
            </Button>
            <Button
              onClick={openPortal}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Mobile Portal
            </Button>
            <Button
              onClick={openEmailDialog}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Mail className="w-4 h-4" />
              Email Invitations
            </Button>
          </div>

          {/* QR Code Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code Access
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan with any mobile device to access the portal instantly
                </p>
              </div>
              <Button
                onClick={() => setShowQrCode(!showQrCode)}
                variant="outline"
                size="sm"
              >
                {showQrCode ? "Hide QR" : "Show QR"}
              </Button>
            </div>

            {showQrCode && qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="Mobile Portal QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Mobile Portal Access</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Scan with your phone camera to access the mobile job portal
                  </p>
                  <Button
                    onClick={downloadQrCode}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">How it works</h4>
                <p className="text-sm text-muted-foreground">
                  Share the mobile portal URL with your team or send email invitations with QR codes. 
                  They can access assigned jobs, mark tasks complete, upload photos, and add notes - 
                  all from their mobile devices.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Protection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Protection
          </CardTitle>
          <CardDescription>
            Set a global access password for additional security (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portal-password">Access Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="portal-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter portal password (optional)"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty for no password protection. Generated passwords are 8 characters (letters and numbers).
            </p>
          </div>

          {password && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Password Protection Enabled</p>
                  <p className="text-xs text-primary/80">
                    Team members will need to enter this password to access the mobile portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!password && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No Password Protection</p>
                  <p className="text-xs text-amber-700">
                    Anyone with the portal URL can access your jobs. Consider setting a password for security.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={() => {
                  setPassword(originalPassword)
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Invitation Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Mobile Portal Invitations
            </DialogTitle>
            <DialogDescription>
              Send email invitations with portal access and QR code to your team members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitation-emails">Email Addresses</Label>
              <Textarea
                id="invitation-emails"
                placeholder="Enter email addresses separated by commas, semicolons, or new lines&#10;e.g. john@email.com, sarah@email.com"
                value={emailForm.emails}
                onChange={(e) => setEmailForm(prev => ({ ...prev, emails: e.target.value }))}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                You can enter multiple email addresses separated by commas, semicolons, or new lines
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invitation-subject">Subject</Label>
              <Input
                id="invitation-subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invitation-message">Message</Label>
              <Textarea
                id="invitation-message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={12}
                className="resize-none font-mono text-sm"
                placeholder="Email message content"
              />
              <p className="text-xs text-muted-foreground">
                The QR code will be automatically attached to each email
              </p>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Email Preview
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">To:</span> {emailForm.emails || 'Recipients...'}</p>
                <p><span className="font-medium">Subject:</span> {emailForm.subject || 'Subject...'}</p>
                <p><span className="font-medium">Attachments:</span> Mobile Portal QR Code (PNG)</p>
                {password.trim() && (
                  <p><span className="font-medium">Access Code:</span> Included in message</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={sendingEmail}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={sendEmailInvitations}
              disabled={sendingEmail || !emailForm.emails.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {sendingEmail ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitations
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}