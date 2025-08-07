"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ReportService } from '@/lib/report-service'
import { getPhotoUrl } from '@/lib/supabase-client'
import type { Photo, ReportPhoto } from '@/types/database'
import { 
  Image, 
  Check, 
  X, 
  Edit3, 
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react'

interface PhotoSelectorProps {
  jobId: string
  onPhotosUpdated?: () => void
}

export function PhotoSelector({ jobId, onPhotosUpdated }: PhotoSelectorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [reportPhotos, setReportPhotos] = useState<ReportPhoto[]>([])
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null)
  const [editingCaption, setEditingCaption] = useState('')
  const [editingType, setEditingType] = useState('general')

  useEffect(() => {
    loadPhotos()
  }, [jobId])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const reportService = new ReportService('temp') // We'll get the actual user ID
      const reportData = await reportService.prepareReportData(jobId)
      
      setPhotos(reportData.photos)
      setReportPhotos(reportData.reportPhotos)
    } catch (error) {
      console.error('Error loading photos:', error)
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePhotoSelection = async (photoId: string, includeInReport: boolean) => {
    try {
      const reportService = new ReportService('temp')
      await reportService.updateReportPhotoSelection(jobId, photoId, includeInReport)
      
      setReportPhotos(prev => 
        prev.map(rp => 
          rp.photo_id === photoId 
            ? { ...rp, include_in_report: includeInReport }
            : rp
        )
      )
      
      onPhotosUpdated?.()
      
      toast({
        title: "Success",
        description: `Photo ${includeInReport ? 'included' : 'excluded'} from report`,
      })
    } catch (error) {
      console.error('Error updating photo selection:', error)
      toast({
        title: "Error",
        description: "Failed to update photo selection",
        variant: "destructive"
      })
    }
  }

  const updatePhotoDetails = async (photoId: string) => {
    try {
      const reportService = new ReportService('temp')
      await reportService.updateReportPhotoSelection(
        jobId, 
        photoId, 
        true, 
        editingCaption, 
        editingType
      )
      
      setReportPhotos(prev => 
        prev.map(rp => 
          rp.photo_id === photoId 
            ? { ...rp, caption: editingCaption, photo_type: editingType }
            : rp
        )
      )
      
      setEditingPhoto(null)
      onPhotosUpdated?.()
      
      toast({
        title: "Success",
        description: "Photo details updated",
      })
    } catch (error) {
      console.error('Error updating photo details:', error)
      toast({
        title: "Error",
        description: "Failed to update photo details",
        variant: "destructive"
      })
    }
  }

  const startEditing = (photo: Photo, reportPhoto: ReportPhoto) => {
    setEditingPhoto(photo.id)
    setEditingCaption(reportPhoto.caption || photo.file_name)
    setEditingType(reportPhoto.photo_type)
  }

  const cancelEditing = () => {
    setEditingPhoto(null)
    setEditingCaption('')
    setEditingType('general')
  }

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-red-100 text-red-800'
      case 'after': return 'bg-green-100 text-green-800'
      case 'task_specific': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Photos Available</h3>
          <p className="text-muted-foreground">
            No photos have been uploaded for this job yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Photo Selection</h3>
          <p className="text-sm text-muted-foreground">
            Choose which photos to include in the report and customize their details
          </p>
        </div>
        <Badge variant="secondary">
          {reportPhotos.filter(rp => rp.include_in_report).length} of {photos.length} selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => {
          const reportPhoto = reportPhotos.find(rp => rp.photo_id === photo.id)
          const isSelected = reportPhoto?.include_in_report || false
          const isEditing = editingPhoto === photo.id

          return (
            <Card key={photo.id} className={`relative overflow-hidden transition-all ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}>
              <div className="relative">
                <img
                  src={getPhotoUrl(photo.file_path)}
                  alt={photo.file_name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Photo Type Badge */}
                <Badge 
                  className={`absolute top-2 right-2 ${getPhotoTypeColor(reportPhoto?.photo_type || 'general')}`}
                >
                  {reportPhoto?.photo_type || 'general'}
                </Badge>

                {/* Selection Overlay */}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}>
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Eye className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`caption-${photo.id}`}>Caption</Label>
                      <Textarea
                        id={`caption-${photo.id}`}
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        placeholder="Enter photo caption..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`type-${photo.id}`}>Photo Type</Label>
                      <Select value={editingType} onValueChange={setEditingType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="before">Before</SelectItem>
                          <SelectItem value="after">After</SelectItem>
                          <SelectItem value="task_specific">Task Specific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updatePhotoDetails(photo.id)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditing}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm truncate">
                        {reportPhoto?.caption || photo.file_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(checked) => togglePhotoSelection(photo.id, checked)}
                        />
                        <span className="text-sm">
                          {isSelected ? 'Included' : 'Excluded'}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(photo, reportPhoto!)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(getPhotoUrl(photo.file_path), '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Selected photos will be included in the generated report
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setReportPhotos(prev => 
                prev.map(rp => ({ ...rp, include_in_report: true }))
              )
            }}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReportPhotos(prev => 
                prev.map(rp => ({ ...rp, include_in_report: false }))
              )
            }}
          >
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  )
}
