'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { QuickBooksIntegration } from '@/lib/quickbooks-integration'
import { supabase } from '@/lib/supabase-client'

interface QuickBooksConnection {
  id: string
  userId: string
  realmId: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function QuickBooksIntegrationComponent() {
  const [connection, setConnection] = useState<QuickBooksConnection | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadQuickBooksConnection()
  }, [])

  const loadQuickBooksConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('quickbooks_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading QuickBooks connection:', error)
        return
      }

      if (data) {
        setConnection(data)
        loadAccountInfo(data)
      }
    } catch (error) {
      console.error('Error loading QuickBooks connection:', error)
    }
  }

  const loadAccountInfo = async (quickBooksConnection: QuickBooksConnection) => {
    try {
      // This would call your backend API to get account info
      // For now, we'll just set a placeholder
      setAccountInfo({
        realmId: quickBooksConnection.realmId,
        companyName: 'Your Company', // This would be fetched from QuickBooks API
        lastSync: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error loading account info:', error)
    }
  }

  const connectQuickBooks = async () => {
    setLoading(true)
    try {
      // Get the authorization URL from QuickBooks
      const response = await fetch('/api/quickbooks/auth-url', {
        method: 'GET',
      })
      
      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to get QuickBooks authorization URL')
      }
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to QuickBooks. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectQuickBooks = async () => {
    setLoading(true)
    try {
      if (!connection) return

      const { error } = await supabase
        .from('quickbooks_connections')
        .update({ is_active: false })
        .eq('id', connection.id)

      if (error) {
        throw error
      }

      setConnection(null)
      setAccountInfo(null)
      
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from QuickBooks.',
      })
    } catch (error) {
      console.error('Error disconnecting from QuickBooks:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from QuickBooks. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const syncInvoices = async () => {
    try {
      if (!connection) return

      const response = await fetch('/api/quickbooks/sync-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Sync Completed',
          description: result.message,
        })
      } else {
        throw new Error('Failed to sync invoices')
      }
    } catch (error) {
      console.error('Error syncing invoices:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync invoices. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const syncCustomers = async () => {
    try {
      if (!connection) return

      const response = await fetch('/api/quickbooks/sync-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Sync Completed',
          description: result.message,
        })
      } else {
        throw new Error('Failed to sync customers')
      }
    } catch (error) {
      console.error('Error syncing customers:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync customers. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const createTestInvoice = async () => {
    try {
      if (!connection) return

      const response = await fetch('/api/quickbooks/test-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: 'Test Customer',
          amount: 150.00,
          description: 'Test cleaning service',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Test Invoice Created',
          description: 'Test invoice has been created in QuickBooks.',
        })
      } else {
        throw new Error('Failed to create test invoice')
      }
    } catch (error) {
      console.error('Error creating test invoice:', error)
      toast({
        title: 'Test Failed',
        description: 'Failed to create test invoice. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          QuickBooks Online
        </CardTitle>
        <CardDescription>
          Sync invoices and customers with QuickBooks Online
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!connection ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connect your QuickBooks Online account to sync invoices and customer data.
            </div>
            <Button onClick={connectQuickBooks} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect QuickBooks Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Connected</Badge>
                  <Badge variant="secondary">
                    Realm: {accountInfo?.realmId || connection.realmId}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Company: {accountInfo?.companyName || 'QuickBooks Company'}
                </div>
                {accountInfo?.lastSync && (
                  <div className="text-xs text-muted-foreground">
                    Last sync: {new Date(accountInfo.lastSync).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={disconnectQuickBooks} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>

            <Separator />

            {/* Sync Operations */}
            <div className="space-y-4">
              <div>
                <Label>Sync Operations</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  Sync data between Clean Report and QuickBooks
                </div>
                <div className="flex gap-2">
                  <Button onClick={syncCustomers} variant="outline">
                    Sync Customers
                  </Button>
                  <Button onClick={syncInvoices} variant="outline">
                    Sync Invoices
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Operations */}
            <div className="space-y-4">
              <div>
                <Label>Test Operations</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Test the integration by creating sample data
                </div>
                <Button onClick={createTestInvoice} variant="outline">
                  Create Test Invoice
                </Button>
              </div>
            </div>

            <Separator />

            {/* Sync Settings */}
            <div className="space-y-4">
              <div>
                <Label>Sync Settings</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  Configure automatic sync behavior
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Auto-sync invoices</div>
                      <div className="text-xs text-muted-foreground">
                        Automatically sync completed jobs as invoices
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Auto-sync customers</div>
                      <div className="text-xs text-muted-foreground">
                        Automatically sync new clients as customers
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Bidirectional sync</div>
                      <div className="text-xs text-muted-foreground">
                        Sync changes from QuickBooks back to Clean Report
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Mapping */}
            <div className="space-y-4">
              <div>
                <Label>Data Mapping</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  How Clean Report data maps to QuickBooks
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Jobs → Invoices</div>
                    <div className="text-xs text-muted-foreground">
                      Completed jobs are automatically converted to QuickBooks invoices
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Clients → Customers</div>
                    <div className="text-xs text-muted-foreground">
                      Clean Report clients are synced as QuickBooks customers
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Services → Items</div>
                    <div className="text-xs text-muted-foreground">
                      Cleaning services are mapped to QuickBooks items
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
                  Invoice Sync
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Customer Sync
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Account Management
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  OAuth Authentication
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 