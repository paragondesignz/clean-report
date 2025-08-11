import { XeroClient } from 'xero-node'

// Xero API Configuration
const XERO_CLIENT_ID = process.env.NEXT_PUBLIC_XERO_CLIENT_ID || process.env.XERO_CLIENT_ID
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET
const XERO_REDIRECT_URI = process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || process.env.XERO_REDIRECT_URI

// Initialize Xero client
const xeroClient = new XeroClient({
  clientId: XERO_CLIENT_ID,
  clientSecret: XERO_CLIENT_SECRET,
  redirectUris: [XERO_REDIRECT_URI],
  scopes: [
    'offline_access',
    'accounting.transactions',
    'accounting.contacts',
    'accounting.settings',
    'accounting.reports.read'
  ]
})

// Types for Xero integration
export interface XeroConnection {
  id: string
  userId: string
  tenantId: string
  tenantName: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface XeroInvoice {
  id: string
  invoiceNumber: string
  contactId: string
  contactName: string
  date: string
  dueDate: string
  total: number
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED'
  currency: string
  lineItems: XeroLineItem[]
}

export interface XeroLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  accountCode: string
}

export interface XeroContact {
  id: string
  name: string
  email: string
  phone: string
  address: string
  isCustomer: boolean
  isSupplier: boolean
}

export interface XeroAccount {
  id: string
  code: string
  name: string
  type: string
  status: 'ACTIVE' | 'ARCHIVED'
}

export interface XeroSyncResult {
  success: boolean
  message: string
  data?: XeroInvoice[] | XeroContact[] | XeroAccount[] | unknown
  error?: string
}

// Xero API raw response types
interface XeroInvoiceRaw {
  invoiceID: string
  invoiceNumber: string
  contact: {
    contactID: string
    name: string
  }
  date: string
  dueDate: string
  total: number
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED'
  currencyCode: string
  lineItems: XeroLineItemRaw[]
}

interface XeroLineItemRaw {
  lineItemID: string
  description: string
  quantity: number
  unitAmount: number
  lineAmount: number
  accountCode: string
}

interface XeroContactRaw {
  contactID: string
  name: string
  emailAddress?: string
  phones?: Array<{
    phoneNumber: string
    phoneType: string
  }>
  addresses?: Array<{
    addressType: string
    addressLine1: string
  }>
  isCustomer: boolean
  isSupplier: boolean
}

interface XeroAccountRaw {
  accountID: string
  code: string
  name: string
  type: string
  status: 'ACTIVE' | 'ARCHIVED'
}

interface XeroWebhookPayload {
  events: XeroWebhookEvent[]
  firstEventSequence: number
  lastEventSequence: number
  entropy: string
}

interface XeroWebhookEvent {
  resourceUrl: string
  resourceId: string
  eventDateUtc: string
  eventType: string
  eventCategory: string
  tenantId: string
  tenantType: string
  resourceType: 'INVOICE' | 'CONTACT' | 'PAYMENT' | 'CREDITNOTE'
}

// Xero Integration Service
class XeroIntegration {
  // 1. Authentication and Connection Management
  static async getAuthorizationUrl(): Promise<string> {
    try {
      const authUrl = await xeroClient.buildConsentUrl()
      return authUrl
    } catch (error) {
      console.error('Error generating Xero auth URL:', error)
      throw new Error('Failed to generate authorization URL')
    }
  }

