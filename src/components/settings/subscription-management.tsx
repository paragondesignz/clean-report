"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Shield,
  Zap
} from "lucide-react"

interface BillingCycle {
  id: string
  startDate: string
  endDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  invoiceUrl?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export function SubscriptionManagement() {
  const { toast } = useToast()
  const { tier, limits, isPro, isFree, refreshProfile } = useSubscription()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [usageStats, setUsageStats] = useState({
    clients: 0,
    jobs: 0,
    reports: 0,
    recurringJobs: 0
  })

  // Fetch real data from billing service
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          // In a real app, these would be API calls
          // For now, using mock data with realistic structure
          if (isPro) {
            setBillingCycles([
              {
                id: '1',
                startDate: '2024-01-01',
                endDate: '2024-01-31',
                amount: 29.00,
                status: 'paid',
                invoiceUrl: '#'
              },
              {
                id: '2',
                startDate: '2024-02-01',
                endDate: '2024-02-29',
                amount: 29.00,
                status: 'paid',
                invoiceUrl: '#'
              },
              {
                id: '3',
                startDate: '2024-03-01',
                endDate: '2024-03-31',
                amount: 29.00,
                status: 'pending',
                invoiceUrl: '#'
              }
            ])

            setPaymentMethods([
              {
                id: '1',
                type: 'card',
                last4: '4242',
                brand: 'Visa',
                expiryMonth: 12,
                expiryYear: 2025,
                isDefault: true
              }
            ])
          }

          // Fetch usage stats
          setUsageStats({
            clients: 3,
            jobs: 12,
            reports: 8,
            recurringJobs: 2
          })
        } catch (error) {
          console.error('Error fetching billing data:', error)
        }
      }
    }

    fetchData()
  }, [isPro, user?.id])

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // In a real app, this would redirect to Stripe Checkout or similar
      toast({
        title: "Upgrade Initiated",
        description: "Redirecting to payment page...",
      })
      
      // Simulate upgrade process
      setTimeout(() => {
        toast({
          title: "Upgrade Successful",
          description: "Welcome to Pro! Your account has been upgraded.",
        })
        refreshProfile()
        setShowUpgradeDialog(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setLoading(true)
    try {
      // In a real app, this would call your billing API
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the end of the current billing period.",
      })
      setShowCancelDialog(false)
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Current Plan</span>
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${isPro ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Crown className={`h-6 w-6 ${isPro ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{isPro ? 'Pro Plan' : 'Free Plan'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isPro ? '$29/month' : '$0/month'}
                </p>
              </div>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {isPro ? 'Active' : 'Free'}
            </Badge>
          </div>

          {isFree && (
            <div className="flex space-x-2">
              <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upgrade to Pro</DialogTitle>
                    <DialogDescription>
                      Get unlimited access to all features and priority support.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Unlimited clients and jobs</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Time tracking</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Recurring jobs</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Branded reports</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Priority support</span>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">$29</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpgrade} disabled={loading}>
                      {loading ? 'Processing...' : 'Upgrade Now'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {isPro && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your Pro subscription? You'll lose access to Pro features at the end of your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">What happens when you cancel:</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                        <li>• You'll keep Pro access until the end of your billing period</li>
                        <li>• Your account will revert to Free plan</li>
                        <li>• You'll lose access to unlimited features</li>
                        <li>• Your data will be preserved</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Keep Subscription
                    </Button>
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                      {loading ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Your current usage compared to plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Clients</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{usageStats.clients}</span>
                <span className="text-sm text-muted-foreground">/ {limits.maxClients === -1 ? '∞' : limits.maxClients}</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Jobs</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{usageStats.jobs}</span>
                <span className="text-sm text-muted-foreground">/ {limits.maxJobs === -1 ? '∞' : limits.maxJobs}</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Reports</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{usageStats.reports}</span>
                <span className="text-sm text-muted-foreground">/ {limits.maxReports === -1 ? '∞' : limits.maxReports}</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Recurring</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{usageStats.recurringJobs}</span>
                <span className="text-sm text-muted-foreground">/ {limits.maxRecurringJobs === -1 ? '∞' : limits.maxRecurringJobs}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {isPro && billingCycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Your recent invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingCycles.map((cycle) => (
                <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pro Plan - Monthly
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">${cycle.amount.toFixed(2)}</div>
                      <Badge className={`text-xs ${getStatusColor(cycle.status)}`}>
                        {cycle.status}
                      </Badge>
                    </div>
                    {cycle.invoiceUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      {isPro && paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">
                        {method.brand} •••• {method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 