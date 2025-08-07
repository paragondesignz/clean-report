import React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Sparkles, AlertTriangle } from "lucide-react"

export interface FeatureAccess {
  aiFeatures: boolean
  subContractors: boolean
  messaging: boolean
  advancedTimeTracking: boolean
  brandedReports: boolean
  recurringJobs: boolean
  apiAccess: boolean
  prioritySupport: boolean
  unlimitedClients: boolean
  xeroIntegration: boolean
}

export interface TierLimits {
  maxClients: number
  maxSubContractors: number
  maxJobsPerMonth: number
  maxStorageGB: number
  maxApiCalls: number
}

export const TIER_FEATURES = {
  free: {
    features: {
      aiFeatures: false,
      subContractors: false,
      messaging: false,
      advancedTimeTracking: false,
      brandedReports: false,
      recurringJobs: true, // Now available to all users
      apiAccess: false,
      prioritySupport: false,
      unlimitedClients: false,
      xeroIntegration: false,
    },
    limits: {
      maxClients: 5,
      maxSubContractors: 0,
      maxJobsPerMonth: 50,
      maxStorageGB: 1,
      maxApiCalls: 0,
    }
  },
  pro: {
    features: {
      aiFeatures: true,
      subContractors: true,
      messaging: true,
      advancedTimeTracking: true,
      brandedReports: true,
      recurringJobs: true,
      apiAccess: true,
      prioritySupport: true,
      unlimitedClients: true,
      xeroIntegration: true,
    },
    limits: {
      maxClients: -1, // unlimited
      maxSubContractors: 10,
      maxJobsPerMonth: -1, // unlimited
      maxStorageGB: 10,
      maxApiCalls: 1000,
    }
  }
}

export function useTierAccess(): { access: FeatureAccess; limits: TierLimits; isPro: boolean; userRole: string } {
  const { user } = useAuth()
  
  // Determine user role and tier
  let userRole = 'free'
  let userTier = 'free'
  
  if (user) {
    // Check if user is a sub contractor
    if (user.user_metadata?.role === 'sub_contractor') {
      userRole = 'sub_contractor'
      userTier = 'free' // Sub contractors always have free tier access
    } else if (user.user_metadata?.subscription_tier === 'pro' || user.email === 'mark@paragondesign.co.nz' || user.email === 'caroline.lekstrom@hotmail.com') {
      // Temporary: Force pro tier for specified users
      userRole = 'admin'
      userTier = 'pro'
    } else {
      userRole = 'admin'
      userTier = 'free'
    }
  }
  
  const tierConfig = TIER_FEATURES[userTier as keyof typeof TIER_FEATURES] || TIER_FEATURES.free
  
  return {
    access: tierConfig.features,
    limits: tierConfig.limits,
    isPro: userTier === 'pro',
    userRole
  }
}

// Utility functions that don't use hooks - use these for non-component contexts
export function checkFeatureAccessForTier(tier: 'free' | 'pro', feature: keyof FeatureAccess): boolean {
  return TIER_FEATURES[tier].features[feature]
}

export function checkLimitForTier(tier: 'free' | 'pro', limit: keyof TierLimits): number {
  return TIER_FEATURES[tier].limits[limit]
}

// Hook-based functions - only use within React components
export function useFeatureAccess(feature: keyof FeatureAccess): boolean {
  const { access } = useTierAccess()
  return access[feature]
}

export function useLimit(limit: keyof TierLimits): number {
  const { limits } = useTierAccess()
  return limits[limit]
}

// Legacy functions - deprecated, use useFeatureAccess hook instead
export function canUseAIFeatures(): boolean {
  // This is a utility function that should be replaced with useFeatureAccess hook
  // For now, we'll throw an error to encourage proper usage
  throw new Error('Use useFeatureAccess("aiFeatures") hook instead of canUseAIFeatures()')
}

export function canManageSubContractors(): boolean {
  // This is a utility function that should be replaced with useFeatureAccess hook  
  // For now, we'll throw an error to encourage proper usage
  throw new Error('Use useFeatureAccess("subContractors") hook instead of canManageSubContractors()')
}

