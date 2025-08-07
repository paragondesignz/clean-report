"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Loader2, Sparkles, Route, TrendingUp, Zap } from "lucide-react"
import { SmartScheduler as AISmartScheduler, AIUtils, type SmartSchedule } from "@/lib/ai-services"
import { useTierAccess } from "@/lib/tier-access"

export function SmartScheduler() {
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [schedule, setSchedule] = useState<SmartSchedule | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const { access } = useTierAccess()

  // Mock client data - in real app, this would come from your database
  const mockClients = [
    { id: "1", name: "John Smith", address: "123 Main St, City, State", jobs: ["Regular Cleaning", "Deep Cleaning"] },
    { id: "2", name: "Sarah Johnson", address: "456 Oak Ave, City, State", jobs: ["Weekly Cleaning", "Move-in Cleaning"] },
    { id: "3", name: "Mike Davis", address: "789 Pine Rd, City, State", jobs: ["Bi-weekly Cleaning", "Post-construction"] },
    { id: "4", name: "Lisa Wilson", address: "321 Elm St, City, State", jobs: ["Monthly Cleaning", "Holiday Cleaning"] },
    { id: "5", name: "David Brown", address: "654 Maple Dr, City, State", jobs: ["Regular Cleaning", "Spring Cleaning"] },
  ]

  // Mock jobs data - in real app, this would come from your database
  const mockJobs = [
    {
      id: "1",
      title: "Regular Cleaning",
      client: "John Smith",
      address: "123 Main St, City, State",
      duration: 120,
      complexity: "medium",
      priority: "normal",
      preferences: "Morning preferred"
    },
    {
      id: "2",
      title: "Deep Cleaning",
      client: "Sarah Johnson",
      address: "456 Oak Ave, City, State",
      duration: 180,
      complexity: "high",
      priority: "high",
      preferences: "Afternoon only"
    },
    {
      id: "3",
      title: "Weekly Cleaning",
      client: "Mike Davis",
      address: "789 Pine Rd, City, State",
      duration: 90,
      complexity: "low",
      priority: "normal",
      preferences: "Any time"
    },
    {
      id: "4",
      title: "Move-in Cleaning",
      client: "Lisa Wilson",
      address: "321 Elm St, City, State",
      duration: 240,
      complexity: "high",
      priority: "urgent",
      preferences: "Early morning"
    },
    {
      id: "5",
      title: "Bi-weekly Cleaning",
      client: "David Brown",
      address: "654 Maple Dr, City, State",
      duration: 150,
      complexity: "medium",
      priority: "normal",
      preferences: "Late afternoon"
    }
  ]

  const generateSmartSchedule = async () => {
    if (!selectedClient || !selectedDate) {
      toast({
        title: "Missing information",
        description: "Please select a client and date for scheduling.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Get jobs for the selected client
      const clientJobs = mockJobs.filter(job => job.client === selectedClient)
      
      if (clientJobs.length === 0) {
        toast({
          title: "No jobs found",
          description: "No jobs found for the selected client.",
          variant: "destructive"
        })
        return
      }

      // Preferences and constraints
      const preferences = {
        startTime: "8:00 AM",
        endTime: "6:00 PM",
        breakDuration: "30 minutes",
        travelTime: "15 minutes"
      }

      const constraints = {
        availableDays: "Monday-Friday",
        maxJobsPerDay: "8",
        priorityClients: selectedClient
      }

      // Generate smart schedule using AI
      const scheduleResult = await AISmartScheduler.generateSmartSchedule(
        clientJobs,
        preferences,
        constraints
      )

      setSchedule(scheduleResult)
      setShowSchedule(true)
      
      toast({
        title: "Smart Schedule Generated!",
        description: "AI has analyzed preferences and optimized your schedule."
      })
    } catch (error) {
      console.error('Smart scheduling error:', error)
      toast({
        title: "Schedule generation failed",
        description: "Unable to generate smart schedule. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!access.aiFeatures) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Smart Scheduler - Pro Feature
          </h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Pro to unlock AI-powered smart scheduling and optimize your routes.
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
      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Configuration
          </CardTitle>
          <CardDescription>
            Configure your smart scheduling preferences and generate an optimized schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Select Client</Label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a client...</option>
                {mockClients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name} - {client.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Schedule Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Client Jobs Preview */}
          {selectedClient && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Available Jobs for {selectedClient}:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockJobs
                  .filter(job => job.client === selectedClient)
                  .map((job) => (
                    <div key={job.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{job.title}</h5>
                        <div className="flex gap-1">
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                          <Badge className={getComplexityColor(job.complexity)}>
                            {job.complexity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {AIUtils.formatTime(job.duration)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job.preferences}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Generate Schedule Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={generateSmartSchedule}
              disabled={isGenerating || !selectedClient || !selectedDate}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Smart Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Smart Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              AI-Generated Smart Schedule
            </DialogTitle>
            <DialogDescription>
              Optimized schedule based on AI analysis of preferences and constraints
            </DialogDescription>
          </DialogHeader>

          {schedule && (
            <div className="space-y-6">
              {/* Schedule Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {schedule.optimalTime}
                      </div>
                      <div className="text-sm text-gray-600">Optimal Start Time</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {schedule.efficiency}%
                      </div>
                      <div className="text-sm text-gray-600">Efficiency Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {schedule.routeOptimization.totalDistance} mi
                      </div>
                      <div className="text-sm text-gray-600">Total Distance</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {AIUtils.formatTime(schedule.routeOptimization.estimatedTravelTime)}
                      </div>
                      <div className="text-sm text-gray-600">Travel Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Route Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Optimized Job Order:</h4>
                      <div className="flex flex-wrap gap-2">
                        {schedule.routeOptimization.order.map((jobId, index) => {
                          const job = mockJobs.find(j => j.id === jobId)
                          return (
                            <div key={jobId} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <span className="text-sm font-medium">{job?.title || jobId}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium mb-2">Distance Optimization</h5>
                        <p className="text-sm text-gray-600">
                          Total distance reduced by optimizing route order based on geographic proximity.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium mb-2">Time Optimization</h5>
                        <p className="text-sm text-gray-600">
                          Travel time minimized by considering traffic patterns and job durations.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Detailed Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.timeSlots.map((slot, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{slot.job}</h4>
                            <p className="text-sm text-gray-600">{slot.client}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{slot.time}</div>
                            <div className="text-sm text-gray-600">
                              {AIUtils.formatTime(slot.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>Location details would appear here</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchedule(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Apply Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}