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
import { StripeIntegration } from '@/lib/stripe-integration'
import { supabase } from '@/lib/supabase-client'

interface StripeConnection {
  id: string
  userId: string
  accountId: string
  accountName: string
  isLive: boolean
  webhookSecret?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function StripeIntegrationComponent() {
  const [connection, setConnection] = useState<StripeConnection | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadStripeConnection()
  }, [])

  const loadStripeConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if stripe_connections table exists, if not, skip loading
      const { data, error } = await supabase
        .from('stripe_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        // Only log actual errors, not expected missing table or no data errors
        if (error.code !== 'PGRST116' && !error.message.includes('relation "stripe_connections" does not exist')) {
          console.log('Stripe integration not available:', error.message)
        }
        return
      }

      if (data) {
        setConnection(data)
        loadAccountInfo(data)
      }
    } catch (error) {
      // Silently handle missing integration - don't log errors
      return
    }
  }

  const loadAccountInfo = async (stripeConnection: StripeConnection) => {
    try {
      // This would call your backend API to get account info
      // For now, we'll just set a placeholder
      setAccountInfo({
        accountId: stripeConnection.accountId,
        accountName: stripeConnection.accountName,
        isLive: stripeConnection.isLive,
      })
    } catch (error) {
      console.error('Error loading account info:', error)
    }
  }

  const connectStripe = async () => {
    setLoading(true)
    try {
      // This would redirect to Stripe Connect
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      })
      
      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to initiate Stripe connection')
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Stripe. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectStripe = async () => {
    setLoading(true)
    try {
      if (!connection) return

      const { error } = await supabase
        .from('stripe_connections')
        .update({ is_active: false })
        .eq('id', connection.id)

      if (error) {
        throw error
      }

      setConnection(null)
      setAccountInfo(null)
      
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Stripe.',
      })
    } catch (error) {
      console.error('Error disconnecting from Stripe:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Stripe. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateWebhookUrl = async () => {
    try {
      if (!connection) return

      const { error } = await supabase
        .from('stripe_connections')
        .update({ webhook_secret: webhookUrl })
        .eq('id', connection.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Webhook Updated',
        description: 'Webhook URL has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating webhook URL:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update webhook URL. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const testPayment = async () => {
    try {
      const response = await fetch('/api/stripe/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // $10.00
          currency: 'usd',
          description: 'Test payment from Clean Report',
        }),
      })

      if (response.ok) {
        const { clientSecret } = await response.json()
        toast({
          title: 'Test Payment Created',
          description: 'Test payment intent created successfully.',
        })
      } else {
        throw new Error('Failed to create test payment')
      }
    } catch (error) {
      console.error('Error creating test payment:', error)
      toast({
        title: 'Test Failed',
        description: 'Failed to create test payment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          Stripe Payments
        </CardTitle>
        <CardDescription>
          Accept credit card payments and manage invoices with Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!connection ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connect your Stripe account to start accepting payments from clients.
            </div>
            <Button onClick={connectStripe} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Stripe Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={accountInfo?.isLive ? 'default' : 'secondary'}>
                    {accountInfo?.isLive ? 'Live' : 'Test'}
                  </Badge>
                  <Badge variant="outline">Connected</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Account: {accountInfo?.accountName || connection.accountName}
                </div>
              </div>
              <Button variant="outline" onClick={disconnectStripe} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>

            <Separator />

            {/* Webhook Configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Configure webhook endpoint for real-time payment updates
                </div>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://yourdomain.com/api/stripe/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button onClick={updateWebhookUrl} variant="outline">
                    Update
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Payment */}
            <div className="space-y-4">
              <div>
                <Label>Test Payment</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Create a test payment to verify your integration
                </div>
                <Button onClick={testPayment} variant="outline">
                  Create Test Payment
                </Button>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <div className="font-medium">Features</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Credit Card Payments
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Digital Invoices
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Recurring Billing
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Payment Tracking
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 