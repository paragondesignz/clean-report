"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  UserPlus, 
  Mail, 
  Eye, 
  EyeOff, 
  Send, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from "lucide-react"
import { getClients } from "@/lib/supabase-client"
import { sendCustomerPortalInvitation } from "@/lib/customer-portal-client"
import type { Client } from "@/types/database"

interface CustomerPortalUser {
  id: string
  client_id: string
  email: string
  is_active: boolean
  last_login: string | null
  created_at: string
  client: Client
}

export function CustomerPortalSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [portalUsers, setPortalUsers] = useState<CustomerPortalUser[]>([])
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    clientId: "",
    email: "",
    password: "",
    showPassword: false
  })
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load clients
      const clientsData = await getClients()
      setClients(clientsData)
      
      // Load existing portal users
      const portalUsersData = await loadPortalUsers()
      setPortalUsers(portalUsersData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customer portal data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPortalUsers = async (): Promise<CustomerPortalUser[]> => {
    // This would normally fetch from your database
    // For now, returning empty array as placeholder
    return []
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setInviteForm(prev => ({ ...prev, password: result }))
  }

  const handleSendInvitation = async () => {
    if (!inviteForm.clientId || !inviteForm.email || !inviteForm.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    const selectedClient = clients.find(c => c.id === inviteForm.clientId)
    if (!selectedClient) {
      toast({
        title: 'Error',
        description: 'Please select a valid client',
        variant: 'destructive'
      })
      return
    }

    try {
      setSendingInvite(true)
      
      await sendCustomerPortalInvitation(
        inviteForm.clientId,
        inviteForm.email,
        inviteForm.password
      )

      toast({
        title: 'Invitation Sent!',
        description: `Customer portal invitation sent to ${inviteForm.email}`,
      })

      // Reset form and close dialog
      setInviteForm({
        clientId: "",
        email: "",
        password: "",
        showPassword: false
      })
      setShowInviteDialog(false)
      
      // Reload data to show new user
      await loadData()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSendingInvite(false)
    }
  }

  const openInviteDialog = () => {
    // Auto-generate password when opening dialog
    generatePassword()
    setShowInviteDialog(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Portal Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-2 text-muted-foreground">Loading customer portal settings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Portal Access
              </CardTitle>
              <CardDescription>
                Manage customer portal accounts and invitations
              </CardDescription>
            </div>
            <Button onClick={openInviteDialog}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{portalUsers.length}</div>
              <div className="text-sm text-blue-600">Active Portal Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {portalUsers.filter(u => u.last_login).length}
              </div>
              <div className="text-sm text-green-600">Users Logged In</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{clients.length}</div>
              <div className="text-sm text-gray-600">Total Clients</div>
            </div>
          </div>

          {/* Portal Users List */}
          {portalUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Portal Users Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by inviting your clients to access their customer portal.
              </p>
              <Button onClick={openInviteDialog}>
                <UserPlus className="w-4 h-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Portal Users</h3>
              {portalUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{user.client.name}</h4>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Created {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      {user.last_login ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last login {new Date(user.last_login).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertCircle className="h-3 w-3" />
                          Never logged in
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Portal Features</CardTitle>
          <CardDescription>What your customers can access through their portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">View complete job history</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Track allocated vs actual hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Monitor costs and billing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Access job reports and photos</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">AI-powered customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Submit feedback and ratings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">FAQ and help documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Direct contact with support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Customer Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite Customer to Portal
            </DialogTitle>
            <DialogDescription>
              Send a customer portal invitation with login credentials
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select 
                value={inviteForm.clientId} 
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Portal Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={inviteForm.showPassword ? "text" : "password"}
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setInviteForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {inviteForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Customer will be prompted to change this password on first login
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              disabled={sendingInvite}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={sendingInvite || !inviteForm.clientId || !inviteForm.email || !inviteForm.password}
            >
              {sendingInvite ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}