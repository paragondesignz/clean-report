"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Trash2, Mail, Phone, MapPin, Calendar, Eye, Clock, ExternalLink } from "lucide-react"
import { getClients, createClientRecord, deleteClientRecord } from "@/lib/supabase-client"
import type { Client } from "@/types/database"
import Link from "next/link"

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createClientRecord(formData)
      toast({
        title: "Success",
        description: "Client created successfully"
      })
      
      setIsCreateDialogOpen(false)
      resetForm()
      fetchClients()
    } catch (error) {
      console.error('Error saving client:', error)
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    
    try {
      await deleteClientRecord(clientId)
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: ""
    })
  }

  // Quick Actions
  const handleScheduleJob = (client: Client) => {
    // Navigate to jobs page with client pre-selected
    const url = `/jobs?client=${client.id}&clientName=${encodeURIComponent(client.name)}`
    window.open(url, '_blank')
  }

  const handleSendEmail = (client: Client) => {
    const subject = encodeURIComponent(`Hello ${client.name}`)
    const body = encodeURIComponent(`Hi ${client.name},\n\nI hope this email finds you well.\n\nBest regards,\nYour Cleaning Service Team`)
    const mailtoUrl = `mailto:${client.email}?subject=${subject}&body=${body}`
    window.open(mailtoUrl)
  }

  const handleCallClient = (client: Client) => {
    const phoneUrl = `tel:${client.phone}`
    window.open(phoneUrl)
  }

  const handleViewJobs = (client: Client) => {
    const url = `/jobs?client=${client.id}&clientName=${encodeURIComponent(client.name)}`
    window.open(url, '_blank')
  }



  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600">Manage your client relationships</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the client's information to add them to your system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search clients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="shadow-lg border-slate-200">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first client'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900">{client.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                <div className="flex items-start text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
                
                {/* Quick Actions */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleScheduleJob(client)}
                      className="h-8 text-xs justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Schedule Job
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendEmail(client)}
                      className="h-8 text-xs justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCallClient(client)}
                      className="h-8 text-xs justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call Client
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewJobs(client)}
                      className="h-8 text-xs justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Jobs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 