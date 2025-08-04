"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, Mail, Phone, Globe } from "lucide-react"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { getUserProfile, createJobFromBookingRequest } from "@/lib/supabase-client"
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/email-service"
import type { UserProfile } from "@/types/database"

export default function BookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [bookingData, setBookingData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    requested_date: "",
    requested_time: "",
    service_types: [] as string[],
    description: ""
  })

  // Available service types
  const serviceTypes = [
    { value: "general_cleaning", label: "General Cleaning" },
    { value: "deep_cleaning", label: "Deep Cleaning" },
    { value: "kitchen_cleaning", label: "Kitchen Cleaning" },
    { value: "bathroom_cleaning", label: "Bathroom Cleaning" },
    { value: "carpet_cleaning", label: "Carpet Cleaning" },
    { value: "window_cleaning", label: "Window Cleaning" },
    { value: "move_in_out", label: "Move In/Out Cleaning" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Fetch booking token details and available slots from Supabase
        // For now, using default time slots
        const defaultSlots = [
          "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
        ]
        setAvailableSlots(defaultSlots)
        
        // Fetch user profile for contact information
        try {
          const profile = await getUserProfile()
          setUserProfile(profile)
        } catch (error) {
          console.log("No user profile found, using default contact info")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [token])

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    setBookingData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, serviceType]
        : prev.service_types.filter(type => type !== serviceType)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Generate a unique booking token
      const bookingToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Create job from booking request
      const result = await createJobFromBookingRequest({
        ...bookingData,
        booking_token: bookingToken
      })
      
      // Send notification email to business owner
      if (userProfile) {
        await sendBookingNotification({
          userProfile,
          bookingData,
          bookingToken
        })
      }
      
      // Send confirmation email to customer
      if (userProfile) {
        await sendBookingConfirmation({
          userProfile,
          bookingData,
          bookingToken,
          jobId: result.job.id
        })
      }
      
      toast({
        title: "Booking submitted!",
        description: "Your booking request has been sent. We'll confirm shortly.",
      })
      
      // Reset form
      setBookingData({
        client_name: "",
        client_email: "",
        client_phone: "",
        requested_date: "",
        requested_time: "",
        service_types: [],
        description: ""
      })
    } catch (error) {
      console.error('Error submitting booking:', error)
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Book Your Cleaning</h1>
          </div>
          <p className="text-gray-600">Schedule your professional cleaning service</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Request</CardTitle>
            <CardDescription>
              Fill out the form below to request a cleaning appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Full Name</Label>
                    <Input
                      id="client_name"
                      value={bookingData.client_name}
                      onChange={(e) => setBookingData({ ...bookingData, client_name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={bookingData.client_email}
                      onChange={(e) => setBookingData({ ...bookingData, client_email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Phone Number</Label>
                  <Input
                    id="client_phone"
                    value={bookingData.client_phone}
                    onChange={(e) => setBookingData({ ...bookingData, client_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Service Details
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Service Types</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serviceTypes.map((service) => (
                        <div key={service.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.value}
                            checked={bookingData.service_types.includes(service.value)}
                            onCheckedChange={(checked) => 
                              handleServiceTypeChange(service.value, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={service.value}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preferred Date & Time</Label>
                    <DateTimePicker
                      selectedDate={bookingData.requested_date}
                      selectedTime={bookingData.requested_time}
                      onDateChange={(date) => setBookingData({ ...bookingData, requested_date: date })}
                      onTimeChange={(time) => setBookingData({ ...bookingData, requested_time: time })}
                      availableSlots={availableSlots}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      value={bookingData.description}
                      onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Request Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Contact us directly for immediate assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userProfile?.contact_phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="text-sm text-slate-600">{userProfile.contact_phone}</span>
                </div>
              )}
              {userProfile?.contact_email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="text-sm text-slate-600">{userProfile.contact_email}</span>
                </div>
              )}
              {userProfile?.website_url && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-slate-500" />
                  <a 
                    href={userProfile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
                  >
                    {userProfile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-slate-500" />
                <span className="text-sm text-slate-600">Mon-Fri 8AM-6PM, Sat 9AM-4PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 