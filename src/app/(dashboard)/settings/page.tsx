"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  User, 
  Crown, 
  CreditCard, 
  Calendar,
  Zap,
  Smartphone
} from "lucide-react"
import { AccountSettings } from "@/components/settings/account-settings"
import { SubscriptionManagement } from "@/components/settings/subscription-management"
import { PaymentMethods } from "@/components/settings/payment-methods"
import { MobilePortalSettings } from "@/components/settings/mobile-portal-settings"
import { XeroIntegrationComponent } from "@/components/integrations/xero-integration"
import StripeIntegrationComponent from "@/components/integrations/stripe-integration"
import TwilioIntegrationComponent from "@/components/integrations/twilio-integration"
import { GoogleCalendarIntegration } from "@/components/integrations/google-calendar-integration"
import { IntegrationErrorBoundary } from "@/components/integrations/integration-error-boundary"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("account")

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, subscription, and integrations.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        {/* Subscription Management Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManagement />
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <PaymentMethods />
        </TabsContent>

        {/* Mobile Portal Tab */}
        <TabsContent value="mobile" className="space-y-6">
          <MobilePortalSettings />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Clean Report account with external services to streamline your workflow.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GoogleCalendarIntegration />
              <IntegrationErrorBoundary integrationName="Stripe">
                <StripeIntegrationComponent />
              </IntegrationErrorBoundary>
              <IntegrationErrorBoundary integrationName="Twilio">
                <TwilioIntegrationComponent />
              </IntegrationErrorBoundary>
              <XeroIntegrationComponent />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 