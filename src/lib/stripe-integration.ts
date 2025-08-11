import Stripe from 'stripe'

// Stripe API Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Initialize Stripe client only if secret key is available
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
}) : null

// Types for Stripe integration
export interface StripeConnection {
  id: string
  userId: string
  accountId: string
  accountName: string
  isLive: boolean
  webhookSecret?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StripePayment {
  id: string
  userId: string
  jobId: string
  stripePaymentIntentId: string
  amount: number // Amount in cents
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  clientSecret?: string
  paymentMethodTypes: string[]
  createdAt: string
  updatedAt: string
}

export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
  payment_method_types: string[]
}

export interface StripeSyncResult {
  success: boolean
  message: string
  data?: StripePayment[] | unknown
  error?: string
}

// Stripe Integration Service
class StripeIntegration {
  // 1. Account Management
  static async createAccount(accountData: {
    type: 'express' | 'standard'
    country: string
    email: string
    business_type: 'individual' | 'company'
    capabilities?: {
      card_payments?: { requested: boolean }
      transfers?: { requested: boolean }
    }
  }): Promise<Stripe.Account> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
    }
    
    try {
      const account = await stripe.accounts.create({
        type: accountData.type,
        country: accountData.country,
        email: accountData.email,
        business_type: accountData.business_type,
        capabilities: accountData.capabilities,
      })
      
      return account
    } catch (error) {
      console.error('Error creating Stripe account:', error)
      throw new Error('Failed to create Stripe account')
    }
  }

  static async getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      return account
    } catch (error) {
      console.error('Error retrieving Stripe account:', error)
      throw new Error('Failed to retrieve Stripe account')
    }
  }

  // 2. Payment Intent Management
  static async createPaymentIntent(paymentData: {
    amount: number // Amount in cents
    currency: string
    customerId?: string
    metadata?: Record<string, string>
    paymentMethodTypes?: string[]
    description?: string
  }): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer: paymentData.customerId,
        metadata: paymentData.metadata,
        payment_method_types: paymentData.paymentMethodTypes || ['card'],
        description: paymentData.description,
      })
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret!,
        payment_method_types: paymentIntent.payment_method_types,
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error('Failed to retrieve payment intent')
    }
  }

  static async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error('Failed to confirm payment intent')
    }
  }

  // 3. Customer Management
  static async createCustomer(customerData: {
    email: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        metadata: customerData.metadata,
      })
      
      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      return customer
    } catch (error) {
      console.error('Error retrieving customer:', error)
      throw new Error('Failed to retrieve customer')
    }
  }

  static async updateCustomer(customerId: string, updates: {
    email?: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.update(customerId, updates)
      return customer
    } catch (error) {
      console.error('Error updating customer:', error)
      throw new Error('Failed to update customer')
    }
  }

  // 4. Invoice Management
  static async createInvoice(invoiceData: {
    customerId: string
    amount: number
    currency: string
    description?: string
    metadata?: Record<string, string>
    dueDate?: number
  }): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.create({
        customer: invoiceData.customerId,
        amount_due: invoiceData.amount,
        currency: invoiceData.currency,
        description: invoiceData.description,
        metadata: invoiceData.metadata,
        due_date: invoiceData.dueDate,
      })
      
      return invoice
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  }

  static async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId)
      return invoice
    } catch (error) {
      console.error('Error retrieving invoice:', error)
      throw new Error('Failed to retrieve invoice')
    }
  }

  static async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.sendInvoice(invoiceId)
      return invoice
    } catch (error) {
      console.error('Error sending invoice:', error)
      throw new Error('Failed to send invoice')
    }
  }

  // 5. Webhook Handling
  static async handleWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    try {
      if (!STRIPE_WEBHOOK_SECRET) {
        throw new Error('Stripe webhook secret not configured')
      }
      
      const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET)
      
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
      
      return event
    } catch (error) {
      console.error('Error handling webhook:', error)
      throw new Error('Failed to process webhook')
    }
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id)
    // Update payment status in your database
    // Send confirmation email/SMS
    // Update job status if needed
  }

  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment failed:', paymentIntent.id)
    // Update payment status in your database
    // Send failure notification
    // Retry logic if needed
  }

  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment succeeded:', invoice.id)
    // Update invoice status in your database
    // Send receipt
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment failed:', invoice.id)
    // Update invoice status in your database
    // Send payment reminder
  }

  // 6. Utility Methods
  static formatAmount(amount: number, currency: string = 'usd'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    })
    
    return formatter.format(amount / 100) // Convert cents to dollars
  }

  static parseAmount(amount: string): number {
    // Convert dollar amount to cents
    const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''))
    return Math.round(numericAmount * 100)
  }

  // 7. Sync Operations
  static async syncPayments(connection: StripeConnection, jobIds: string[]): Promise<StripeSyncResult> {
    try {
      // This would integrate with your jobs table to sync payments
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        created: {
          gte: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000), // Last 30 days
        },
      })
      
      return {
        success: true,
        message: `Successfully synced ${payments.data.length} payments`,
        data: payments.data,
      }
    } catch (error) {
      console.error('Error syncing payments:', error)
      return {
        success: false,
        message: 'Failed to sync payments',
        error: error.message,
      }
    }
  }

  // 8. Subscription Management (for recurring payments)
  static async createSubscription(subscriptionData: {
    customerId: string
    priceId: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [{ price: subscriptionData.priceId }],
        metadata: subscriptionData.metadata,
      })
      
      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId)
      return subscription
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }
}

// Export the service
export { StripeIntegration } 