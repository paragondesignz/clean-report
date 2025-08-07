'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { TwilioIntegration } from '@/lib/twilio-integration'
import { supabase } from '@/lib/supabase-client'

interface TwilioConnection {
  id: string
  userId: string
  accountSid: string
  authToken: string
  phoneNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function TwilioIntegrationComponent() {
  const [connection, setConnection] = useState<TwilioConnection | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [accountSid, setAccountSid] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showCredentials, setShowCredentials] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTwilioConnection()
  }, [])

  const loadTwilioConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if twilio_connections table exists, if not, skip loading
      const { data, error } = await supabase
        .from('twilio_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        // Only log actual errors, not expected missing table or no data errors
        if (error.code !== 'PGRST116' && !error.message.includes('relation "twilio_connections" does not exist')) {
          console.log('Twilio integration not available:', error.message)
        }
        return
      }

      if (data) {
        setConnection(data)
        setAccountSid(data.accountSid)
        setAuthToken(data.authToken)
        setPhoneNumber(data.phoneNumber)
        loadAccountInfo(data)
      }
    } catch (error) {
      // Silently handle missing integration - don't log errors
      return
    }
  }

  const loadAccountInfo = async (twilioConnection: TwilioConnection) => {
    try {
      // This would call your backend API to get account info
      // For now, we'll just set a placeholder
      setAccountInfo({
        accountSid: twilioConnection.accountSid,
        phoneNumber: twilioConnection.phoneNumber,
        balance: '$50.00', // This would be fetched from Twilio API
      })
    } catch (error) {
      console.error('Error loading account info:', error)
    }
  }

  const connectTwilio = async () => {
    setLoading(true)
    try {
      if (!accountSid || !authToken || !phoneNumber) {
        throw new Error('Please fill in all required fields')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Test the credentials by making a simple API call
      const response = await fetch('/api/twilio/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid,
          authToken,
          phoneNumber,
        }),
      })

      if (!response.ok) {
        throw new Error('Invalid Twilio credentials')
      }

      // Save the connection
      const { data, error } = await supabase
        .from('twilio_connections')
        .upsert({
          user_id: user.id,
          account_sid: accountSid,
          auth_token: authToken,
          phone_number: phoneNumber,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setConnection(data)
      loadAccountInfo(data)
      
      toast({
        title: 'Connected Successfully',
        description: 'Your Twilio account has been connected.',
      })
    } catch (error) {
      console.error('Error connecting to Twilio:', error)
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to Twilio. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectTwilio = async () => {
    setLoading(true)
    try {
      if (!connection) return

      const { error } = await supabase
        .from('twilio_connections')
        .update({ is_active: false })
        .eq('id', connection.id)

      if (error) {
        throw error
      }

      setConnection(null)
      setAccountInfo(null)
      setAccountSid('')
      setAuthToken('')
      setPhoneNumber('')
      
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Twilio.',
      })
    } catch (error) {
      console.error('Error disconnecting from Twilio:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Twilio. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const testSms = async () => {
    try {
      if (!connection) return

      const response = await fetch('/api/twilio/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '+1234567890', // This would be a test number
          body: 'Test SMS from Clean Report - Your Twilio integration is working!',
        }),
      })

      if (response.ok) {
        toast({
          title: 'Test SMS Sent',
          description: 'Test SMS has been sent successfully.',
        })
      } else {
        throw new Error('Failed to send test SMS')
      }
    } catch (error) {
      console.error('Error sending test SMS:', error)
      toast({
        title: 'Test Failed',
        description: 'Failed to send test SMS. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const updateCredentials = async () => {
    try {
      if (!connection) return

      const { error } = await supabase
        .from('twilio_connections')
        .update({
          account_sid: accountSid,
          auth_token: authToken,
          phone_number: phoneNumber,
        })
        .eq('id', connection.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Credentials Updated',
        description: 'Twilio credentials have been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating credentials:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update credentials. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          Twilio SMS
        </CardTitle>
        <CardDescription>
          Send SMS notifications for job reminders and status updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!connection ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connect your Twilio account to send SMS notifications to clients.
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="account-sid">Account SID</Label>
                <Input
                  id="account-sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="auth-token">Auth Token</Label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="your_auth_token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone-number">Twilio Phone Number</Label>
                <Input
                  id="phone-number"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={connectTwilio} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Twilio Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Connected</Badge>
                  {accountInfo?.balance && (
                    <Badge variant="secondary">
                      Balance: {accountInfo.balance}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Phone: {accountInfo?.phoneNumber || connection.phoneNumber}
                </div>
              </div>
              <Button variant="outline" onClick={disconnectTwilio} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>

            <Separator />

            {/* Credentials Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Account Credentials</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>
              
              {showCredentials && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="edit-account-sid">Account SID</Label>
                    <Input
                      id="edit-account-sid"
                      value={accountSid}
                      onChange={(e) => setAccountSid(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-auth-token">Auth Token</Label>
                    <Input
                      id="edit-auth-token"
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-phone-number">Phone Number</Label>
                    <Input
                      id="edit-phone-number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={updateCredentials} variant="outline">
                    Update Credentials
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Test SMS */}
            <div className="space-y-4">
              <div>
                <Label>Test SMS</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Send a test SMS to verify your integration
                </div>
                <Button onClick={testSms} variant="outline">
                  Send Test SMS
                </Button>
              </div>
            </div>

            <Separator />

            {/* SMS Templates */}
            <div className="space-y-4">
              <div>
                <Label>SMS Templates</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  Pre-configured SMS templates for different scenarios
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Job Reminder</div>
                    <div className="text-xs text-muted-foreground">
                      "Hi {clientName}, this is a reminder that your cleaning service "{jobTitle}" is scheduled for {scheduledDate} at {scheduledTime}. We'll see you soon!"
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Job Completed</div>
                    <div className="text-xs text-muted-foreground">
                      "Hi {clientName}, your cleaning service "{jobTitle}" has been completed. Thank you for choosing our services!"
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Payment Reminder</div>
                    <div className="text-xs text-muted-foreground">
                      "Hi {clientName}, this is a friendly reminder that payment of ${amount} for your cleaning service "{jobTitle}" is due on {dueDate}."
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <div className="font-medium">Features</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Job Reminders
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Status Updates
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Payment Reminders
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Bulk SMS
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 