"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ReportService } from '@/lib/report-service'
import { useAuth } from '@/components/auth/auth-provider'
import type { ReportConfiguration, ReportTemplate } from '@/types/database'
import { 
  Palette, 
  Image, 
  FileText, 
  Settings, 
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'

export function ReportConfiguration() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ReportConfiguration | null>(null)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadConfiguration()
    }
  }, [user])

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      const reportService = new ReportService(user!.id)
      const [configuration, templatesData] = await Promise.all([
        reportService.getReportConfiguration(),
        reportService.getReportTemplates()
      ])
      
      setConfig(configuration)
      setTemplates(templatesData)
      setLogoPreview(configuration.company_logo_url)
    } catch (error) {
      console.error('Error loading configuration:', error)
      toast({
        title: "Error",
        description: "Failed to load report configuration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config || !user) return

    try {
      setSaving(true)
      const reportService = new ReportService(user.id)
      await reportService.updateReportConfiguration(config)
      
      toast({
        title: "Success",
        description: "Report configuration saved successfully",
      })
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast({
        title: "Error",
        description: "Failed to save report configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Here you would upload to your storage service
      // For now, creating a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
        setConfig(prev => prev ? { ...prev, company_logo_url: e.target?.result as string } : null)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      })
    }
  }

  const updateConfig = (updates: Partial<ReportConfiguration>) => {
    setConfig(prev => prev ? { ...prev, ...updates } : null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No configuration found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Configuration</h2>
          <p className="text-muted-foreground">
            Customize your report appearance and content
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Branding</CardTitle>
              <CardDescription>
                Customize your company logo and colors for reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={config.company_name}
                    onChange={(e) => updateConfig({ company_name: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.include_company_logo}
                        onCheckedChange={(checked) => updateConfig({ include_company_logo: checked })}
                      />
                      <span className="text-sm">Include logo in reports</span>
                    </div>
                  </div>
                  
                  {config.include_company_logo && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {logoPreview && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="h-12 w-auto max-w-32 object-contain border rounded"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLogoPreview(null)
                                updateConfig({ company_logo_url: null })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateConfig({ primary_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => updateConfig({ primary_color: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                      placeholder="#1F2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => updateConfig({ accent_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.accent_color}
                      onChange={(e) => updateConfig({ accent_color: e.target.value })}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={config.font_family} onValueChange={(value) => updateConfig({ font_family: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Content</CardTitle>
              <CardDescription>
                Choose what information to include in your reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Tasks</Label>
                    <p className="text-sm text-muted-foreground">Show completed tasks in reports</p>
                  </div>
                  <Switch
                    checked={config.include_tasks}
                    onCheckedChange={(checked) => updateConfig({ include_tasks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Notes</Label>
                    <p className="text-sm text-muted-foreground">Show job notes and observations</p>
                  </div>
                  <Switch
                    checked={config.include_notes}
                    onCheckedChange={(checked) => updateConfig({ include_notes: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Timer Data</Label>
                    <p className="text-sm text-muted-foreground">Show time tracking information</p>
                  </div>
                  <Switch
                    checked={config.include_timer_data}
                    onCheckedChange={(checked) => updateConfig({ include_timer_data: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use Company Colors</Label>
                    <p className="text-sm text-muted-foreground">Apply your brand colors to reports</p>
                  </div>
                  <Switch
                    checked={config.include_company_colors}
                    onCheckedChange={(checked) => updateConfig({ include_company_colors: checked })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="report-template">Report Template</Label>
                <Select value={config.report_template} onValueChange={(value) => updateConfig({ report_template: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.name.toLowerCase()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photo Settings</CardTitle>
              <CardDescription>
                Configure how photos are displayed in reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Photos</Label>
                  <p className="text-sm text-muted-foreground">Show job photos in reports</p>
                </div>
                <Switch
                  checked={config.include_photos}
                  onCheckedChange={(checked) => updateConfig({ include_photos: checked })}
                />
              </div>

              {config.include_photos && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo-layout">Photo Layout</Label>
                    <Select value={config.photo_layout} onValueChange={(value) => updateConfig({ photo_layout: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max-photos">Maximum Photos per Report</Label>
                    <Input
                      id="max-photos"
                      type="number"
                      min="1"
                      max="100"
                      value={config.max_photos_per_report}
                      onChange={(e) => updateConfig({ max_photos_per_report: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Customize report headers and footers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="custom-header">Custom Header Text</Label>
                <Textarea
                  id="custom-header"
                  value={config.custom_header_text || ''}
                  onChange={(e) => updateConfig({ custom_header_text: e.target.value })}
                  placeholder="Enter custom header text..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="custom-footer">Custom Footer Text</Label>
                <Textarea
                  id="custom-footer"
                  value={config.custom_footer_text || ''}
                  onChange={(e) => updateConfig({ custom_footer_text: e.target.value })}
                  placeholder="Enter custom footer text..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
