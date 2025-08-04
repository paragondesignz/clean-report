"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, Mail, Phone, Eye, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { getBookingRequests, updateBookingRequest } from "@/lib/supabase-client"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import type { BookingRequest } from "@/types/database"

export default function BookingRequestsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])

  useEffect(() => {
    fetchBookingRequests()
  }, [])

  const fetchBookingRequests = async () => {
    try {
      const data = await getBookingRequests()
      setBookingRequests(data)
    } catch (error) {
      console.error('Error fetching booking requests:', error)
      toast({
        title: "Error",
        description: "Failed to load booking requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'rejected' | 'cancelled') => {
    try {
      await updateBookingRequest(id, status)
      toast({
        title: "Status updated",
        description: `Booking request ${status} successfully.`,
      })
      fetchBookingRequests() // Refresh the list
    } catch (error) {
      console.error('Error updating booking request:', error)
      toast({
        title: "Error",
        description: "Failed to update booking request status.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatServiceTypes = (serviceType: string) => {
    const serviceMap: Record<string, string> = {
      'general_cleaning': 'General Cleaning',
      'deep_cleaning': 'Deep Cleaning',
      'kitchen_cleaning': 'Kitchen Cleaning',
      'bathroom_cleaning': 'Bathroom Cleaning',
      'carpet_cleaning': 'Carpet Cleaning',
      'window_cleaning': 'Window Cleaning',
      'move_in_out': 'Move In/Out Cleaning'
    }
    return serviceMap[serviceType] || serviceType
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading booking requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
          <p className="text-slate-600">Manage incoming booking requests from your portal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{bookingRequests.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookingRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookingRequests.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {bookingRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Requests List */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <CardDescription>
            Review and manage incoming booking requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No booking requests yet</h3>
              <p className="text-slate-600">When customers submit booking requests through your portal, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{request.client_name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {request.client_email}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {request.client_phone}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(request.requested_date)}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(request.requested_time)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-1">Service Requested:</p>
                        <p className="text-sm text-slate-600">{formatServiceTypes(request.service_type)}</p>
                      </div>
                      
                      {request.description && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-slate-700 mb-1">Additional Details:</p>
                          <p className="text-sm text-slate-600">{request.description}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-500">
                        Submitted: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Link href={`/jobs?booking=${request.booking_token}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Job
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 