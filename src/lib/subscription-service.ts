export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionLimits {
  maxClients: number
  maxJobs: number
  maxReports: number
  maxRecurringJobs: number
  maxSupplies: number
  maxServiceTypes: number
  maxStaffMembers: number
  features: {
    timeTracking: boolean
    recurringJobs: boolean
    brandedReports: boolean
    apiAccess: boolean
    prioritySupport: boolean
    calendarIntegration: boolean
    clientPortal: boolean
    advancedAnalytics: boolean
  }
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxClients: 5,
    maxJobs: 20,
    maxReports: 10,
    maxRecurringJobs: -1, // Now unlimited for all users
    maxSupplies: 10,
    maxServiceTypes: 5,
    maxStaffMembers: 0,
    features: {
      timeTracking: false,
      recurringJobs: true, // Now available to all users
      brandedReports: false,
      apiAccess: false,
      prioritySupport: false,
      calendarIntegration: false,
      clientPortal: false,
      advancedAnalytics: false,
    }
  },
  pro: {
    maxClients: -1, // unlimited
    maxJobs: -1, // unlimited
    maxReports: -1, // unlimited
    maxRecurringJobs: -1, // unlimited
    maxSupplies: -1, // unlimited
    maxServiceTypes: -1, // unlimited
    maxStaffMembers: -1, // unlimited
    features: {
      timeTracking: true,
      recurringJobs: true,
      brandedReports: true,
      apiAccess: true,
      prioritySupport: true,
      calendarIntegration: true,
      clientPortal: true,
      advancedAnalytics: true,
    }
  }
}

export class SubscriptionService {
  private static getDefaultTier(): SubscriptionTier {
    return 'free'
  }

  static getTier(userProfile?: { subscription_tier?: SubscriptionTier }): SubscriptionTier {
    return userProfile?.subscription_tier || this.getDefaultTier()
  }

  static getLimits(tier: SubscriptionTier): SubscriptionLimits {
    return SUBSCRIPTION_LIMITS[tier]
  }

  static getUserLimits(userProfile?: { subscription_tier?: SubscriptionTier }): SubscriptionLimits {
    const tier = this.getTier(userProfile)
    return this.getLimits(tier)
  }

  static canAccessFeature(
    feature: keyof SubscriptionLimits['features'],
    userProfile?: { subscription_tier?: SubscriptionTier }
  ): boolean {
    const limits = this.getUserLimits(userProfile)
    return limits.features[feature]
  }

  static canCreateResource(
    resourceType: keyof Omit<SubscriptionLimits, 'features'>,
    currentCount: number,
    userProfile?: { subscription_tier?: SubscriptionTier }
  ): boolean {
    const limits = this.getUserLimits(userProfile)
    const maxLimit = limits[resourceType]
    
    // -1 means unlimited
    if (maxLimit === -1) return true
    
    return currentCount < maxLimit
  }

  static getUpgradeMessage(resourceType: string): string {
    return `You've reached the limit for ${resourceType} on the Free plan. Upgrade to Pro for unlimited access.`
  }

  static getFeatureUpgradeMessage(feature: string): string {
    return `${feature} is available on the Pro plan. Upgrade to unlock this feature.`
  }
} 