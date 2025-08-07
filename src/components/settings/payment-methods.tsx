"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/hooks/use-subscription"
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Check,
  AlertTriangle,
  Lock
} from "lucide-react"

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  cardholderName?: string
}

interface NewPaymentMethod {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  isDefault: boolean
}

export function PaymentMethods() {
  const { toast } = useToast()
  const { isPro } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [newPaymentMethod, setNewPaymentMethod] = useState<NewPaymentMethod>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  })

  // Mock data - in real app, this would come from your payment processor
  useEffect(() => {
    if (isPro) {
      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          cardholderName: 'John Doe'
        },
        {
          id: '2',
          type: 'card',
          last4: '5555',
          brand: 'Mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false,
          cardholderName: 'John Doe'
        }
      ])
    }
  }, [isPro])

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || 
        !newPaymentMethod.expiryYear || !newPaymentMethod.cvv || !newPaymentMethod.cardholderName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // In a real app, this would call your payment processor API
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        last4: newPaymentMethod.cardNumber.slice(-4),
        brand: 'Visa', // In real app, detect from card number
        expiryMonth: parseInt(newPaymentMethod.expiryMonth),
        expiryYear: parseInt(newPaymentMethod.expiryYear),
        isDefault: newPaymentMethod.isDefault,
        cardholderName: newPaymentMethod.cardholderName
      }

      // If this is the first card or user selected it as default, make it default
      if (paymentMethods.length === 0 || newPaymentMethod.isDefault) {
        setPaymentMethods(prev => 
          prev.map(method => ({ ...method, isDefault: false })).concat(newMethod)
        )
      } else {
        setPaymentMethods(prev => [...prev, newMethod])
      }

      toast({
        title: "Success",
        description: "Payment method added successfully",
      })
      
      setShowAddDialog(false)
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        isDefault: false
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditPaymentMethod = async () => {
    if (!selectedMethod) return

    try {
      setLoading(true)
      
      // In a real app, this would call your payment processor API
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === selectedMethod.id 
            ? { ...method, cardholderName: selectedMethod.cardholderName }
            : method
        )
      )

      toast({
        title: "Success",
        description: "Payment method updated successfully",
      })
      
      setShowEditDialog(false)
      setSelectedMethod(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return

    try {
      setLoading(true)
      
      // In a real app, this would call your payment processor API
      setPaymentMethods(prev => prev.filter(method => method.id !== selectedMethod.id))

      toast({
        title: "Success",
        description: "Payment method removed successfully",
      })
      
      setShowDeleteDialog(false)
      setSelectedMethod(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      setLoading(true)
      
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      )

      toast({
        title: "Success",
        description: "Default payment method updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : cleaned
  }

  const getCardBrand = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return 'Visa'
    if (cleaned.startsWith('5')) return 'Mastercard'
    if (cleaned.startsWith('3')) return 'American Express'
    return 'Unknown'
  }

  if (!isPro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Methods</span>
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Payment method management is available for Pro subscribers
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new credit or debit card for billing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Cardholder Name</Label>
                    <Input
                      id="cardholder-name"
                      value={newPaymentMethod.cardholderName}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      value={formatCardNumber(newPaymentMethod.cardNumber)}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-month">Month</Label>
                      <Input
                        id="expiry-month"
                        value={newPaymentMethod.expiryMonth}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiry-year">Year</Label>
                      <Input
                        id="expiry-year"
                        value={newPaymentMethod.expiryYear}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                        placeholder="YYYY"
                        maxLength={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={newPaymentMethod.cvv}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-default"
                      checked={newPaymentMethod.isDefault}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is-default" className="text-sm">
                      Set as default payment method
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">
                      {method.brand} •••• {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {method.cardholderName} • Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  {!method.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={loading}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMethod(method)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMethod(method)
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                <p className="text-muted-foreground">
                  Add a payment method to manage your billing
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Your payment information is secure</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We use industry-standard encryption to protect your payment information. 
                Your card details are never stored on our servers and are processed securely 
                through our payment partners.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payment Method Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the cardholder name for this payment method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cardholder-name">Cardholder Name</Label>
              <Input
                id="edit-cardholder-name"
                value={selectedMethod?.cardholderName || ''}
                onChange={(e) => setSelectedMethod(prev => prev ? { ...prev, cardholderName: e.target.value } : null)}
                placeholder="John Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPaymentMethod} disabled={loading}>
              {loading ? 'Updating...' : 'Update Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Method Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Warning</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              Removing this payment method may affect your billing if it's your default payment method.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePaymentMethod} disabled={loading}>
              {loading ? 'Removing...' : 'Remove Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 