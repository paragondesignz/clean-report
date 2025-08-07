"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTierAccess } from "@/lib/tier-access"
import { FeatureUpgradePrompt } from "@/lib/tier-access"
import { QuoteGenerator } from "@/components/ai/quote-generator"
import { SmartScheduler } from "@/components/smart-scheduling/smart-scheduler"
import { PhotoAnalysis } from "@/components/ai/photo-analysis"
import { Sparkles, FileText, Calendar, Camera } from "lucide-react"

export default function AIToolsPage() {
  const { access, userRole } = useTierAccess()

  // Sub contractors shouldn't see this page at all
  if (userRole === 'sub_contractor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Tools</h1>
          <p className="text-muted-foreground">
            Access denied. AI tools are only available to administrators.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600">
              AI tools are only available to account administrators. 
              Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Free users see upgrade prompts
  if (!access.aiFeatures) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Tools</h1>
          <p className="text-muted-foreground">
            Upgrade to Pro to unlock AI-powered features that will transform your cleaning business.
          </p>
        </div>

        <div className="grid gap-6">
          <FeatureUpgradePrompt
            feature="aiFeatures"
            title="AI Quote Generator"
            description="Automatically generate professional quotes from photos using AI analysis."
          />
          
          <FeatureUpgradePrompt
            feature="aiFeatures"
            title="Smart Scheduling"
            description="AI-powered scheduling optimization for efficient route planning."
          />
          
          <FeatureUpgradePrompt
            feature="aiFeatures"
            title="Photo Analysis"
            description="Before/after photo analysis with detailed cleaning reports."
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Why Upgrade to Pro?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">AI Quote Generation</h4>
                <p className="text-sm text-gray-600">
                  Generate professional quotes instantly from photos
                </p>
              </div>
              <div className="text-center p-4">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Smart Scheduling</h4>
                <p className="text-sm text-gray-600">
                  Optimize routes and schedules with AI
                </p>
              </div>
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Photo Analysis</h4>
                <p className="text-sm text-gray-600">
                  Professional before/after reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pro users see the full AI tools
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Tools</h1>
        <p className="text-muted-foreground">
          Leverage AI to streamline your cleaning business operations.
        </p>
      </div>

      <Tabs defaultValue="quote-generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quote-generator">Quote Generator</TabsTrigger>
          <TabsTrigger value="smart-scheduler">Smart Scheduler</TabsTrigger>
          <TabsTrigger value="photo-analysis">Photo Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="quote-generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                AI Quote Generator
              </CardTitle>
              <CardDescription>
                Upload photos of spaces to generate professional cleaning quotes using AI analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Smart Scheduler
              </CardTitle>
              <CardDescription>
                Optimize your cleaning schedule with AI-powered route planning and time management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartScheduler />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photo Analysis
              </CardTitle>
              <CardDescription>
                Analyze before and after photos to generate detailed cleaning reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coming Soon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            More AI-powered features are in development to help scale your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">AI Customer Service</h4>
              <p className="text-sm text-gray-600">
                Automated customer support and booking management
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Predictive Maintenance</h4>
              <p className="text-sm text-gray-600">
                AI-powered equipment and supply management
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Voice Commands</h4>
              <p className="text-sm text-gray-600">
                Hands-free job management with voice recognition
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Smart Inventory</h4>
              <p className="text-sm text-gray-600">
                Automatic supply tracking and reordering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 