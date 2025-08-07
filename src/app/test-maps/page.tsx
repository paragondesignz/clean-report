"use client"

import { GoogleMaps } from "@/components/ui/google-maps"
import { GoogleMapsDebug } from "@/components/ui/google-maps-debug"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestMapsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Maps Test</h1>
        <p className="text-muted-foreground">
          Testing Google Maps integration with the provided API key.
        </p>
      </div>

      {/* Debug Component */}
      <GoogleMapsDebug />

      {/* Test Maps */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Map 1 - Auckland, NZ</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMaps
              address="Auckland, New Zealand"
              title="Auckland Test"
              height="300px"
              showDirections={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Map 2 - Coordinates</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMaps
              latitude={-36.8485}
              longitude={174.7633}
              title="Auckland Coordinates"
              height="300px"
              showDirections={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Map 3 - Sydney, Australia</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMaps
              address="Sydney, Australia"
              title="Sydney Test"
              height="300px"
              showDirections={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Map 4 - London, UK</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMaps
              address="London, United Kingdom"
              title="London Test"
              height="300px"
              showDirections={true}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">API Key Present:</span>
              <span className={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">API Key Length:</span>
              <span className="font-mono text-sm">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length || 0} characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">API Key Preview:</span>
              <span className="font-mono text-sm">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 
                  `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 
                  "Not set"
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
