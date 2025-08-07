import OAuthClient from 'intuit-oauth'
import QuickBooks from 'node-quickbooks'

// QuickBooks API Configuration
const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET
const QUICKBOOKS_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI

// Initialize OAuth client
const oauthClient = new OAuthClient({
  clientId: QUICKBOOKS_CLIENT_ID!,
  clientSecret: QUICKBOOKS_CLIENT_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  redirectUri: QUICKBOOKS_REDIRECT_URI!,
})

// Types for QuickBooks integration
export interface QuickBooksConnection {
  id: string
  userId: string
  realmId: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface QuickBooksInvoice {
  id: string
  userId: string
  jobId: string
  quickbooksInvoiceId: string
  invoiceNumber: string
  customerId: string
  amount: number
  status: 'draft' | 'pending' | 'approved' | 'closed' | 'voided'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface QuickBooksCustomer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  isActive: boolean
}

export interface QuickBooksAccount {
  id: string
  name: string
  accountType: string
  accountSubType: string
  active: boolean
}

export interface QuickBooksSyncResult {
  success: boolean
  message: string
  data?: QuickBooksInvoice[] | QuickBooksCustomer[] | QuickBooksAccount[] | unknown
  error?: string
}

// QuickBooks Integration Service
class QuickBooksIntegration {
  // 1. Authentication and Connection Management
  static async getAuthorizationUrl(): Promise<string> {
    try {
      const authUri = oauthClient.authorizeUri({
        scope: [
          OAuthClient.scopes.Accounting,
          OAuthClient.scopes.OpenId,
          OAuthClient.scopes.Profile,
          OAuthClient.scopes.Email,
        ],
        state: 'teststate',
      })
      
      return authUri
    } catch (error) {
      console.error('Error generating QuickBooks auth URL:', error)
      throw new Error('Failed to generate authorization URL')
    }
  }

  static async handleCallback(url: string): Promise<QuickBooksConnection> {
    try {
      const authResponse = await oauthClient.createToken(url)
      const token = authResponse.getJson()
      
      const connection: QuickBooksConnection = {
        id: crypto.randomUUID(),
        userId: '', // Will be set by caller
        realmId: token.realmId,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(Date.now() + (token.expires_in * 1000)).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      return connection
    } catch (error) {
      console.error('Error handling QuickBooks callback:', error)
      throw new Error('Failed to complete QuickBooks authorization')
    }
  }

  static async refreshToken(connection: QuickBooksConnection): Promise<QuickBooksConnection> {
    try {
      oauthClient.setToken({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        token_type: 'bearer',
        expires_in: 3600,
        x_refresh_token_expires_in: 8726400,
      })
      
      const authResponse = await oauthClient.refresh()
      const token = authResponse.getJson()
      
      return {
        ...connection,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(Date.now() + (token.expires_in * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error refreshing QuickBooks token:', error)
      throw new Error('Failed to refresh QuickBooks token')
    }
  }

  // 2. Initialize QuickBooks client
  private static async getQuickBooksClient(connection: QuickBooksConnection): Promise<QuickBooks> {
    const refreshedConnection = await this.refreshTokenIfNeeded(connection)
    
    return new QuickBooks(
      QUICKBOOKS_CLIENT_ID!,
      QUICKBOOKS_CLIENT_SECRET!,
      refreshedConnection.accessToken,
      false, // no debug
      refreshedConnection.realmId,
      process.env.NODE_ENV === 'production', // use sandbox?
      true, // enable debugging
      null, // set minorversion
      '2.0', // oauth version
      refreshedConnection.refreshToken
    )
  }

  // 3. Invoice Management
  static async createInvoice(connection: QuickBooksConnection, invoiceData: {
    customerId: string
    lineItems: Array<{
      description: string
      quantity: number
      unitPrice: number
      accountId: string
    }>
    dueDate?: string
    memo?: string
  }): Promise<QuickBooksInvoice> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      const invoice = {
        Line: invoiceData.lineItems.map(item => ({
          Amount: item.quantity * item.unitPrice,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: item.accountId,
            },
            Qty: item.quantity,
            UnitPrice: item.unitPrice,
          },
          Description: item.description,
        })),
        CustomerRef: {
          value: invoiceData.customerId,
        },
        DueDate: invoiceData.dueDate,
        Memo: invoiceData.memo || 'Clean Report Invoice',
      }
      
      return new Promise((resolve, reject) => {
        qbo.invoice.create(invoice, (err: any, invoice: any) => {
          if (err) {
            reject(new Error(`Failed to create QuickBooks invoice: ${err.message}`))
          } else {
            const quickBooksInvoice: QuickBooksInvoice = {
              id: crypto.randomUUID(),
              userId: connection.userId,
              jobId: '', // Will be set by caller
              quickbooksInvoiceId: invoice.Id,
              invoiceNumber: invoice.DocNumber,
              customerId: invoice.CustomerRef.value,
              amount: invoice.TotalAmt,
              status: this.mapInvoiceStatus(invoice.Balance),
              dueDate: invoice.DueDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            resolve(quickBooksInvoice)
          }
        })
      })
    } catch (error) {
      console.error('Error creating QuickBooks invoice:', error)
      throw new Error('Failed to create QuickBooks invoice')
    }
  }

  static async getInvoices(connection: QuickBooksConnection, filters?: {
    status?: string
    dateFrom?: string
    dateTo?: string
    customerId?: string
  }): Promise<QuickBooksInvoice[]> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      let query = 'SELECT * FROM Invoice'
      const conditions: string[] = []
      
      if (filters?.status) {
        conditions.push(`Balance ${filters.status === 'paid' ? '=' : '>'} 0`)
      }
      if (filters?.dateFrom) {
        conditions.push(`TxnDate >= '${filters.dateFrom}'`)
      }
      if (filters?.dateTo) {
        conditions.push(`TxnDate <= '${filters.dateTo}'`)
      }
      if (filters?.customerId) {
        conditions.push(`CustomerRef = '${filters.customerId}'`)
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
      
      return new Promise((resolve, reject) => {
        qbo.query(query, (err: any, invoices: any) => {
          if (err) {
            reject(new Error(`Failed to fetch QuickBooks invoices: ${err.message}`))
          } else {
            const quickBooksInvoices: QuickBooksInvoice[] = invoices.map((invoice: any) => ({
              id: crypto.randomUUID(),
              userId: connection.userId,
              jobId: '', // Would be extracted from metadata
              quickbooksInvoiceId: invoice.Id,
              invoiceNumber: invoice.DocNumber,
              customerId: invoice.CustomerRef.value,
              amount: invoice.TotalAmt,
              status: this.mapInvoiceStatus(invoice.Balance),
              dueDate: invoice.DueDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }))
            resolve(quickBooksInvoices)
          }
        })
      })
    } catch (error) {
      console.error('Error fetching QuickBooks invoices:', error)
      throw new Error('Failed to fetch QuickBooks invoices')
    }
  }

