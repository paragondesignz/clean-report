"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Save,
  X,
  User, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Pencil
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getClient } from "@/lib/supabase-client"
import type { Client } from "@/types/database"

interface ClientNote {
  id: string
  client_id: string
  content: string
  created_at: string
  updated_at: string
}

interface ClientWithDetails extends Client {
  notes?: ClientNote[]
  totalJobs?: number
  completedJobs?: number
  totalRevenue?: number
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = useState<ClientWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    if (params.id) {
      fetchClientDetails(params.id as string)
    }
  }, [params.id])

  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const fetchClientDetails = async (clientId: string) => {
    try {
      setLoading(true)
      // Fetch client details from Supabase
      const clientData = await getClient(clientId)
      if (clientData) {
        setClient(clientData)
        const initialFormData = {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address
        }
        setFormData(initialFormData)
        setOriginalFormData(initialFormData)
      } else {
        toast({
          title: "Error",
          description: "Client not found",
          variant: "destructive"
        })
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client details:', error)
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!client) return
    
    try {
      // TODO: Save client to Supabase
      setClient({ ...client, ...formData })
      setOriginalFormData({ ...formData })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Client updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      })
    }
    setIsEditing(false)
  }

  const handleNavigation = (path: string) => {
    if (isEditing && hasUnsavedChanges()) {
      setPendingNavigation(path)
      setIsUnsavedChangesDialogOpen(true)
    } else {
      router.push(path)
    }
  }

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setIsUnsavedChangesDialogOpen(false)
    setPendingNavigation(null)
  }

  const handleCancelNavigation = () => {
    setIsUnsavedChangesDialogOpen(false)
    setPendingNavigation(null)
  }

  // Note Management Functions
  const handleAddNote = async () => {
    if (!client || !newNote.trim()) return
    
    try {
      // TODO: Add note to Supabase
      const newNoteObj: ClientNote = {
        id: `note-${Date.now()}`,
        client_id: client.id,
        content: newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setClient({ 
        ...client, 
        notes: [...(client.notes || []), newNoteObj] 
      })
      setNewNote("")
      toast({
        title: "Success",
        description: "Note added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      })
    }
  }

  const handleEditNote = async (note: ClientNote) => {
    setEditingNote(note)
  }

  const handleSaveNote = async () => {
    if (!client || !editingNote) return
    
    try {
      // TODO: Update note in Supabase
      const updatedNotes = client.notes?.map(note => 
        note.id === editingNote.id ? { ...editingNote, updated_at: new Date().toISOString() } : note
      )
      setClient({ ...client, notes: updatedNotes })
      setEditingNote(null)
      toast({
        title: "Success",
        description: "Note updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!client) return
    
    try {
      // TODO: Delete note from Supabase
      const updatedNotes = client.notes?.filter(note => note.id !== noteId)
      setClient({ ...client, notes: updatedNotes })
      toast({
        title: "Success",
        description: "Note deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!client) return
    
    try {
      // TODO: Delete client from Supabase
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
      router.push("/clients")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading client details...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Client Not Found</h2>
        <p className="text-slate-600 mb-6">The client you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/clients")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => handleNavigation("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? "Edit Client" : client.name}
            </h1>
            <p className="text-slate-600">Client Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Client</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this client? This action cannot be undone and will also delete all associated jobs and notes.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Client
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={isUnsavedChangesDialogOpen} onOpenChange={setIsUnsavedChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNavigation}>
              Stay and Edit
            </Button>
            <Button variant="destructive" onClick={handleConfirmNavigation}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-slate-600">{client.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Notes</CardTitle>
              <CardDescription>
                Add notes and observations about the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {client.notes?.slice().reverse().map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveNote}>
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-700">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                              className="text-blue-600 hover:text-blue-700 h-6 px-2"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Stats */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{client.totalJobs || 0}</p>
                  <p className="text-sm text-slate-600">Total Jobs</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{client.completedJobs || 0}</p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">${client.totalRevenue || 0}</p>
                <p className="text-sm text-slate-600">Total Revenue</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Client Since</span>
                <span className="text-sm font-medium">{formatDate(client.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(client.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Notes</span>
                <span className="text-sm font-medium">{client.notes?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Job
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 