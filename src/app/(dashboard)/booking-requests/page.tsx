"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"
import { getBookingRequests, updateBookingRequest, getServiceTypes } from "@/lib/supabase-client"
import { formatTime, formatListDate } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import type { BookingRequest } from "@/types/database"

// Table row interface for booking requests
interface BookingRequestTableRow {
  id: string
  title: string
  email: string
  phone: string
  status: string
  requestedDate: string
  requestedTime: string
  serviceType: string
  value: string
  lastUpdated: string
  description?: string
  bookingToken: string
  createdAt: string
}

export default function BookingRequestsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string, name: string }>>([])

  const fetchBookingRequests = useCallback(async () => {
    try {
      const [bookingData, serviceTypesData] = await Promise.all([
        getBookingRequests(),
        getServiceTypes()
      ])
      setBookingRequests(bookingData)
      setServiceTypes(serviceTypesData || [])
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
  }, [toast])

  useEffect(() => {
    fetchBookingRequests()
  }, [fetchBookingRequests])

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
    // First try to find the service type in the dynamic list
    const foundServiceType = serviceTypes.find(st => st.id === serviceType)
    if (foundServiceType) {
      return foundServiceType.name
    }
    
    // Fallback to hardcoded mapping for backward compatibility
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

  const getBookingIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getBookingValue = (request: BookingRequest) => {
    // Mock value calculation - in real app this would come from service pricing
    return `$${(Math.random() * 200 + 50).toFixed(0)}`
  }

  const getLastUpdated = (request: BookingRequest) => {
    // Mock last updated - in real app this would be actual timestamp
    const days = Math.floor(Math.random() * 7)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading booking requests...</p>
        </div>
      </div>
    )
  }

  // Prepare data for DataTable
  const tableData = bookingRequests.map(request => ({
    id: request.id,
    title: request.client_name,
    email: request.client_email,
    phone: request.client_phone,
    status: request.status,
    requestedDate: formatListDate(request.requested_date),
    requestedTime: formatTime(request.requested_time),
    serviceType: formatServiceTypes(request.service_type),
    value: getBookingValue(request),
    lastUpdated: getLastUpdated(request),
    description: request.description,
    bookingToken: request.booking_token,
    createdAt: request.created_at
  }))

  // Define columns for DataTable
  const columns = [
    {
      key: 'title',
      label: 'Booking Request',
      sortable: true,
      width: '300px',
      render: (value: string, row: BookingRequestTableRow) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md flex-shrink-0">
            {getBookingIcon(row.status)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      sortable: true,
      width: '160px',
      render: (value: string, row: BookingRequestTableRow) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{value || 'No phone'}</div>
          <div className="text-xs text-muted-foreground truncate">{row.serviceType}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <Badge className={getStatusColor(value)} variant="outline">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'requestedDate',
      label: 'Requested',
      sortable: true,
      width: '120px',
      render: (value: string, row: BookingRequestTableRow) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">{row.requestedTime}</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Est. Value',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-green-600">{value}</span>
        </div>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {value}
        </div>
      )
    }
  ]


  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{bookingRequests.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookingRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookingRequests.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {bookingRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <DataTable
        title="Booking Requests"
        description="Manage incoming booking requests from your portal"
        data={tableData}
        columns={columns}
        onRowClick={(row) => `/jobs?booking=${row.bookingToken}`}
        searchPlaceholder="Search requests by client name, email, or service type..."
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'cancelled', label: 'Cancelled' }
          ]},
          { key: 'serviceType', label: 'Service Type', options: serviceTypes.map(st => ({
            value: st.id,
            label: st.name
          }))}
        ]}
        customActions={[
          {
            label: 'Confirm',
            icon: CheckCircle,
            onClick: (row) => handleStatusUpdate(row.id, 'confirmed'),
            show: (row) => row.status === 'pending',
            variant: 'default'
          },
          {
            label: 'Reject',
            icon: XCircle,
            onClick: (row) => handleStatusUpdate(row.id, 'rejected'),
            show: (row) => row.status === 'pending',
            variant: 'outline'
          }
        ]}
      />
    </div>
  )
} 