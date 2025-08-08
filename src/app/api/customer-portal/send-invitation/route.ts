import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createCustomerPortalAccount } from '@/lib/customer-portal-client'
import { getClient } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { clientId, email, temporaryPassword, customMessage, qrCodeUrl } = await request.json()

    if (!clientId || !email || !temporaryPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client information
    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create customer portal account
    const accountResult = await createCustomerPortalAccount(clientId, email, temporaryPassword)
    
    if (!accountResult.success) {
      return NextResponse.json(
        { error: accountResult.error },
        { status: 400 }
      )
    }

    // Prepare email content
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/customer-portal/login?client=${clientId}`
    
    // Use custom message if provided, otherwise use default
    const messageContent = customMessage || `Dear ${client.name},

We're excited to provide you with access to your personal customer portal! This secure dashboard gives you complete visibility into your cleaning services.

🔐 **Your Access Options:**
1. Scan the QR code below with your phone camera  
2. Visit: ${portalUrl}
3. Use the login credentials provided below

✨ **What You Can Do:**
• View your complete job history
• Track service progress and costs
• Chat with our AI assistant 24/7
• Access help and FAQ resources
• Submit feedback and ratings

Best regards,
Your Clean Report Team`

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Your Customer Portal</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .credentials-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; margin: 20px 0; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 10px 0; padding-left: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
        .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 Welcome to Your Customer Portal</h1>
        <p>Your personal dashboard for cleaning services</p>
    </div>
    
    <div class="content">
        <div style="white-space: pre-line; line-height: 1.6; margin-bottom: 20px;">
            ${messageContent}
        </div>

        ${qrCodeUrl ? `
        <div style="text-align: center; margin: 30px 0;">
            <h3>📱 Instant Access QR Code</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <img src="cid:qrcode" alt="Portal QR Code" style="width: 200px; height: 200px;" />
            </div>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">Scan with your phone camera for instant access</p>
        </div>
        ` : ''}
        
        <div class="credentials-box">
            <h3>🔑 Your Login Credentials</h3>
            <p><strong>Portal URL:</strong> <a href="${portalUrl}" style="color: #007bff;">${portalUrl}</a></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 8px; border-radius: 3px; font-family: monospace;">${temporaryPassword}</code></p>
            <div class="important">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security.
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="${portalUrl}" class="cta-button">🚀 Access Your Portal Now</a>
        </div>
        
        <div class="features">
            <h3>✨ What You Can Do:</h3>
            <div class="feature-item">📋 <strong>View Job History:</strong> See all your past, current, and future cleaning appointments</div>
            <div class="feature-item">⏱️ <strong>Track Time & Costs:</strong> Monitor allocated vs actual hours and costs</div>
            <div class="feature-item">💬 <strong>AI Assistant:</strong> Get instant answers to your questions 24/7</div>
            <div class="feature-item">📞 <strong>Easy Support:</strong> Contact us directly through the portal</div>
            <div class="feature-item">⭐ <strong>Provide Feedback:</strong> Rate your cleaning experiences</div>
            <div class="feature-item">❓ <strong>FAQ Access:</strong> Find answers to common questions</div>
        </div>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🤖 Meet Your AI Assistant</h3>
            <p>Your portal includes an intelligent AI assistant that knows about your cleaning history and can help answer questions about:</p>
            <ul>
                <li>Scheduling and rescheduling appointments</li>
                <li>Service details and pricing</li>
                <li>Preparation tips for cleaning days</li>
                <li>Account information and history</li>
            </ul>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📞 Need Help?</h3>
            <p><strong>Phone:</strong> (555) 123-4567<br>
            <strong>Email:</strong> support@cleaningservice.com<br>
            <strong>Hours:</strong> Monday-Friday 8AM-6PM, Saturday 9AM-4PM</p>
        </div>
    </div>
    
    <div class="footer">
        <p>This email was sent to ${email} because a customer portal account was created for you.</p>
        <p>If you did not request this account, please contact us immediately.</p>
    </div>
</body>
</html>
    `

    // Send welcome email
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Prepare email with QR code attachment if provided
    const emailOptions: any = {
      from: 'Customer Portal <noreply@cleaningservice.com>',
      to: [email],
      subject: 'Welcome to Your Customer Portal - Login Details Inside',
      html: emailHtml
    }

    // Add QR code as attachment if provided
    if (qrCodeUrl) {
      // Convert data URL to buffer
      const base64Data = qrCodeUrl.split(',')[1]
      const qrBuffer = Buffer.from(base64Data, 'base64')
      
      emailOptions.attachments = [
        {
          filename: `${client.name.replace(/\s+/g, '_')}_portal_qr.png`,
          content: qrBuffer,
          cid: 'qrcode',
          contentType: 'image/png'
        }
      ]
    }

    await resend.emails.send(emailOptions)

    return NextResponse.json({
      success: true,
      message: 'Customer portal invitation sent successfully'
    })

  } catch (error) {
    console.error('Error sending customer portal invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}