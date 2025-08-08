"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  QrCode, 
  Mail, 
  Download, 
  Copy, 
  ExternalLink,
  X,
  Send,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react"
import QRCodeLib from "qrcode"
import type { Client } from "@/types/database"

interface CustomerPortalQRCodeProps {
  client: Client
}

export function CustomerPortalQRCode({ client }: CustomerPortalQRCodeProps) {
  const { toast } = useToast()
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({
    email: client.email || "",
    subject: `Your Customer Portal Access - ${client.name}`,
    message: "",
    password: "",
    showPassword: false
  })

  useEffect(() => {
    if (showQRDialog) {
      generateQRCode()
    }
  }, [showQRDialog, client.id])

  useEffect(() => {
    if (showEmailDialog && !emailForm.message) {
      setEmailForm(prev => ({
        ...prev,
        message: generateDefaultMessage()
      }))
    }
  }, [showEmailDialog, client.name])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      
      // Create customer portal URL with client ID
      const portalUrl = `${window.location.origin}/customer-portal/login?client=${client.id}`
      
      // Generate QR code
      const qrDataUrl = await QRCodeLib.toDataURL(portalUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
      
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = `${client.name.replace(/\s+/g, '_')}_portal_qr.png`
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "QR Code Downloaded",
      description: `Portal QR code for ${client.name} has been downloaded`
    })
  }

  const copyPortalUrl = () => {
    const portalUrl = `${window.location.origin}/customer-portal/login?client=${client.id}`
    navigator.clipboard.writeText(portalUrl)
    toast({
      title: "URL Copied",
      description: "Customer portal URL copied to clipboard"
    })
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setEmailForm(prev => ({ ...prev, password: result }))
  }

  const generateDefaultMessage = () => {
    return `Dear ${client.name},

We're excited to provide you with access to your personal customer portal! This secure dashboard gives you complete visibility into your cleaning services.

🔐 **Your Access Options:**
1. Scan the QR code below with your phone camera
2. Visit: ${window.location.origin}/customer-portal/login
3. Use your login credentials (will be provided separately)

✨ **What You Can Do:**
• View your complete job history
• Track service progress and costs
• Chat with our AI assistant 24/7
• Access help and FAQ resources
• Submit feedback and ratings

📱 **Easy Mobile Access:**
The QR code below provides instant access to your portal. Simply open your phone's camera app and point it at the code.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
Your Clean Report Team

📞 Phone: (555) 123-4567
📧 Email: support@cleaningservice.com
🕐 Hours: Monday-Friday 8AM-6PM, Saturday 9AM-4PM`
  }

  const openEmailDialog = () => {
    if (!emailForm.password) {
      generatePassword()
    }
    setShowEmailDialog(true)
  }

  const sendPortalInvitation = async () => {
    if (!emailForm.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    if (!emailForm.password.trim()) {
      toast({
        title: "Password Required", 
        description: "Please generate or enter a password",
        variant: "destructive"
      })
      return
    }

    try {
      setSendingEmail(true)

      const response = await fetch('/api/customer-portal/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          email: emailForm.email,
          temporaryPassword: emailForm.password,
          customMessage: emailForm.message,
          qrCodeUrl: qrCodeUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast({
        title: "Invitation Sent!",
        description: `Customer portal invitation sent to ${emailForm.email}`
      })

      setShowEmailDialog(false)
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Failed to Send",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <>
      {/* QR Code Quick Action Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowQRDialog(true)}
        className="flex items-center gap-2"
      >
        <QrCode className="h-4 w-4" />
        Portal QR
      </Button>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Customer Portal QR Code
            </DialogTitle>
            <DialogDescription>
              QR code for {client.name}'s portal access
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {loading ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : qrCodeUrl ? (
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <img
                  src={qrCodeUrl}
                  alt={`Portal QR Code for ${client.name}`}
                  className="w-[300px] h-[300px]"
                />
              </div>
            ) : null}

            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">{client.name}</p>
              <p>Scan to access customer portal</p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQRDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            <Button
              variant="outline" 
              onClick={copyPortalUrl}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>

            <Button
              variant="outline"
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <Button
              onClick={openEmailDialog}
              disabled={!qrCodeUrl}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Portal Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Portal Access to {client.name}
            </DialogTitle>
            <DialogDescription>
              Send customer portal login details with QR code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={emailForm.showPassword ? "text" : "password"}
                      value={emailForm.password}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setEmailForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    >
                      {emailForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={10}
                className="resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                QR code and login credentials will be automatically included
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={sendingEmail}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={sendPortalInvitation}
              disabled={sendingEmail || !emailForm.email || !emailForm.password}
            >
              {sendingEmail ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Portal Access
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}