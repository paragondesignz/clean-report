"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getSupplies, createSupply, updateSupply, deleteSupply } from "@/lib/supabase-client"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import type { Supply } from "@/types/database"

export default function SuppliesPage() {
  const { toast } = useToast()
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    current_stock: 0,
    low_stock_threshold: 0,
    unit: ""
  })

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSupplies()
      setSupplies(data || [])
    } catch (error) {
      console.error('Error fetching supplies:', error)
      toast({
        title: "Error",
        description: "Failed to load supplies",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSupplies()
  }, [fetchSupplies])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSupply) {
        await updateSupply(editingSupply.id, formData)
        toast({
          title: "Success",
          description: "Supply updated successfully"
        })
      } else {
        await createSupply(formData)
        toast({
          title: "Success",
          description: "Supply created successfully"
        })
      }
      
      setIsCreateDialogOpen(false)
      setEditingSupply(null)
      resetForm()
      fetchSupplies()
    } catch (error) {
      console.error('Error saving supply:', error)
      toast({
        title: "Error",
        description: "Failed to save supply",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (supplyId: string) => {
    if (!confirm("Are you sure you want to delete this supply?")) return
    
    try {
      await deleteSupply(supplyId)
      toast({
        title: "Success",
        description: "Supply deleted successfully"
      })
      fetchSupplies()
    } catch (error) {
      console.error('Error deleting supply:', error)
      toast({
        title: "Error",
        description: "Failed to delete supply",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply)
    setFormData({
      name: supply.name,
      description: supply.description || "",
      current_stock: supply.current_stock,
      low_stock_threshold: supply.low_stock_threshold,
      unit: supply.unit
    })
    setIsCreateDialogOpen(true)
  }

  const handleStockAdjustment = async (supply: Supply, adjustment: number) => {
    try {
      const newStock = Math.max(0, supply.current_stock + adjustment)
      await updateSupply(supply.id, { current_stock: newStock })
      toast({
        title: "Success",
        description: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`
      })
      fetchSupplies()
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      current_stock: 0,
      low_stock_threshold: 0,
      unit: ""
    })
  }

  const getStockStatus = (supply: Supply) => {
    if (supply.current_stock === 0) return 'Out of Stock'
    if (supply.current_stock <= supply.low_stock_threshold) return 'Low Stock'
    return 'In Stock'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Out of Stock': return 'bg-red-100 text-red-800'
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
      case 'In Stock': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockIcon = (supply: Supply) => {
    if (supply.current_stock === 0) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (supply.current_stock <= supply.low_stock_threshold) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <Package className="h-4 w-4 text-green-600" />
  }

  const stats = {
    total: supplies.length,
    lowStock: supplies.filter(supply => supply.current_stock <= supply.low_stock_threshold).length,
    outOfStock: supplies.filter(supply => supply.current_stock === 0).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading supplies...</p>
        </div>
      </div>
    )
  }

  // Prepare data for DataTable
  const tableData = supplies.map(supply => ({
    id: supply.id,
    name: supply.name,
    description: supply.description || '',
    currentStock: supply.current_stock,
    unit: supply.unit,
    lowStockThreshold: supply.low_stock_threshold,
    status: getStockStatus(supply),
    stockDisplay: `${supply.current_stock} ${supply.unit}`,
    thresholdDisplay: `${supply.low_stock_threshold} ${supply.unit}`,
    stockIcon: getStockIcon(supply),
    supply: supply
  }))

  // Define columns for DataTable
  const columns = [
    {
      key: 'name',
      label: 'Supply',
      sortable: true,
      width: '300px',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md flex-shrink-0">
            {row.stockIcon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{value}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'stockDisplay',
      label: 'Current Stock',
      sortable: true,
      width: '140px',
      render: (value: string, row: any) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">Available</div>
        </div>
      )
    },
    {
      key: 'thresholdDisplay',
      label: 'Low Stock Alert',
      sortable: true,
      width: '140px',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-muted-foreground text-xs">Threshold</div>
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
    }
  ]


  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <DataTable
        title="Supplies"
        description="Manage your cleaning supplies and inventory"
        data={tableData}
        columns={columns}
        addButton={{
          label: "Add Supply",
          icon: Plus,
          onClick: () => {
            setEditingSupply(null)
            resetForm()
            setIsCreateDialogOpen(true)
          }
        }}
        onDelete={handleDelete}
        searchPlaceholder="Search supplies by name, description, or unit..."
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'In Stock', label: 'In Stock' },
            { value: 'Low Stock', label: 'Low Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' }
          ]}
        ]}
        customActions={[
          {
            label: 'Edit',
            icon: Edit,
            onClick: (row) => handleEdit(row.supply)
          },
          {
            label: 'Decrease Stock',
            icon: Minus,
            onClick: (row) => handleStockAdjustment(row.supply, -1),
            show: (row) => row.currentStock > 0
          },
          {
            label: 'Increase Stock',
            icon: Plus,
            onClick: (row) => handleStockAdjustment(row.supply, 1)
          }
        ]}
      />

      {/* Add/Edit Supply Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSupply ? 'Edit Supply' : 'Add New Supply'}</DialogTitle>
              <DialogDescription>
                {editingSupply ? 'Update supply information' : 'Add a new cleaning supply to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Supply Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., All-Purpose Cleaner, Microfiber Cloths"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., bottles, packs, rolls"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                    placeholder="Alert when stock falls below this number"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupply ? 'Update' : 'Add'} Supply
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  )
} 