import twilio from 'twilio'

// Twilio API Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

// Types for Twilio integration
export interface TwilioConnection {
  id: string
  userId: string
  accountSid: string
  authToken: string
  phoneNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TwilioSmsLog {
  id: string
  userId: string
  jobId: string
  clientId: string
  messageSid: string
  toNumber: string
  fromNumber: string
  messageBody: string
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  errorCode?: string
  errorMessage?: string
  sentAt: string
  deliveredAt?: string
}

export interface TwilioSyncResult {
  success: boolean
  message: string
  data?: TwilioSmsLog[] | unknown
  error?: string
}

export interface SmsTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  isActive: boolean
}

// Twilio Integration Service
class TwilioIntegration {
  // 1. SMS Sending
  static async sendSms(smsData: {
    to: string
    from: string
    body: string
    connection?: TwilioConnection
  }): Promise<TwilioSmsLog> {
    try {
      const accountSid = smsData.connection?.accountSid || TWILIO_ACCOUNT_SID
      const authToken = smsData.connection?.authToken || TWILIO_AUTH_TOKEN
      const fromNumber = smsData.connection?.phoneNumber || TWILIO_PHONE_NUMBER

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured')
      }

      const client = twilio(accountSid, authToken)
      
      const message = await client.messages.create({
        body: smsData.body,
        from: fromNumber,
        to: smsData.to,
      })

      const smsLog: TwilioSmsLog = {
        id: crypto.randomUUID(),
        userId: '', // Will be set by caller
        jobId: '', // Will be set by caller
        clientId: '', // Will be set by caller
        messageSid: message.sid,
        toNumber: smsData.to,
        fromNumber: fromNumber,
        messageBody: smsData.body,
        status: message.status as TwilioSmsLog['status'],
        sentAt: new Date().toISOString(),
      }

      return smsLog
    } catch (error) {
      console.error('Error sending SMS:', error)
      throw new Error('Failed to send SMS')
    }
  }

  // 2. Bulk SMS Sending
  static async sendBulkSms(smsData: {
    recipients: Array<{
      to: string
      clientId: string
      variables?: Record<string, string>
    }>
    template: SmsTemplate
    from: string
    connection?: TwilioConnection
  }): Promise<TwilioSmsLog[]> {
    try {
      const results: TwilioSmsLog[] = []

      for (const recipient of smsData.recipients) {
        try {
          const messageBody = this.replaceTemplateVariables(
            smsData.template.content,
            recipient.variables || {}
          )

          const smsLog = await this.sendSms({
            to: recipient.to,
            from: smsData.from,
            body: messageBody,
            connection: smsData.connection,
          })

          smsLog.clientId = recipient.clientId
          results.push(smsLog)
        } catch (error) {
          console.error(`Failed to send SMS to ${recipient.to}:`, error)
          // Continue with other recipients
        }
      }

      return results
    } catch (error) {
      console.error('Error sending bulk SMS:', error)
      throw new Error('Failed to send bulk SMS')
    }
  }

  // 3. Job Reminder SMS
  static async sendJobReminder(jobData: {
    jobId: string
    clientId: string
    clientPhone: string
    clientName: string
    jobTitle: string
    scheduledDate: string
    scheduledTime: string
    connection?: TwilioConnection
  }): Promise<TwilioSmsLog> {
    try {
      const messageBody = `Hi ${jobData.clientName}, this is a reminder that your cleaning service "${jobData.jobTitle}" is scheduled for ${jobData.scheduledDate} at ${jobData.scheduledTime}. We'll see you soon!`

      const smsLog = await this.sendSms({
        to: jobData.clientPhone,
        from: jobData.connection?.phoneNumber || TWILIO_PHONE_NUMBER!,
        body: messageBody,
        connection: jobData.connection,
      })

      smsLog.jobId = jobData.jobId
      smsLog.clientId = jobData.clientId

      return smsLog
    } catch (error) {
      console.error('Error sending job reminder:', error)
      throw new Error('Failed to send job reminder')
    }
  }

  // 4. Job Status Update SMS
  static async sendJobStatusUpdate(jobData: {
    jobId: string
    clientId: string
    clientPhone: string
    clientName: string
    jobTitle: string
    status: 'in_progress' | 'completed' | 'cancelled'
    connection?: TwilioConnection
  }): Promise<TwilioSmsLog> {
    try {
      let messageBody = ''
      
      switch (jobData.status) {
        case 'in_progress':
          messageBody = `Hi ${jobData.clientName}, we've started your cleaning service "${jobData.jobTitle}". We'll notify you when we're finished!`
          break
        case 'completed':
          messageBody = `Hi ${jobData.clientName}, your cleaning service "${jobData.jobTitle}" has been completed. Thank you for choosing our services!`
          break
        case 'cancelled':
          messageBody = `Hi ${jobData.clientName}, your cleaning service "${jobData.jobTitle}" has been cancelled. Please contact us to reschedule.`
          break
      }

      const smsLog = await this.sendSms({
        to: jobData.clientPhone,
        from: jobData.connection?.phoneNumber || TWILIO_PHONE_NUMBER!,
        body: messageBody,
        connection: jobData.connection,
      })

      smsLog.jobId = jobData.jobId
      smsLog.clientId = jobData.clientId

      return smsLog
    } catch (error) {
      console.error('Error sending job status update:', error)
      throw new Error('Failed to send job status update')
    }
  }

  // 5. Payment Reminder SMS
  static async sendPaymentReminder(paymentData: {
    jobId: string
    clientId: string
    clientPhone: string
    clientName: string
    jobTitle: string
    amount: number
    dueDate: string
    paymentUrl?: string
    connection?: TwilioConnection
  }): Promise<TwilioSmsLog> {
    try {
      let messageBody = `Hi ${paymentData.clientName}, this is a friendly reminder that payment of $${paymentData.amount} for your cleaning service "${paymentData.jobTitle}" is due on ${paymentData.dueDate}.`
      
      if (paymentData.paymentUrl) {
        messageBody += ` You can pay online at: ${paymentData.paymentUrl}`
      }

      const smsLog = await this.sendSms({
        to: paymentData.clientPhone,
        from: paymentData.connection?.phoneNumber || TWILIO_PHONE_NUMBER!,
        body: messageBody,
        connection: paymentData.connection,
      })

      smsLog.jobId = paymentData.jobId
      smsLog.clientId = paymentData.clientId

      return smsLog
    } catch (error) {
      console.error('Error sending payment reminder:', error)
      throw new Error('Failed to send payment reminder')
    }
  }

  // 6. Message Status Checking
  static async getMessageStatus(messageSid: string, connection?: TwilioConnection): Promise<string> {
    try {
      const accountSid = connection?.accountSid || TWILIO_ACCOUNT_SID
      const authToken = connection?.authToken || TWILIO_AUTH_TOKEN

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured')
      }

      const client = twilio(accountSid, authToken)
      const message = await client.messages(messageSid).fetch()
      
      return message.status
    } catch (error) {
      console.error('Error getting message status:', error)
      throw new Error('Failed to get message status')
    }
  }

  // 7. Account Information
  static async getAccountInfo(connection?: TwilioConnection): Promise<{
    accountSid: string
    friendlyName: string
    status: string
    balance: string
  }> {
    try {
      const accountSid = connection?.accountSid || TWILIO_ACCOUNT_SID
      const authToken = connection?.authToken || TWILIO_AUTH_TOKEN

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured')
      }

      const client = twilio(accountSid, authToken)
      const account = await client.api.accounts(accountSid).fetch()
      
      return {
        accountSid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        balance: account.balance?.toString() || '0',
      }
    } catch (error) {
      console.error('Error getting account info:', error)
      throw new Error('Failed to get account info')
    }
  }

  // 8. Phone Number Validation
  static async validatePhoneNumber(phoneNumber: string): Promise<{
    valid: boolean
    formattedNumber?: string
    countryCode?: string
    carrier?: string
  }> {
    try {
      const accountSid = TWILIO_ACCOUNT_SID
      const authToken = TWILIO_AUTH_TOKEN

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured')
      }

      const client = twilio(accountSid, authToken)
      const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch()

      return {
        valid: true,
        formattedNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        carrier: 'Unknown',
      }
    } catch (error) {
      console.error('Error validating phone number:', error)
      return {
        valid: false,
      }
    }
  }

  // 9. Template Management
  static getDefaultTemplates(): SmsTemplate[] {
    return [
      {
        id: 'job-reminder',
        name: 'Job Reminder',
        content: 'Hi {{clientName}}, this is a reminder that your cleaning service "{{jobTitle}}" is scheduled for {{scheduledDate}} at {{scheduledTime}}. We\'ll see you soon!',
        variables: ['clientName', 'jobTitle', 'scheduledDate', 'scheduledTime'],
        isActive: true,
      },
      {
        id: 'job-completed',
        name: 'Job Completed',
        content: 'Hi {{clientName}}, your cleaning service "{{jobTitle}}" has been completed. Thank you for choosing our services!',
        variables: ['clientName', 'jobTitle'],
        isActive: true,
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        content: 'Hi {{clientName}}, this is a friendly reminder that payment of ${{amount}} for your cleaning service "{{jobTitle}}" is due on {{dueDate}}.',
        variables: ['clientName', 'amount', 'jobTitle', 'dueDate'],
        isActive: true,
      },
      {
        id: 'job-cancelled',
        name: 'Job Cancelled',
        content: 'Hi {{clientName}}, your cleaning service "{{jobTitle}}" has been cancelled. Please contact us to reschedule.',
        variables: ['clientName', 'jobTitle'],
        isActive: true,
      },
    ]
  }

  // 10. Utility Methods
  private static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      result = result.replace(new RegExp(placeholder, 'g'), value)
    }
    
    return result
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Add +1 prefix if it's a US number without country code
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    }
    
    // Add + if it doesn't have one
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`
    }
    
    return cleaned
  }

  // 11. Sync Operations
  static async syncSmsLogs(connection: TwilioConnection, jobIds: string[]): Promise<TwilioSyncResult> {
    try {
      // This would integrate with your jobs table to sync SMS logs
      const client = twilio(connection.accountSid, connection.authToken)
      
      const messages = await client.messages.list({
        limit: 100,
        dateSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      })

      const smsLogs: TwilioSmsLog[] = messages.map(message => ({
        id: crypto.randomUUID(),
        userId: connection.userId,
        jobId: '', // Would be extracted from metadata
        clientId: '', // Would be extracted from metadata
        messageSid: message.sid,
        toNumber: message.to,
        fromNumber: message.from,
        messageBody: message.body,
        status: message.status as TwilioSmsLog['status'],
        sentAt: message.dateCreated.toISOString(),
        deliveredAt: message.dateUpdated.toISOString(),
      }))

      return {
        success: true,
        message: `Successfully synced ${smsLogs.length} SMS logs`,
        data: smsLogs,
      }
    } catch (error) {
      console.error('Error syncing SMS logs:', error)
      return {
        success: false,
        message: 'Failed to sync SMS logs',
        error: error.message,
      }
    }
  }
}

// Export the service
export { TwilioIntegration } 