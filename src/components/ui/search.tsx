"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, User, FileText, File, Clock } from "lucide-react"
import { Input } from "./input"
import { searchAll, SearchResult } from "@/lib/search-service"
import { cn } from "@/lib/utils"

interface SearchComponentProps {
  className?: string
}

export function SearchComponent({ className }: SearchComponentProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchAll(searchQuery)
      setResults(response.results)
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            window.location.href = results[selectedIndex].url
          }
          break
        case 'Escape':
          setShowResults(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, results, selectedIndex])

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <User className="w-4 h-4" />
      case 'job':
        return <FileText className="w-4 h-4" />
      case 'report':
        return <File className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'Client'
      case 'job':
        return 'Job'
      case 'report':
        return 'Report'
      default:
        return ''
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search clients, jobs, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            className="pl-10 pr-4 w-full"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  className={cn(
                    "flex items-start px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                    selectedIndex === index && "bg-blue-50"
                  )}
                  onClick={() => {
                    setShowResults(false)
                    setQuery("")
                  }}
                >
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      result.type === 'client' && "bg-blue-100 text-blue-600",
                      result.type === 'job' && "bg-green-100 text-green-600",
                      result.type === 'report' && "bg-purple-100 text-purple-600"
                    )}>
                      {getIcon(result.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </h4>
                      <span className={cn(
                        "ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0",
                        result.type === 'client' && "bg-blue-100 text-blue-700",
                        result.type === 'job' && "bg-green-100 text-green-700",
                        result.type === 'report' && "bg-purple-100 text-purple-700"
                      )}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {result.subtitle}
                    </p>
                    {result.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {result.description}
                      </p>
                    )}
                    {result.date && (
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(result.date)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for client names, job titles, or descriptions</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}