export function canUseMessaging(): boolean {
  throw new Error('Use useFeatureAccess("messaging") hook instead of canUseMessaging()')
}

export function canUseXeroIntegration(): boolean {
  throw new Error('Use useFeatureAccess("xeroIntegration") hook instead of canUseXeroIntegration()')
}

export function canUseAdvancedTimeTracking(): boolean {
  throw new Error('Use useFeatureAccess("advancedTimeTracking") hook instead of canUseAdvancedTimeTracking()')
}

export function canUseBrandedReports(): boolean {
  throw new Error('Use useFeatureAccess("brandedReports") hook instead of canUseBrandedReports()')
}

export function canUseRecurringJobs(): boolean {
  throw new Error('Use useFeatureAccess("recurringJobs") hook instead of canUseRecurringJobs()')
}

export function canUseApiAccess(): boolean {
  throw new Error('Use useFeatureAccess("apiAccess") hook instead of canUseApiAccess()')
}

export function canUsePrioritySupport(): boolean {
  throw new Error('Use useFeatureAccess("prioritySupport") hook instead of canUsePrioritySupport()')
}

export function canUseUnlimitedClients(): boolean {
  throw new Error('Use useFeatureAccess("unlimitedClients") hook instead of canUseUnlimitedClients()')
}

// Component for showing upgrade prompt to free users
export function FeatureUpgradePrompt({ 
  feature, 
  title, 
  description 
}: { 
  feature: string
  title: string
  description: string 
}) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <div className="mb-4">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title} - Pro Feature
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Upgrade to Pro
      </Button>
    </div>
  )
}

// Component for showing limit exceeded message
export function LimitExceededPrompt({ 
  limit, 
  current, 
  max 
}: { 
  limit: string
  current: number
  max: number 
}) {
  return (
    <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
      <div className="mb-4">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {limit} Limit Reached
        </h3>
        <p className="text-gray-600 mb-4">
          You've reached your limit of {max} {limit.toLowerCase()}. 
          You currently have {current} {limit.toLowerCase()}.
        </p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Upgrade to Pro
      </Button>
    </div>
  )
}

// Hook for checking route access based on user role
export function useRouteAccess() {
  const { userRole } = useTierAccess()
  
  return {
    canAccessRoute: (route: string) => {
      // Sub contractors can only access their specific routes
      if (userRole === 'sub_contractor') {
        const subContractorRoutes = [
          '/sub-contractor/dashboard',
          '/sub-contractor/jobs',
          '/sub-contractor/profile'
        ]
        return subContractorRoutes.some(r => route.startsWith(r))
      }
      
      // Admins can access all routes except sub contractor specific ones
      if (userRole === 'admin') {
        const subContractorOnlyRoutes = [
          '/sub-contractor'
        ]
        return !subContractorOnlyRoutes.some(r => route.startsWith(r))
      }
      
      return false
    },
    userRole
  }
}

// Hook for usage statistics
export function useUsageStats() {
  const { limits } = useTierAccess()
  
  // Mock usage data - in real app, fetch from database
  const mockUsage = {
    clients: 3,
    subContractors: 0,
    jobsThisMonth: 25,
    storageUsed: 0.5,
    apiCalls: 0
  }
  
  return {
    usage: mockUsage,
    limits,
    percentages: {
      clients: limits.maxClients > 0 ? (mockUsage.clients / limits.maxClients) * 100 : 0,
      subContractors: limits.maxSubContractors > 0 ? (mockUsage.subContractors / limits.maxSubContractors) * 100 : 0,
      jobsThisMonth: limits.maxJobsPerMonth > 0 ? (mockUsage.jobsThisMonth / limits.maxJobsPerMonth) * 100 : 0,
      storageUsed: (mockUsage.storageUsed / limits.maxStorageGB) * 100,
      apiCalls: limits.maxApiCalls > 0 ? (mockUsage.apiCalls / limits.maxApiCalls) * 100 : 0
    }
  }
} 