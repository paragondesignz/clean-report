"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { createJob, getClients } from "@/lib/supabase-client"
import type { Client } from "@/types/database"

export default function NewJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    agreed_hours: ""
  })

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      })
    }
  }, [toast])

  useEffect(() => {
    fetchClients()
    // Pre-fill client if passed in URL params
    const clientId = searchParams.get('client')
    if (clientId) {
      setFormData(prev => ({ ...prev, client_id: clientId }))
    }
  }, [searchParams, fetchClients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createJob(formData)
      toast({
        title: "Success",
        description: "Job created successfully"
      })
      router.push("/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Job</h1>
            <p className="text-slate-600">Schedule a new cleaning job</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>
            Fill in the details below to schedule a new cleaning job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Regular Cleaning, Deep Clean"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the cleaning requirements (optional)"
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Scheduled Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Scheduled Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="agreed_hours">Agreed Hours (Optional)</Label>
                <Input
                  id="agreed_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.agreed_hours}
                  onChange={(e) => setFormData({ ...formData, agreed_hours: e.target.value })}
                  placeholder="e.g., 2.5"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/jobs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 