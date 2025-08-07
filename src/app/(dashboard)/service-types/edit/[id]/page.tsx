"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { getServiceTypes, updateServiceType } from "@/lib/supabase-client"
import type { ServiceType } from "@/types/database"
import Link from "next/link"

export default function EditServiceTypePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    const fetchServiceType = async () => {
      try {
        setLoading(true)
        const serviceTypes = await getServiceTypes()
        const foundServiceType = serviceTypes?.find(st => st.id === params.id)
        
        if (!foundServiceType) {
          toast({
            title: "Error",
            description: "Service type not found",
            variant: "destructive"
          })
          router.push('/service-types')
          return
        }

        setServiceType(foundServiceType)
        setFormData({
          name: foundServiceType.name,
          description: foundServiceType.description || ""
        })
      } catch (error) {
        console.error('Error fetching service type:', error)
        toast({
          title: "Error",
          description: "Failed to load service type",
          variant: "destructive"
        })
        router.push('/service-types')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchServiceType()
    }
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceType || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      console.log('Updating service type with data:', formData)
      await updateServiceType(serviceType.id, formData)
      
      toast({
        title: "Success",
        description: "Service type updated successfully"
      })
      
      router.push('/service-types')
    } catch (error) {
      console.error('Error updating service type:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service type",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !serviceType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading service type...</p>
        </div>
      </div>
    )
  }

  if (!serviceType) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/service-types">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Service Types
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Service Type</h1>
            <p className="text-slate-600">Update service type details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Service Type Details</CardTitle>
          <CardDescription>
            Update the service type information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Regular Cleaning, Deep Cleaning, Move-in/Move-out"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this service includes, duration, and any special requirements..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/service-types">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Service Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 