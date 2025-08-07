"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useTierAccess } from "@/lib/tier-access"
// TODO: Implement proper Xero integration with API routes
// import { XeroIntegration, type XeroConnection, type XeroInvoice, type XeroContact, type XeroAccount } from "@/lib/xero-integration"

// Mock types for development
type XeroConnection = {
  id: string
  tenantName: string
}

type XeroInvoice = {
  id: string
  invoiceNumber: string
  contactName: string
  total: number
  status: string
  date: string
  currency: string
}

type XeroContact = {
  id: string
  name: string
  email: string
  phone: string
  isCustomer: boolean
  isSupplier: boolean  
}

type XeroAccount = {
  id: string
  name: string
}
import { 
  Building2, 
  FileText, 
  Users, 
  CreditCard, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Settings, 
  Download, 
  Upload, 
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2
} from "lucide-react"

export function XeroIntegrationComponent() {
  const [connection, setConnection] = useState<XeroConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [invoices, setInvoices] = useState<XeroInvoice[]>([])
  const [contacts, setContacts] = useState<XeroContact[]>([])
  const [accounts, setAccounts] = useState<XeroAccount[]>([])
  const [syncProgress, setSyncProgress] = useState(0)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authUrl, setAuthUrl] = useState("")
  const { toast } = useToast()
  const { access } = useTierAccess()

  // Check if user has Xero connection
  useEffect(() => {
    checkXeroConnection()
  }, [])

  const checkXeroConnection = async () => {
    try {
      // In a real app, this would fetch from your database
      const storedConnection = localStorage.getItem('xero_connection')
      if (storedConnection) {
        setConnection(JSON.parse(storedConnection))
      }
    } catch (error) {
      console.error('Error checking Xero connection:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Mock implementation - in production, this would call an API route
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAuthUrl("https://login.xero.com/identity/connect/authorize")
      setShowAuthDialog(true)
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect to Xero. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAuthCallback = async (code: string) => {
    try {
      // Mock implementation
      const newConnection: XeroConnection = {
        id: "mock-connection-id",
        tenantName: "Demo Company"
      }
      localStorage.setItem('xero_connection', JSON.stringify(newConnection))
      setConnection(newConnection)
      setShowAuthDialog(false)
      
      toast({
        title: "Connected to Xero!",
        description: "Your Xero account has been successfully connected."
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to complete Xero connection. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('xero_connection')
    setConnection(null)
    setInvoices([])
    setContacts([])
    setAccounts([])
    
    toast({
      title: "Disconnected from Xero",
      description: "Your Xero connection has been removed."
    })
  }

  const syncInvoices = async () => {
    if (!connection) return
    
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockInvoices: XeroInvoice[] = [
        {
          id: "1",
          invoiceNumber: "INV-001",
          contactName: "John Doe",
          total: 150.00,
          status: "PAID",
          date: new Date().toISOString(),
          currency: "USD"
        }
      ]
      setInvoices(mockInvoices)
      setSyncProgress(100)
      toast({
        title: "Invoices synced!",
        description: `Successfully synced ${mockInvoices.length} invoices`
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Unable to sync invoices. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const syncContacts = async () => {
    if (!connection) return
    
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockContacts: XeroContact[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "555-1234",
          isCustomer: true,
          isSupplier: false
        }
      ]
      setContacts(mockContacts)
      setSyncProgress(100)
      toast({
        title: "Contacts synced!",
        description: `Successfully synced ${mockContacts.length} contacts`
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Unable to sync contacts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const syncAccounts = async () => {
    if (!connection) return
    
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockAccounts: XeroAccount[] = [
        {
          id: "1",
          name: "Revenue Account"
        }
      ]
      setAccounts(mockAccounts)
      setSyncProgress(100)
      toast({
        title: "Accounts synced!",
        description: `Successfully synced ${mockAccounts.length} accounts.`
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Unable to sync accounts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const createInvoiceFromJob = async (jobId: string) => {
    if (!connection) return
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Invoice created!",
        description: "Invoice INV-002 has been created in Xero."
      })
      
      // Refresh invoices
      await syncInvoices()
    } catch (error) {
      toast({
        title: "Invoice creation failed",
        description: "Unable to create invoice in Xero. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'AUTHORISED': return 'bg-blue-100 text-blue-800'
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'VOIDED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!access.xeroIntegration) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Xero Integration - Pro Feature
          </h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Pro to unlock Xero integration and sync your accounting data.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Upgrade to Pro
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Xero Connection
          </CardTitle>
          <CardDescription>
            Connect your Xero account to sync invoices, contacts, and accounting data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Connected to Xero</p>
                    <p className="text-sm text-gray-600">{connection.tenantName}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
                  <div className="text-sm text-gray-600">Invoices</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{contacts.length}</div>
                  <div className="text-sm text-gray-600">Contacts</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{accounts.length}</div>
                  <div className="text-sm text-gray-600">Accounts</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Connected</h3>
              <p className="text-gray-600 mb-4">
                Connect your Xero account to start syncing data
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect to Xero
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Controls */}
      {connection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Sync Data
            </CardTitle>
            <CardDescription>
              Sync your Xero data with Clean Report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={syncInvoices}
                disabled={isSyncing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Sync Invoices
              </Button>
              <Button
                onClick={syncContacts}
                disabled={isSyncing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Sync Contacts
              </Button>
              <Button
                onClick={syncAccounts}
                disabled={isSyncing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Sync Accounts
              </Button>
            </div>
            
            {isSyncing && (
              <div className="mt-4">
                <Progress value={syncProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">Syncing data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">{invoice.contactName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        ${invoice.total.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {invoice.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {contact.isCustomer && (
                        <Badge variant="outline" className="text-xs">Customer</Badge>
                      )}
                      {contact.isSupplier && (
                        <Badge variant="outline" className="text-xs">Supplier</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {connection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => createInvoiceFromJob('mock-job-id')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Create Invoice from Job
              </Button>
              <Button
                onClick={() => window.open('https://go.xero.com', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Xero Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authorization Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Xero</DialogTitle>
            <DialogDescription>
              You'll be redirected to Xero to authorize the connection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click the button below to connect your Xero account. You'll be redirected to Xero's authorization page.
            </p>
            <Button
              onClick={() => window.open(authUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Authorize in Xero
            </Button>
            <p className="text-xs text-gray-500">
              After authorization, you'll be redirected back to Clean Report
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 