  static async updateInvoice(connection: QuickBooksConnection, invoiceId: string, updates: {
    status?: string
    lineItems?: Array<{
      description: string
      quantity: number
      unitPrice: number
      accountId: string
    }>
  }): Promise<QuickBooksInvoice> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      // First get the existing invoice
      const existingInvoice = await new Promise((resolve, reject) => {
        qbo.invoice.findById(invoiceId, (err: any, invoice: any) => {
          if (err) {
            reject(new Error(`Failed to fetch invoice: ${err.message}`))
          } else {
            resolve(invoice)
          }
        })
      })
      
      // Update the invoice
      const updatedInvoice = {
        ...existingInvoice,
        ...(updates.lineItems && {
          Line: updates.lineItems.map(item => ({
            Amount: item.quantity * item.unitPrice,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: {
                value: item.accountId,
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice,
            },
            Description: item.description,
          })),
        }),
      }
      
      return new Promise((resolve, reject) => {
        qbo.invoice.update(updatedInvoice, (err: any, invoice: any) => {
          if (err) {
            reject(new Error(`Failed to update QuickBooks invoice: ${err.message}`))
          } else {
            const quickBooksInvoice: QuickBooksInvoice = {
              id: crypto.randomUUID(),
              userId: connection.userId,
              jobId: '', // Would be extracted from metadata
              quickbooksInvoiceId: invoice.Id,
              invoiceNumber: invoice.DocNumber,
              customerId: invoice.CustomerRef.value,
              amount: invoice.TotalAmt,
              status: this.mapInvoiceStatus(invoice.Balance),
              dueDate: invoice.DueDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            resolve(quickBooksInvoice)
          }
        })
      })
    } catch (error) {
      console.error('Error updating QuickBooks invoice:', error)
      throw new Error('Failed to update QuickBooks invoice')
    }
  }

  // 4. Customer Management
  static async createCustomer(connection: QuickBooksConnection, customerData: {
    name: string
    email?: string
    phone?: string
    address?: string
  }): Promise<QuickBooksCustomer> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      const customer = {
        Name: customerData.name,
        PrimaryEmailAddr: customerData.email ? {
          Address: customerData.email,
        } : undefined,
        PrimaryPhone: customerData.phone ? {
          FreeFormNumber: customerData.phone,
        } : undefined,
        BillAddr: customerData.address ? {
          Line1: customerData.address,
        } : undefined,
      }
      
