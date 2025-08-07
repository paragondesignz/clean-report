"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

export function GoogleMapsDebug() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'present' | 'missing'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (apiKey && apiKey.trim() !== '') {
      setApiKeyStatus('present')
    } else {
      setApiKeyStatus('missing')
      setError('Google Maps API key is not configured')
    }
  }, [])

  const getStatusIcon = () => {
    switch (apiKeyStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      case 'present':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'missing':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
    }
  }

  const getStatusText = () => {
    switch (apiKeyStatus) {
      case 'checking':
        return 'Checking API key...'
      case 'present':
        return 'API key is configured'
      case 'missing':
        return 'API key is missing'
    }
  }

  const getStatusColor = () => {
    switch (apiKeyStatus) {
      case 'checking':
        return 'text-blue-600'
      case 'present':
        return 'text-green-600'
      case 'missing':
        return 'text-red-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Google Maps Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {apiKeyStatus === 'missing' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-red-800">Setup Required</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>Enable Maps JavaScript API, Geocoding API, and Directions API</li>
                <li>Add the API key to your <code className="bg-red-100 px-1 rounded">.env.local</code> file:</li>
              </ol>
              <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
              </div>
              <p>Restart your development server after adding the API key.</p>
            </div>
          </div>
        )}

        {apiKeyStatus === 'present' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ Google Maps is ready!</h4>
            <p className="text-sm text-green-700">
              Your API key is configured. Maps should load properly in job details and location displays.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Google Cloud Console
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
