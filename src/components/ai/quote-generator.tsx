"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, Sparkles, DollarSign, Clock, Home, Bed, Bath, Car, Sofa, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { AIQuoteGenerator, AIUtils, type QuoteEstimate, type RoomAnalysis } from "@/lib/ai-services"
import { useTierAccess } from "@/lib/tier-access"

export function QuoteGenerator() {
  const [images, setImages] = useState<File[]>([])
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "Residential",
    squareMetres: "",
    bedrooms: "",
    bathrooms: "",
    specialRequirements: ""
  })
  const [quote, setQuote] = useState<QuoteEstimate | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detailedInsights, setDetailedInsights] = useState<RoomAnalysis[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { access } = useTierAccess()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only image files.",
        variant: "destructive"
      })
    }
    
    setImages(prev => [...prev, ...validFiles])
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        ctx.drawImage(video, 0, 0)
        stream.getTracks().forEach(track => track.stop())
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
            setImages(prev => [...prev, file])
            toast({
              title: "Photo captured",
              description: "Image has been added to your quote request."
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const analyzeImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one photo to generate a quote.",
        variant: "destructive"
      })
      return
    }

    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "Missing information",
        description: "Please fill in client name and email.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Validate and compress images
      const processedImages = await Promise.all(
        images.map(async (image) => {
          const isValid = await AIUtils.validateImageQuality(image)
          if (!isValid) {
            toast({
              title: "Low quality image",
              description: "Some images may be too small for accurate analysis.",
              variant: "destructive"
            })
          }
          return AIUtils.compressImage(image, 1024)
        })
      )

      // Generate quote using AI
      const quoteResult = await AIQuoteGenerator.generateQuote(processedImages, clientInfo)
      setQuote(quoteResult)

      // Get detailed insights
      const insights = await AIQuoteGenerator.getDetailedCleaningInsights(processedImages)
      setDetailedInsights(insights)

      setShowQuote(true)
      toast({
        title: "Quote Generated!",
        description: "AI analysis complete. Review your quote below."
      })
    } catch (error) {
      console.error('Quote generation error:', error)
      toast({
        title: "Analysis failed",
        description: "Unable to generate quote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!access.aiFeatures) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Quote Generator - Pro Feature
          </h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Pro to unlock AI-powered quote generation and scale your business.
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
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Client Information
          </CardTitle>
          <CardDescription>
            Enter client details to generate a personalized quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <select
                id="propertyType"
                value={clientInfo.propertyType}
                onChange={(e) => setClientInfo(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Residential">Residential</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div>
              <Label htmlFor="squareMetres">Floor Area (m²)</Label>
              <Input
                id="squareMetres"
                value={clientInfo.squareMetres}
                onChange={(e) => setClientInfo(prev => ({ ...prev, squareMetres: e.target.value }))}
                placeholder="140"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  value={clientInfo.bedrooms}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, bedrooms: e.target.value }))}
                  placeholder="3"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  value={clientInfo.bathrooms}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, bathrooms: e.target.value }))}
                  placeholder="2"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={clientInfo.specialRequirements}
              onChange={(e) => setClientInfo(prev => ({ ...prev, specialRequirements: e.target.value }))}
              placeholder="Any special cleaning requirements, allergies, or preferences..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Photos
          </CardTitle>
          <CardDescription>
            Upload photos of the space to be cleaned for accurate AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photos
            </Button>
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Quote Button */}
      <div className="flex justify-center">
        <Button
          onClick={analyzeImages}
          disabled={isAnalyzing || images.length === 0}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Images...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Quote
            </>
          )}
        </Button>
      </div>

      {/* Quote Dialog */}
      <Dialog open={showQuote} onOpenChange={setShowQuote}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              AI-Generated Quote
            </DialogTitle>
            <DialogDescription>
              Detailed quote based on AI analysis of your photos
            </DialogDescription>
          </DialogHeader>

          {quote && (
            <div className="space-y-6">
              {/* Quote Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {AIUtils.formatCurrency(quote.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-600">Total Price</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {AIUtils.formatTime(quote.totalTime)}
                      </div>
                      <div className="text-sm text-gray-600">Estimated Time</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Badge className={`${getComplexityColor(quote.complexity)} text-sm`}>
                        {quote.complexity.toUpperCase()} COMPLEXITY
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quote.breakdown.map((room, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{room.room}</h4>
                          <div className="text-right">
                            <div className="font-bold">{AIUtils.formatCurrency(room.price)}</div>
                            <div className="text-sm text-gray-600">{AIUtils.formatTime(room.estimatedTime)}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {room.tasks.map((task, taskIndex) => (
                            <Badge key={taskIndex} variant="secondary" className="text-xs">
                              {task}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Insights */}
              {detailedInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Room Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {detailedInsights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{insight.room}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">{insight.condition}</Badge>
                              <Badge variant="outline">{insight.difficulty}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Tasks Required:</h5>
                              <ul className="space-y-1">
                                {insight.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Supplies Needed:</h5>
                              <div className="flex flex-wrap gap-1">
                                {insight.supplies.map((supply, supplyIndex) => (
                                  <Badge key={supplyIndex} variant="secondary" className="text-xs">
                                    {supply}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          {insight.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{insight.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supplies and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplies & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Required Supplies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {quote.supplies.map((supply, index) => (
                          <Badge key={index} variant="outline">
                            {supply}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {quote.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Additional Notes:</h4>
                        <p className="text-gray-700">{quote.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuote(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Send Quote to Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 