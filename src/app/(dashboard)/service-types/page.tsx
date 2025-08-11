"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Wrench, CheckCircle, XCircle } from "lucide-react"
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType, testServiceTypesTable, checkRequiredTables } from "@/lib/supabase-client"
import type { ServiceType } from "@/types/database"

export default function ServiceTypesPage() {
  const { toast } = useToast()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const fetchServiceTypes = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables')
      }
      
      // Test service types table
      console.log('Testing service types table...')
      const tableTest = await testServiceTypesTable()
      console.log('Service types table test result:', tableTest)
      
      if (!tableTest.success) {
        throw new Error(`Service types table not accessible: ${tableTest.error}`)
      }
      
      console.log('Fetching service types...')
      const data = await getServiceTypes()
      console.log('Service types fetched:', data?.length || 0, 'items')
      setServiceTypes(data || [])
    } catch (error) {
      console.error('Error fetching service types:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load service types",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchServiceTypes()
  }, [fetchServiceTypes])





  const handleDelete = async (serviceTypeId: string) => {
    if (!confirm("Are you sure you want to delete this service type?")) return
    
    try {
      await deleteServiceType(serviceTypeId)
      toast({
        title: "Success",
        description: "Service type deleted successfully"
      })
      fetchServiceTypes()
    } catch (error) {
      console.error('Error deleting service type:', error)
      toast({
        title: "Error",
        description: "Failed to delete service type",
        variant: "destructive"
      })
    }
  }



  const handleToggleActive = async (serviceType: ServiceType) => {
    try {
      // TODO: updateServiceType doesn't support is_active field
      // Need to implement proper toggle endpoint
      throw new Error('Toggle functionality not implemented')
      toast({
        title: "Success",
        description: `Service type toggle functionality not implemented`
      })
      fetchServiceTypes()
    } catch (error) {
      console.error('Error toggling service type:', error)
      toast({
        title: "Error",
        description: "Failed to update service type",
        variant: "destructive"
      })
    }
  }



  const filteredServiceTypes = serviceTypes.filter(serviceType =>
    serviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (serviceType.description && serviceType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading service types...</p>
        </div>
      </div>
    )
  }

  // Show setup instructions if no service types and no error
  if (serviceTypes.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Types</h1>
            <p className="text-gray-600">Manage your cleaning service types and categories</p>
          </div>
          <Link href="/service-types/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Type
            </Button>
          </Link>
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">No Service Types Found</CardTitle>
            <CardDescription>
              It looks like you haven't created any service types yet, or the database table might not be set up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Database Setup Required</h3>
              <p className="text-blue-700 text-sm mb-3">
                If you're getting errors creating service types, you may need to set up the database table first.
              </p>
              <div className="text-sm text-blue-600">
                <p className="mb-2">To set up the service_types table:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Run the SQL script from <code className="bg-blue-100 px-1 rounded">setup-service-types.sql</code></li>
                  <li>Refresh this page and try creating a service type again</li>
                </ol>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/service-types/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service Type
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Types</h1>
          <p className="text-gray-600">Manage your cleaning service types and categories</p>
        </div>
        <Link href="/service-types/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service Type
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search service types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Service Types Grid */}
      {filteredServiceTypes.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No service types found' : 'No service types yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first service type'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Service Type
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServiceTypes.map((serviceType) => (
            <Card key={serviceType.id} className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900">{serviceType.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    </Badge>
                    <div className="flex space-x-1">
                      <Link href={`/service-types/edit/${serviceType.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(serviceType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {serviceType.description && (
                  <p className="text-sm text-gray-600">{serviceType.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(serviceType.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(serviceType)}
                  >
                    Toggle (Not Implemented)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


    </div>
  )
} 