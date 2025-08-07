"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Crown, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradePromptProps {
  title: string
  description: string
  feature?: string
  resourceType?: string
  currentCount?: number
  maxCount?: number
  isOpen: boolean
  onClose: () => void
}

export function UpgradePrompt({
  title,
  description,
  feature,
  resourceType,
  currentCount,
  maxCount,
  isOpen,
  onClose
}: UpgradePromptProps) {
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = () => {
    setIsUpgrading(true)
    // In a real app, this would redirect to a payment page
    // For now, we'll just close the dialog
    setTimeout(() => {
      setIsUpgrading(false)
      onClose()
      // You could redirect to a pricing page here
      // router.push('/pricing')
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Upgrade to Pro</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Usage */}
          {resourceType && currentCount !== undefined && maxCount !== undefined && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-800">
                    Current {resourceType}: {currentCount}/{maxCount}
                  </span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    Limit Reached
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pro Features */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Pro Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Unlimited clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Time tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Recurring jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Branded reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">API access</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">$29</div>
            <div className="text-sm text-gray-600">per month</div>
            <div className="text-xs text-gray-500 mt-1">14-day free trial • Cancel anytime</div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade} 
            disabled={isUpgrading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isUpgrading ? "Upgrading..." : "Upgrade to Pro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 