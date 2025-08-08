"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Wrench,
  User,
  Key,
  AlertTriangle,
  BookOpen,
  Calendar,
  RefreshCw
} from "lucide-react"
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote 
} from "@/lib/supabase-client"

interface JobNote {
  id: string
  job_id: string
  content: string
  category: 'general' | 'maintenance' | 'client_preference' | 'access_instructions' | 'special_requirements'
  created_at: string
  updated_at: string
}

interface JobNotesProps {
  jobId: string
  jobTitle: string
  isRecurringJob?: boolean
  recurringJobId?: string
}

export function JobNotes({ jobId, jobTitle, isRecurringJob = false, recurringJobId }: JobNotesProps) {
  const { toast } = useToast()
  const [notes, setNotes] = useState<JobNote[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteCategory, setNewNoteCategory] = useState<JobNote['category']>("general")
  const [editContent, setEditContent] = useState("")
  const [editCategory, setEditCategory] = useState<JobNote['category']>("general")

  useEffect(() => {
    loadNotes()
  }, [jobId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await getNotes(jobId)
      // Convert notes to match our interface (add category if missing)
      const notesWithCategories = data.map(note => ({
        ...note,
        category: note.category || 'general' as JobNote['category']
      }))
      setNotes(notesWithCategories)
    } catch (error) {
      console.error('Error loading notes:', error)
      toast({
        title: "Error Loading Notes",
        description: "Could not load job notes.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      const noteData = {
        job_id: jobId,
        content: newNoteContent.trim(),
        category: newNoteCategory
      }
      
      const note = await createNote(noteData)
      setNotes(prev => [note, ...prev])
      setNewNoteContent("")
      setNewNoteCategory("general")
      setIsAddingNote(false)

      toast({
        title: "Note Added",
        description: isRecurringJob 
          ? "Note added to this job instance and will be visible on all future instances."
          : "Job note has been saved.",
        duration: 3000
      })
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error Adding Note",
        description: "Could not save the note. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditNote = (note: JobNote) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
    setEditCategory(note.category)
  }

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return

    try {
      const updatedNote = await updateNote(noteId, {
        content: editContent.trim(),
        category: editCategory
      })
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, ...updatedNote } : note))
      setEditingNoteId(null)
      setEditContent("")
      setEditCategory("general")

      toast({
        title: "Note Updated",
        description: "Changes have been saved.",
        duration: 2000
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error Updating Note",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      setNotes(prev => prev.filter(note => note.id !== noteId))

      toast({
        title: "Note Deleted",
        description: "The note has been removed.",
        duration: 2000
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error Deleting Note",
        description: "Could not delete the note. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />
      case 'client_preference': return <User className="h-4 w-4 text-blue-500" />
      case 'access_instructions': return <Key className="h-4 w-4 text-purple-500" />
      case 'special_requirements': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <BookOpen className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'client_preference': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'access_instructions': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'special_requirements': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now'
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">
              {isRecurringJob ? 'Recurring Job Notes' : 'Job Notes'}
            </CardTitle>
          </div>
          <Button
            onClick={() => setIsAddingNote(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
        <CardDescription className="flex items-center space-x-2">
          {isRecurringJob ? (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>
                Notes for "{jobTitle}" - visible across all job instances for workers on-site
              </span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span>
                Notes and observations for "{jobTitle}"
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add New Note Form */}
        {isAddingNote && (
          <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add New Note</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false)
                    setNewNoteContent("")
                    setNewNoteCategory("general")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Notes</SelectItem>
                    <SelectItem value="maintenance">Maintenance Info</SelectItem>
                    <SelectItem value="client_preference">Client Preferences</SelectItem>
                    <SelectItem value="access_instructions">Access Instructions</SelectItem>
                    <SelectItem value="special_requirements">Special Requirements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">Note Content</Label>
                <Textarea
                  id="content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={isRecurringJob 
                    ? "Enter note content that will be visible to all workers on this recurring job..."
                    : "Enter note content for this job..."
                  }
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false)
                    setNewNoteContent("")
                    setNewNoteCategory("general")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No notes yet</p>
            <p className="text-sm text-gray-500">
              {isRecurringJob 
                ? "Add notes that will be visible to workers across all instances of this recurring job"
                : "Add notes and observations about this job"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(note.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getCategoryColor(note.category)}`}>
                          {formatCategoryLabel(note.category)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(note.created_at)}
                          {note.updated_at !== note.created_at && ' (edited)'}
                        </span>
                      </div>
                      
                      {editingNoteId !== note.id && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingNoteId === note.id ? (
                      <div className="space-y-3">
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Notes</SelectItem>
                            <SelectItem value="maintenance">Maintenance Info</SelectItem>
                            <SelectItem value="client_preference">Client Preferences</SelectItem>
                            <SelectItem value="access_instructions">Access Instructions</SelectItem>
                            <SelectItem value="special_requirements">Special Requirements</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNoteId(null)
                              setEditContent("")
                              setEditCategory("general")
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={!editContent.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}