"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Plus,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}


interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface CustomAction {
  label: string
  icon: any
  onClick: (row: any) => void
  show?: (row: any) => boolean
  variant?: 'default' | 'outline' | 'ghost'
}

interface DataTableProps {
  title: string
  description?: string
  columns: Column[]
  data: any[]
  addButton?: {
    href?: string
    label: string
    icon: any
    onClick?: () => void
  }
  onRowClick?: (row: any) => string | void
  onDelete?: (id: string) => void
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  customActions?: CustomAction[]
}

export function DataTable({
  title,
  description,
  columns,
  data,
  addButton,
  onRowClick,
  onDelete,
  searchPlaceholder = "Search...",
  filterOptions = [],
  customActions = []
}: DataTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(row => String(row[key]) === value)
      }
    })

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, filters, sortColumn, sortDirection])

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      const result = onRowClick(row)
      if (typeof result === 'string') {
        router.push(result)
      }
    }
  }

  const handleAddClick = () => {
    if (addButton?.onClick) {
      addButton.onClick()
    } else if (addButton?.href) {
      router.push(addButton.href)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{description}</p>
          )}
        </div>
        {addButton && (
          <Button onClick={handleAddClick} className="w-full sm:w-auto">
            <addButton.icon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{addButton.label}</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>


      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {filterOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <Select
                key={filter.key}
                value={filters[filter.key] || "all"}
                onValueChange={(value) => setFilters(prev => ({ ...prev, [filter.key]: value }))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="crm-card">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:text-foreground' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
                {(customActions.length > 0 || onDelete) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ width: '100px' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`hover:bg-muted/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4" style={{ width: column.width }}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {(customActions.length > 0 || onDelete) && (
                    <td className="px-4 py-4" style={{ width: '100px' }}>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {customActions.map((action, index) => {
                          if (action.show && !action.show(row)) return null
                          return (
                            <Button
                              key={index}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={() => action.onClick(row)}
                            >
                              <action.icon className="h-4 w-4" />
                            </Button>
                          )
                        })}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredAndSortedData.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`crm-card p-4 space-y-3 ${
                onRowClick ? 'cursor-pointer hover:shadow-md' : ''
              }`}
              onClick={() => handleRowClick(row)}
            >
              {columns.slice(0, 2).map((column) => (
                <div key={column.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {column.label}
                  </span>
                  <div className="text-sm">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              ))}
              
              {/* Additional info in collapsible section */}
              {columns.length > 2 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Show more details
                  </summary>
                  <div className="mt-3 space-y-2 pt-3 border-t">
                    {columns.slice(2).map((column) => (
                      <div key={column.key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {column.label}
                        </span>
                        <div className="text-sm">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Actions */}
              {(customActions.length > 0 || onDelete) && (
                <div className="flex items-center justify-end space-x-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  {customActions.map((action, index) => {
                    if (action.show && !action.show(row)) return null
                    return (
                      <Button
                        key={index}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={() => action.onClick(row)}
                      >
                        <action.icon className="h-4 w-4" />
                      </Button>
                    )
                  })}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data found</p>
          </div>
        )}
      </div>
    </div>
  )
} 