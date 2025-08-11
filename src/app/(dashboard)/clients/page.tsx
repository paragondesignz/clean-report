"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, User, Mail, Phone, MapPin } from "lucide-react"
import { getClients, deleteClientRecord, getJobs } from "@/lib/supabase-client"
import { DataTable } from "@/components/ui/data-table"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradePrompt } from "@/components/ui/upgrade-prompt"
import type { Client } from "@/types/database"

export default function ClientsPage() {
  const { toast } = useToast()
  const { canCreateResource, getUpgradeMessage, isPro } = useSubscription()
  const [clients, setClients] = useState<Client[]>([])
  const [clientStats, setClientStats] = useState<Record<string, { totalJobs: number; completedJobs: number; upcomingJobs: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const [clientsData, jobsData] = await Promise.all([
        getClients(),
        getJobs()
      ])
      
      setClients(clientsData || [])
      
      // Calculate client statistics
      if (jobsData) {
        const stats: Record<string, { totalJobs: number; completedJobs: number; upcomingJobs: number }> = {}
        
        jobsData.forEach(job => {
          if (job.client_id) {
            if (!stats[job.client_id]) {
              stats[job.client_id] = { totalJobs: 0, completedJobs: 0, upcomingJobs: 0 }
            }
            
            stats[job.client_id].totalJobs++
            
            if (job.status === 'completed') {
              stats[job.client_id].completedJobs++
            } else if (['scheduled', 'in_progress'].includes(job.status)) {
              stats[job.client_id].upcomingJobs++
            }
          }
        })
        
        setClientStats(stats)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    
    try {
      await deleteClientRecord(clientId)
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  const getClientStatus = (client: Client) => {
    const stats = clientStats[client.id]
    if (!stats) return 'New'
    if (stats.completedJobs > 0) return 'Active'
    if (stats.upcomingJobs > 0) return 'Prospect'
    return 'Inactive'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Prospect': return 'bg-yellow-100 text-yellow-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getClientIcon = (client: Client) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    const color = colors[client.name.length % colors.length]
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} text-white text-sm font-medium`}>
        {client.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  const formatLastInteraction = (client: Client) => {
    // Mock data - in real app this would come from actual interaction data
    const interactions = ['About 2 hours ago', '2 days ago', '1 week ago', '1 month ago']
    return interactions[client.name.length % interactions.length]
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    )
  }

  const tableData = clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    status: getClientStatus(client),
    lastInteraction: formatLastInteraction(client),
    totalJobs: clientStats[client.id]?.totalJobs || 0,
    completedJobs: clientStats[client.id]?.completedJobs || 0,
    upcomingJobs: clientStats[client.id]?.upcomingJobs || 0,
    jobStats: `${clientStats[client.id]?.completedJobs || 0}/${clientStats[client.id]?.totalJobs || 0}`,
    clientIcon: getClientIcon(client)
  }))

  const columns = [
    {
      key: 'name',
      label: 'Client',
      sortable: true,
      width: '300px',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex-shrink-0">
            {row.clientIcon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {row.email || 'No email'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      sortable: true,
      width: '160px',
      render: (value: string, row: Client) => (
        <div className="min-w-0">
          <p className="text-sm font-medium flex items-center">
            <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
            {value || 'No phone'}
          </p>
          <p className="text-xs text-muted-foreground truncate flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {row.address?.split(',')[0] || 'No address'}
          </p>
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
          {value}
        </Badge>
      )
    },
    {
      key: 'jobStats',
      label: 'Jobs',
      sortable: true,
      width: '100px',
      render: (value: string, row: Client) => (
        <div className="text-sm">
          <div className="font-medium text-green-600">{value}</div>
          <div className="text-muted-foreground text-xs">Completed/Total</div>
        </div>
      )
    },
    {
      key: 'upcomingJobs',
      label: 'Upcoming',
      sortable: true,
      width: '100px',
      render: (value: number) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">Jobs</div>
        </div>
      )
    },
    {
      key: 'lastInteraction',
      label: 'Last Contact',
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
    <>
      <DataTable
        title="Clients"
        description="Manage your client relationships"
        columns={columns}
        data={tableData}
        addButton={{
          href: canCreateResource('maxClients', clients.length) ? "/clients/new" : undefined,
          label: "Add Client",
          icon: Plus,
          onClick: canCreateResource('maxClients', clients.length) ? undefined : () => {
            setShowUpgradePrompt(true)
          }
        }}
        onRowClick={(row) => `/clients/${row.id}`}
        onDelete={handleDelete}
        searchPlaceholder="Search clients by name, email, or company..."
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'Active', label: 'Active' },
            { value: 'Prospect', label: 'Prospect' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'New', label: 'New' }
          ]}
        ]}
      />
      
      <UpgradePrompt
        title="Upgrade to Pro"
        description={getUpgradeMessage('clients')}
        resourceType="clients"
        currentCount={clients.length}
        maxCount={5}
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
      />
    </>
  )
} 