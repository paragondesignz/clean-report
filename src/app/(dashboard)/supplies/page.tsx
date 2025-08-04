"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { getSupplies, createSupply, updateSupply, deleteSupply } from "@/lib/supabase-client"
import type { Supply } from "@/types/database"

export default function SuppliesPage() {
  const { toast } = useToast()
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    current_stock: 0,
    low_stock_threshold: 0,
    unit: ""
  })

  useEffect(() => {
    fetchSupplies()
  }, [])

  const fetchSupplies = async () => {
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
  }

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

  const filteredSupplies = supplies.filter(supply =>
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.unit.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplies</h1>
          <p className="text-gray-600">Manage your cleaning supplies and inventory</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSupply(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supply
            </Button>
          </DialogTrigger>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search supplies by name, description, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Supplies Grid */}
      {filteredSupplies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No supplies found' : 'No supplies yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first cleaning supply'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Supply
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupplies.map((supply) => {
            const isLowStock = supply.current_stock <= supply.low_stock_threshold
            const isOutOfStock = supply.current_stock === 0
            
            return (
              <Card key={supply.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className={`h-5 w-5 ${
                        isOutOfStock ? 'text-red-600' : 
                        isLowStock ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                      <CardTitle className="text-lg">{supply.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(supply)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(supply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supply.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{supply.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className={`font-medium ${
                        isOutOfStock ? 'text-red-600' : 
                        isLowStock ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {supply.current_stock} {supply.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Low Stock Alert:</span>
                      <span className="text-gray-900">{supply.low_stock_threshold} {supply.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockAdjustment(supply, -1)}
                        disabled={supply.current_stock === 0}
                      >
                        <TrendingDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockAdjustment(supply, 1)}
                      >
                        <TrendingUp className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOutOfStock 
                        ? 'text-red-600 bg-red-100' 
                        : isLowStock 
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-green-600 bg-green-100'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 