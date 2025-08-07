import { supabase } from './supabase'

export interface BillingCycle {
  id: string
  userId: string
  startDate: string
  endDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  invoiceUrl?: string
  stripeInvoiceId?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  cardholderName?: string
  stripePaymentMethodId?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  tier: 'free' | 'pro'
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  invoiceUrl?: string
  stripeInvoiceId?: string
  createdAt: string
  updatedAt: string
}

// Stripe webhook event types
interface StripeWebhookEvent {
  id: string
  object: 'event'
  type: string
  data: {
    object: StripeInvoiceObject | StripeSubscriptionObject
  }
  created: number
  livemode: boolean
  pending_webhooks: number
  request?: {
    id: string
    idempotency_key?: string
  }
}

interface StripeInvoiceObject {
  id: string
  object: 'invoice'
  amount_due: number
  amount_paid: number
  amount_remaining: number
  currency: string
  customer: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  subscription?: string
  hosted_invoice_url?: string
  invoice_pdf?: string
  created: number
  due_date?: number
}

interface StripeSubscriptionObject {
  id: string
  object: 'subscription'
  customer: string
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing'
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  created: number
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        unit_amount: number
        currency: string
      }
    }>
  }
}

export class BillingService {
  // Subscription Management
  static async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  static async createSubscription(userId: string, tier: 'pro'): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          cancel_at_period_end: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating subscription:', error)
      return null
    }
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      return null
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          status: 'cancelled'
        })
        .eq('id', subscriptionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
  }

  // Payment Methods
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  static async addPaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod | null> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          ...paymentMethod
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding payment method:', error)
      return null
    }
  }

  static async updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', paymentMethodId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating payment method:', error)
      return null
    }
  }

  static async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting payment method:', error)
      return false
    }
  }

  static async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    try {
      // First, unset all default payment methods for this user
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId)

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error setting default payment method:', error)
      return false
    }
  }

  // Billing Cycles
  static async getBillingCycles(userId: string): Promise<BillingCycle[]> {
    try {
      const { data, error } = await supabase
        .from('billing_cycles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching billing cycles:', error)
      return []
    }
  }

  static async createBillingCycle(billingCycle: Omit<BillingCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillingCycle | null> {
    try {
      const { data, error } = await supabase
        .from('billing_cycles')
        .insert(billingCycle)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating billing cycle:', error)
      return null
    }
  }

  // Invoices
  static async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  static async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating invoice:', error)
      return null
    }
  }

  // Usage Tracking
  static async getUsageStats(userId: string): Promise<{
    clients: number
    jobs: number
    reports: number
    recurringJobs: number
  }> {
    try {
      // Get counts from various tables
      const [clientsResult, jobsResult, reportsResult, recurringJobsResult] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('reports').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('recurring_jobs').select('id', { count: 'exact' }).eq('user_id', userId)
      ])

      return {
        clients: clientsResult.count || 0,
        jobs: jobsResult.count || 0,
        reports: reportsResult.count || 0,
        recurringJobs: recurringJobsResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return {
        clients: 0,
        jobs: 0,
        reports: 0,
        recurringJobs: 0
      }
    }
  }

  // Stripe Integration (placeholder for real implementation)
  static async createStripeCustomer(userId: string, email: string): Promise<string | null> {
    // In a real app, this would call Stripe API
    console.log('Creating Stripe customer for:', userId, email)
    return `cus_${userId}_${Date.now()}`
  }

  static async createStripeSubscription(customerId: string, priceId: string): Promise<string | null> {
    // In a real app, this would call Stripe API
    console.log('Creating Stripe subscription for customer:', customerId, 'with price:', priceId)
    return `sub_${customerId}_${Date.now()}`
  }

  static async createStripePaymentMethod(cardToken: string): Promise<string | null> {
    // In a real app, this would call Stripe API
    console.log('Creating Stripe payment method with token:', cardToken)
    return `pm_${Date.now()}`
  }

  // Webhook handlers
  static async handleStripeWebhook(event: StripeWebhookEvent): Promise<boolean> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break
      }
      return true
    } catch (error) {
      console.error('Error handling Stripe webhook:', error)
      return false
    }
  }

  private static async handlePaymentSucceeded(invoice: StripeInvoiceObject): Promise<void> {
    // Update invoice status and create billing cycle
    console.log('Payment succeeded for invoice:', invoice.id)
  }

  private static async handlePaymentFailed(invoice: StripeInvoiceObject): Promise<void> {
    // Update invoice status and notify user
    console.log('Payment failed for invoice:', invoice.id)
  }

  private static async handleSubscriptionUpdated(subscription: StripeSubscriptionObject): Promise<void> {
    // Update subscription status
    console.log('Subscription updated:', subscription.id)
  }

  private static async handleSubscriptionDeleted(subscription: StripeSubscriptionObject): Promise<void> {
    // Cancel subscription in database
    console.log('Subscription deleted:', subscription.id)
  }
} 