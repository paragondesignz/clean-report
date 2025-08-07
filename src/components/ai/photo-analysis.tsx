"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, Sparkles, CheckCircle, AlertCircle, Star, TrendingUp, FileText, Download, Share2, Eye, EyeOff, RotateCcw, Zap, Loader2 } from "lucide-react"
import { PhotoAnalyzer, AIUtils, type PhotoAnalysis } from "@/lib/ai-services"
import { useTierAccess } from "@/lib/tier-access"

export function PhotoAnalysis() {
  const [beforeImages, setBeforeImages] = useState<File[]>([])
  const [afterImages, setAfterImages] = useState<File[]>([])
  const [jobInfo, setJobInfo] = useState({
    jobType: "Standard Cleaning",
    duration: "",
    tasks: "",
    clientName: "",
    date: ""
  })
  const [report, setReport] = useState<PhotoAnalysis | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBeforeImages, setShowBeforeImages] = useState(true)
  const [showAfterImages, setShowAfterImages] = useState(true)
  const beforeFileInputRef = useRef<HTMLInputElement>(null)
  const afterFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { access } = useTierAccess()

  const handleBeforeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only image files.",
        variant: "destructive"
      })
    }
    
    setBeforeImages(prev => [...prev, ...validFiles])
  }

  const handleAfterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only image files.",
        variant: "destructive"
      })
    }
    
    setAfterImages(prev => [...prev, ...validFiles])
  }

  const handleCameraCapture = async (type: 'before' | 'after') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        ctx.drawImage(video, 0, 0)
        stream.getTracks().forEach(track => track.stop())
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${type}-${Date.now()}.jpg`, { type: 'image/jpeg' })
            if (type === 'before') {
              setBeforeImages(prev => [...prev, file])
            } else {
              setAfterImages(prev => [...prev, file])
            }
            toast({
              title: "Photo captured",
              description: `${type.charAt(0).toUpperCase() + type.slice(1)} photo has been added.`
            })
          }
        }, 'image/jpeg', 0.8)
      })
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture photos.",
        variant: "destructive"
      })
    }
  }

  const removeBeforeImage = (index: number) => {
    setBeforeImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeAfterImage = (index: number) => {
    setAfterImages(prev => prev.filter((_, i) => i !== index))
  }

  const analyzePhotos = async () => {
    if (beforeImages.length === 0 || afterImages.length === 0) {
      toast({
        title: "Missing photos",
        description: "Please upload both before and after photos for analysis.",
        variant: "destructive"
      })
      return
    }

    if (!jobInfo.jobType || !jobInfo.clientName) {
      toast({
        title: "Missing information",
        description: "Please fill in job type and client name.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Validate and compress images
      const processedBeforeImages = await Promise.all(
        beforeImages.map(async (image) => {
          const isValid = await AIUtils.validateImageQuality(image)
          if (!isValid) {
            toast({
              title: "Low quality image",
              description: "Some before images may be too small for accurate analysis.",
              variant: "destructive"
            })
          }
          return AIUtils.compressImage(image, 1024)
        })
      )

      const processedAfterImages = await Promise.all(
        afterImages.map(async (image) => {
          const isValid = await AIUtils.validateImageQuality(image)
          if (!isValid) {
            toast({
              title: "Low quality image",
              description: "Some after images may be too small for accurate analysis.",
              variant: "destructive"
            })
          }
          return AIUtils.compressImage(image, 1024)
        })
      )

      // Analyze photos using AI
      const analysisResult = await PhotoAnalyzer.analyzeBeforeAfter(
        processedBeforeImages,
        processedAfterImages,
        jobInfo
      )

      setReport(analysisResult)
      setShowReport(true)
      
      toast({
        title: "Analysis Complete!",
        description: "AI has analyzed your before/after photos and generated a detailed report."
      })
    } catch (error) {
      console.error('Photo analysis error:', error)
      toast({
        title: "Analysis failed",
        description: "Unable to analyze photos. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 75) return 'bg-blue-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (!access.aiFeatures) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Photo Analysis - Pro Feature
          </h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Pro to unlock AI-powered photo analysis and professional reports.
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
      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Job Information
          </CardTitle>
          <CardDescription>
            Enter job details for accurate photo analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">Job Type</Label>
              <select
                id="jobType"
                value={jobInfo.jobType}
                onChange={(e) => setJobInfo(prev => ({ ...prev, jobType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Standard Cleaning">Standard Cleaning</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
                <option value="Move-in Cleaning">Move-in Cleaning</option>
                <option value="Move-out Cleaning">Move-out Cleaning</option>
                <option value="Post-construction">Post-construction</option>
                <option value="Holiday Cleaning">Holiday Cleaning</option>
              </select>
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={jobInfo.clientName}
                onChange={(e) => setJobInfo(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={jobInfo.duration}
                onChange={(e) => setJobInfo(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="120"
              />
            </div>
            <div>
              <Label htmlFor="date">Job Date</Label>
              <Input
                id="date"
                type="date"
                value={jobInfo.date}
                onChange={(e) => setJobInfo(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tasks">Tasks Performed</Label>
            <Textarea
              id="tasks"
              value={jobInfo.tasks}
              onChange={(e) => setJobInfo(prev => ({ ...prev, tasks: e.target.value }))}
              placeholder="List the cleaning tasks performed..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Before Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Before Photos
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBeforeImages(!showBeforeImages)}
            >
              {showBeforeImages ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
          <CardDescription>
            Upload photos showing the condition before cleaning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => beforeFileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Before Photos
            </Button>
            <Button
              onClick={() => handleCameraCapture('before')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Before Photo
            </Button>
          </div>
          
          <input
            ref={beforeFileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleBeforeImageUpload}
            className="hidden"
          />

          {showBeforeImages && beforeImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beforeImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Before ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeBeforeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Before {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* After Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            After Photos
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAfterImages(!showAfterImages)}
            >
              {showAfterImages ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
          <CardDescription>
            Upload photos showing the condition after cleaning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => afterFileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload After Photos
            </Button>
            <Button
              onClick={() => handleCameraCapture('after')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take After Photo
            </Button>
          </div>
          
          <input
            ref={afterFileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleAfterImageUpload}
            className="hidden"
          />

          {showAfterImages && afterImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {afterImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`After ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeAfterImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-600 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    After {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          onClick={analyzePhotos}
          disabled={isAnalyzing || beforeImages.length === 0 || afterImages.length === 0}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Photos...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Analysis Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Photo Analysis Report
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of before/after cleaning photos
            </DialogDescription>
          </DialogHeader>

          {report && (
            <div className="space-y-6">
              {/* Summary Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.beforeAfterComparison.improvementScore}%
                      </div>
                      <div className="text-sm text-gray-600">Improvement Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {report.cleaningReport.qualityScore}%
                      </div>
                      <div className="text-sm text-gray-600">Quality Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {report.clientSatisfaction}%
                      </div>
                      <div className="text-sm text-gray-600">Client Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Before/After Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Before/After Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Areas Improved:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.beforeAfterComparison.areasImproved.map((area, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Before Issues:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.beforeAfterComparison.beforeIssues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-orange-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">After Quality:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.beforeAfterComparison.afterQuality.map((quality, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            <Star className="w-3 h-3 mr-1" />
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cleaning Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Cleaning Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Tasks Completed:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {report.cleaningReport.tasksCompleted.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Time Spent:</h4>
                        <p className="text-lg font-semibold text-blue-600">
                          {AIUtils.formatTime(report.cleaningReport.timeSpent)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Supplies Used:</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.cleaningReport.suppliesUsed.map((supply, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {supply}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share with Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 