      return new Promise((resolve, reject) => {
        qbo.customer.create(customer, (err: any, customer: any) => {
          if (err) {
            reject(new Error(`Failed to create QuickBooks customer: ${err.message}`))
          } else {
            const quickBooksCustomer: QuickBooksCustomer = {
              id: customer.Id,
              name: customer.Name,
              email: customer.PrimaryEmailAddr?.Address || '',
              phone: customer.PrimaryPhone?.FreeFormNumber || '',
              address: customer.BillAddr?.Line1 || '',
              isActive: customer.Active,
            }
            resolve(quickBooksCustomer)
          }
        })
      })
    } catch (error) {
      console.error('Error creating QuickBooks customer:', error)
      throw new Error('Failed to create QuickBooks customer')
    }
  }

  static async getCustomers(connection: QuickBooksConnection, filters?: {
    isActive?: boolean
    name?: string
  }): Promise<QuickBooksCustomer[]> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      let query = 'SELECT * FROM Customer'
      const conditions: string[] = []
      
      if (filters?.isActive !== undefined) {
        conditions.push(`Active = ${filters.isActive}`)
      }
      if (filters?.name) {
        conditions.push(`Name LIKE '%${filters.name}%'`)
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
      
      return new Promise((resolve, reject) => {
        qbo.query(query, (err: any, customers: any) => {
          if (err) {
            reject(new Error(`Failed to fetch QuickBooks customers: ${err.message}`))
          } else {
            const quickBooksCustomers: QuickBooksCustomer[] = customers.map((customer: any) => ({
              id: customer.Id,
              name: customer.Name,
              email: customer.PrimaryEmailAddr?.Address || '',
              phone: customer.PrimaryPhone?.FreeFormNumber || '',
              address: customer.BillAddr?.Line1 || '',
              isActive: customer.Active,
            }))
            resolve(quickBooksCustomers)
          }
        })
      })
    } catch (error) {
      console.error('Error fetching QuickBooks customers:', error)
      throw new Error('Failed to fetch QuickBooks customers')
    }
  }

  // 5. Account Management
  static async getAccounts(connection: QuickBooksConnection, filters?: {
    accountType?: string
    active?: boolean
  }): Promise<QuickBooksAccount[]> {
    try {
      const qbo = await this.getQuickBooksClient(connection)
      
      let query = 'SELECT * FROM Account'
      const conditions: string[] = []
      
      if (filters?.accountType) {
        conditions.push(`AccountType = '${filters.accountType}'`)
      }
      if (filters?.active !== undefined) {
        conditions.push(`Active = ${filters.active}`)
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
      
      return new Promise((resolve, reject) => {
        qbo.query(query, (err: any, accounts: any) => {
          if (err) {
            reject(new Error(`Failed to fetch QuickBooks accounts: ${err.message}`))
          } else {
            const quickBooksAccounts: QuickBooksAccount[] = accounts.map((account: any) => ({
              id: account.Id,
              name: account.Name,
              accountType: account.AccountType,
              accountSubType: account.AccountSubType,
              active: account.Active,
            }))
            resolve(quickBooksAccounts)
          }
        })
      })
    } catch (error) {
      console.error('Error fetching QuickBooks accounts:', error)
      throw new Error('Failed to fetch QuickBooks accounts')
    }
  }

  // 6. Sync Operations
  static async syncInvoices(connection: QuickBooksConnection, jobIds: string[]): Promise<QuickBooksSyncResult> {
    try {
      const invoices = await this.getInvoices(connection)
      
      return {
        success: true,
        message: `Successfully synced ${invoices.length} invoices`,
        data: invoices,
      }
    } catch (error) {
      console.error('Error syncing invoices:', error)
      return {
        success: false,
        message: 'Failed to sync invoices',
        error: error.message,
      }
    }
  }

  static async syncCustomers(connection: QuickBooksConnection, clientIds: string[]): Promise<QuickBooksSyncResult> {
    try {
      const customers = await this.getCustomers(connection)
      
      return {
        success: true,
        message: `Successfully synced ${customers.length} customers`,
        data: customers,
      }
    } catch (error) {
      console.error('Error syncing customers:', error)
      return {
        success: false,
        message: 'Failed to sync customers',
        error: error.message,
      }
    }
  }

  // 7. Utility Methods
  private static async refreshTokenIfNeeded(connection: QuickBooksConnection): Promise<QuickBooksConnection> {
    const expiresAt = new Date(connection.expiresAt)
    const now = new Date()
    
    if (expiresAt <= now) {
      return await this.refreshToken(connection)
    }
    
    return connection
  }

  private static mapInvoiceStatus(balance: number): QuickBooksInvoice['status'] {
    if (balance === 0) {
      return 'closed'
    } else if (balance > 0) {
      return 'pending'
    } else {
      return 'draft'
    }
  }

  // 8. Webhook Handling (if QuickBooks supports it)
  static async handleWebhook(payload: any): Promise<void> {
    try {
      // Handle QuickBooks webhooks for real-time updates
      console.log('QuickBooks webhook received:', payload)
      // Implement your webhook handling logic here
    } catch (error) {
      console.error('Error handling QuickBooks webhook:', error)
      throw new Error('Failed to process webhook')
    }
  }
}

// Export the service
export { QuickBooksIntegration } 