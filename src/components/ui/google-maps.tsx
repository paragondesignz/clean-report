"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

interface GoogleMapsProps {
  address?: string
  latitude?: number
  longitude?: number
  title?: string
  height?: string
  showDirections?: boolean
  className?: string
}

export function GoogleMaps({ 
  address, 
  latitude, 
  longitude, 
  title = "Location",
  height = "400px",
  showDirections = true,
  className = ""
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.')
          setLoading(false)
          return
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        })

        const google = await loader.load()
        
        if (!mapRef.current) return

        // Default to Auckland, New Zealand if no coordinates provided
        const defaultPosition = { lat: -36.8485, lng: 174.7633 }
        
        let mapPosition = defaultPosition
        const mapAddress = address

        // If we have coordinates, use them
        if (latitude && longitude) {
          mapPosition = { lat: latitude, lng: longitude }
        } else if (address) {
          // Geocode the address
          const geocoder = new google.maps.Geocoder()
          try {
            const result = await geocoder.geocode({ address })
            if (result.results[0]) {
              const location = result.results[0].geometry.location
              mapPosition = { lat: location.lat(), lng: location.lng() }
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed, using default position:', geocodeError)
          }
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: mapPosition,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        // Add marker
        const markerInstance = new google.maps.Marker({
          position: mapPosition,
          map: mapInstance,
          title: title,
          animation: google.maps.Animation.DROP
        })

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600;">${title}</h3>
              ${mapAddress ? `<p style="margin: 0; color: #666;">${mapAddress}</p>` : ''}
            </div>
          `
        })

        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance)
        })

        setMap(mapInstance)
        setMarker(markerInstance)
        setLoading(false)

      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load map')
        setLoading(false)
      }
    }

    initMap()
  }, [address, latitude, longitude, title])

  const openInGoogleMaps = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
    } else if (address) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank')
    }
  }

  const getDirections = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
    } else if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center max-w-sm">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-medium mb-2">Unable to load map</p>
              {error.includes('API key') ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Google Maps API key is missing.</p>
                  <p className="text-xs">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{error}</p>
              )}
              {address && (
                <p className="text-sm text-muted-foreground mt-2">{address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {showDirections && (
              <Button
                variant="outline"
                size="sm"
                onClick={getDirections}
                className="flex items-center gap-1"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          </div>
        </div>
        {address && (
          <p className="text-sm text-muted-foreground mt-1">{address}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="rounded-b-lg"
        />
      </CardContent>
    </Card>
  )
}
