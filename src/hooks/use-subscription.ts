import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { getUserProfile } from '@/lib/supabase-client'
import { SubscriptionService, SubscriptionTier } from '@/lib/subscription-service'
import type { UserProfile } from '@/types/database'

export function useSubscription() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      setUserProfile(null)
      setLoading(false)
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await getUserProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const tier = SubscriptionService.getTier(userProfile)
  const limits = SubscriptionService.getUserLimits(userProfile)

  const canAccessFeature = (feature: keyof typeof limits.features) => {
    return SubscriptionService.canAccessFeature(feature, userProfile)
  }

  const canCreateResource = (
    resourceType: keyof Omit<typeof limits, 'features'>,
    currentCount: number
  ) => {
    return SubscriptionService.canCreateResource(resourceType, currentCount, userProfile)
  }

  const getUpgradeMessage = (resourceType: string) => {
    return SubscriptionService.getUpgradeMessage(resourceType)
  }

  const getFeatureUpgradeMessage = (feature: string) => {
    return SubscriptionService.getFeatureUpgradeMessage(feature)
  }

  const isPro = tier === 'pro'
  const isFree = tier === 'free'

  return {
    tier,
    limits,
    userProfile,
    loading,
    canAccessFeature,
    canCreateResource,
    getUpgradeMessage,
    getFeatureUpgradeMessage,
    isPro,
    isFree,
    refreshProfile: loadUserProfile,
  }
} 