  static async handleCallback(code: string): Promise<XeroConnection> {
    try {
      const tokenSet = await xeroClient.apiCallback(code)
      
      const tenants = await xeroClient.tenants.getTenants()
      const tenant = tenants[0] // Use first tenant for simplicity
      
      const connection: XeroConnection = {
        id: crypto.randomUUID(),
        userId: '', // Will be set by caller
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: new Date(Date.now() + (tokenSet.expires_in * 1000)).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return connection
    } catch (error) {
      console.error('Error handling Xero callback:', error)
      throw new Error('Failed to complete Xero authorization')
    }
  }

  static async refreshToken(connection: XeroConnection): Promise<XeroConnection> {
    try {
      const tokenSet = await xeroClient.refreshToken(connection.refreshToken)
      
      return {
        ...connection,
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: new Date(Date.now() + (tokenSet.expires_in * 1000)).toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error refreshing Xero token:', error)
      throw new Error('Failed to refresh Xero token')
    }
  }

  // 2. Invoice Management
  static async createInvoice(connection: XeroConnection, invoiceData: {
    contactId: string
    lineItems: Array<{
      description: string
      quantity: number
      unitPrice: number
      accountCode: string
    }>
    date: string
    dueDate: string
    reference?: string
  }): Promise<XeroInvoice> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      const invoice = {
        contact: { contactID: invoiceData.contactId },
        lineItems: invoiceData.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitAmount: item.unitPrice,
          accountCode: item.accountCode
        })),
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        reference: invoiceData.reference || 'Clean Report Invoice'
      }
      
      const response = await xeroClient.invoices.create(refreshedConnection.tenantId, [invoice])
      const createdInvoice = response.invoices[0]
      
      return this.mapXeroInvoice(createdInvoice)
    } catch (error) {
      console.error('Error creating Xero invoice:', error)
      throw new Error('Failed to create Xero invoice')
    }
  }

  static async getInvoices(connection: XeroConnection, filters?: {
    status?: string
    dateFrom?: string
    dateTo?: string
    contactId?: string
  }): Promise<XeroInvoice[]> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      let where = ''
      if (filters?.status) where += `Status="${filters.status}"`
      if (filters?.dateFrom) where += `${where ? ' AND ' : ''}Date >= DateTime(${filters.dateFrom})`
      if (filters?.dateTo) where += `${where ? ' AND ' : ''}Date <= DateTime(${filters.dateTo})`
      if (filters?.contactId) where += `${where ? ' AND ' : ''}Contact.ContactID = Guid("${filters.contactId}")`
      
      const response = await xeroClient.invoices.get(refreshedConnection.tenantId, { where })
      
      return response.invoices.map(this.mapXeroInvoice)
    } catch (error) {
      console.error('Error fetching Xero invoices:', error)
      throw new Error('Failed to fetch Xero invoices')
    }
  }

  static async updateInvoice(connection: XeroConnection, invoiceId: string, updates: {
    status?: string
    lineItems?: Array<{
      description: string
      quantity: number
      unitPrice: number
      accountCode: string
    }>
  }): Promise<XeroInvoice> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      const invoice = {
        invoiceID: invoiceId,
        ...(updates.status && { status: updates.status }),
        ...(updates.lineItems && {
          lineItems: updates.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitAmount: item.unitPrice,
            accountCode: item.accountCode
          }))
        })
      }
      
      const response = await xeroClient.invoices.update(refreshedConnection.tenantId, [invoice])
      const updatedInvoice = response.invoices[0]
      
      return this.mapXeroInvoice(updatedInvoice)
    } catch (error) {
      console.error('Error updating Xero invoice:', error)
      throw new Error('Failed to update Xero invoice')
    }
  }

  // 3. Contact Management
  static async createContact(connection: XeroConnection, contactData: {
    name: string
    email?: string
    phone?: string
    address?: string
    isCustomer?: boolean
    isSupplier?: boolean
  }): Promise<XeroContact> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      const contact = {
        name: contactData.name,
        emailAddress: contactData.email,
        phones: contactData.phone ? [{ phoneNumber: contactData.phone, phoneType: 'MOBILE' }] : [],
        addresses: contactData.address ? [{ addressType: 'STREET', addressLine1: contactData.address }] : [],
        isCustomer: contactData.isCustomer ?? true,
        isSupplier: contactData.isSupplier ?? false
      }
      
      const response = await xeroClient.contacts.create(refreshedConnection.tenantId, [contact])
      const createdContact = response.contacts[0]
      
      return this.mapXeroContact(createdContact)
    } catch (error) {
      console.error('Error creating Xero contact:', error)
      throw new Error('Failed to create Xero contact')
    }
  }

  static async getContacts(connection: XeroConnection, filters?: {
    isCustomer?: boolean
    isSupplier?: boolean
    name?: string
  }): Promise<XeroContact[]> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      let where = ''
      if (filters?.isCustomer !== undefined) where += `IsCustomer=${filters.isCustomer}`
      if (filters?.isSupplier !== undefined) where += `${where ? ' AND ' : ''}IsSupplier=${filters.isSupplier}`
      if (filters?.name) where += `${where ? ' AND ' : ''}Name.Contains("${filters.name}")`
      
      const response = await xeroClient.contacts.get(refreshedConnection.tenantId, { where })
      
      return response.contacts.map(this.mapXeroContact)
    } catch (error) {
      console.error('Error fetching Xero contacts:', error)
      throw new Error('Failed to fetch Xero contacts')
    }
  }

  // 4. Account Management
  static async getAccounts(connection: XeroConnection, filters?: {
    type?: string
    status?: string
  }): Promise<XeroAccount[]> {
    try {
      const refreshedConnection = await this.refreshTokenIfNeeded(connection)
      
      let where = ''
      if (filters?.type) where += `Type="${filters.type}"`
      if (filters?.status) where += `${where ? ' AND ' : ''}Status="${filters.status}"`
      
      const response = await xeroClient.accounts.get(refreshedConnection.tenantId, { where })
      
      return response.accounts.map(this.mapXeroAccount)
    } catch (error) {
      console.error('Error fetching Xero accounts:', error)
      throw new Error('Failed to fetch Xero accounts')
    }
  }

  // 5. Sync Operations
  static async syncInvoices(connection: XeroConnection, jobIds: string[]): Promise<XeroSyncResult> {
    try {
      // This would integrate with your jobs table to create invoices
      const invoices = await this.getInvoices(connection)
      
      return {
        success: true,
        message: `Successfully synced ${invoices.length} invoices`,
        data: invoices
      }
    } catch (error) {
      console.error('Error syncing invoices:', error)
      return {
        success: false,
        message: 'Failed to sync invoices',
        error: error.message
      }
    }
  }

  static async syncContacts(connection: XeroConnection, clientIds: string[]): Promise<XeroSyncResult> {
    try {
      // This would integrate with your clients table to sync contacts
      const contacts = await this.getContacts(connection)
      
      return {
        success: true,
        message: `Successfully synced ${contacts.length} contacts`,
        data: contacts
      }
    } catch (error) {
      console.error('Error syncing contacts:', error)
      return {
        success: false,
        message: 'Failed to sync contacts',
        error: error.message
      }
    }
  }

  // 6. Utility Methods
  private static async refreshTokenIfNeeded(connection: XeroConnection): Promise<XeroConnection> {
    const expiresAt = new Date(connection.expiresAt)
    const now = new Date()
    
    if (expiresAt <= now) {
      return await this.refreshToken(connection)
    }
    
    return connection
  }

  private static mapXeroInvoice(xeroInvoice: XeroInvoiceRaw): XeroInvoice {
    return {
      id: xeroInvoice.invoiceID,
      invoiceNumber: xeroInvoice.invoiceNumber,
      contactId: xeroInvoice.contact.contactID,
      contactName: xeroInvoice.contact.name,
      date: xeroInvoice.date,
      dueDate: xeroInvoice.dueDate,
      total: xeroInvoice.total,
      status: xeroInvoice.status,
      currency: xeroInvoice.currencyCode,
      lineItems: xeroInvoice.lineItems.map((item: XeroLineItemRaw) => ({
        id: item.lineItemID,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitAmount,
        total: item.lineAmount,
        accountCode: item.accountCode
      }))
    }
  }

  private static mapXeroContact(xeroContact: XeroContactRaw): XeroContact {
    return {
      id: xeroContact.contactID,
      name: xeroContact.name,
      email: xeroContact.emailAddress,
      phone: xeroContact.phones?.[0]?.phoneNumber || '',
      address: xeroContact.addresses?.[0]?.addressLine1 || '',
      isCustomer: xeroContact.isCustomer,
      isSupplier: xeroContact.isSupplier
    }
  }

  private static mapXeroAccount(xeroAccount: XeroAccountRaw): XeroAccount {
    return {
      id: xeroAccount.accountID,
      code: xeroAccount.code,
      name: xeroAccount.name,
      type: xeroAccount.type,
      status: xeroAccount.status
    }
  }

  // 7. Webhook Handling
  static async handleWebhook(payload: XeroWebhookPayload): Promise<void> {
    try {
      // Handle Xero webhooks for real-time updates
      const { events } = payload
      
      for (const event of events) {
        switch (event.resourceType) {
          case 'INVOICE':
            await this.handleInvoiceWebhook(event)
            break
          case 'CONTACT':
            await this.handleContactWebhook(event)
            break
          default:
            console.log(`Unhandled webhook event: ${event.resourceType}`)
        }
      }
    } catch (error) {
      console.error('Error handling Xero webhook:', error)
      throw new Error('Failed to process webhook')
    }
  }

  private static async handleInvoiceWebhook(event: XeroWebhookEvent): Promise<void> {
    // Handle invoice updates from Xero
    console.log('Invoice webhook received:', event)
    // Implement your invoice sync logic here
  }

  private static async handleContactWebhook(event: XeroWebhookEvent): Promise<void> {
    // Handle contact updates from Xero
    console.log('Contact webhook received:', event)
    // Implement your contact sync logic here
  }
}

// Export the service
export { XeroIntegration } 