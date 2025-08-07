import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { emails, subject, message, qrCodeUrl, portalUrl, hasPassword } = await request.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Email addresses are required' },
        { status: 400 }
      )
    }

    if (!qrCodeUrl || !portalUrl) {
      return NextResponse.json(
        { error: 'QR code and portal URL are required' },
        { status: 400 }
      )
    }

    // Convert QR code data URL to buffer for attachment
    const qrCodeBuffer = Buffer.from(qrCodeUrl.split(',')[1], 'base64')

    // Send emails to each recipient
    const emailPromises = emails.map(async (email: string) => {
      return await resend.emails.send({
        from: 'Clean Report <noreply@cleanreport.app>',
        to: [email],
        subject: subject || 'Mobile Job Portal Access - Clean Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #22c55e;">
              <h1 style="color: #142a0a; margin: 0; font-size: 28px;">🧹 Clean Report</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Mobile Job Portal Access</p>
            </div>
            
            <div style="padding: 30px 0;">
              ${message.split('\n').map(line => 
                line.trim() 
                  ? line.startsWith('🔗') || line.startsWith('📱') || line.startsWith('📋')
                    ? `<h3 style="color: #142a0a; margin: 20px 0 10px 0;">${line}</h3>`
                    : line.startsWith('•')
                      ? `<li style="margin: 5px 0; color: #444;">${line.substring(1).trim()}</li>`
                      : line.includes('**') 
                        ? `<p style="margin: 10px 0; color: #333;"><strong>${line.replace(/\*\*(.*?)\*\*/g, '$1')}</strong></p>`
                        : `<p style="margin: 10px 0; color: #333; line-height: 1.6;">${line}</p>`
                  : '<br>'
              ).join('')}
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px;">
                <h3 style="color: #142a0a; margin: 0 0 15px 0;">Quick Access</h3>
                <a href="${portalUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">
                  📱 Open Mobile Portal
                </a>
                <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;">
                  Or scan the attached QR code with your phone camera
                </p>
                ${hasPassword ? '<p style="margin: 5px 0; color: #22c55e; font-weight: bold; font-size: 14px;">Access code included in message above</p>' : ''}
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              <p>This invitation was sent from Clean Report CRM</p>
              <p>If you have any questions, please contact your supervisor</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'mobile-portal-qr-code.png',
            content: qrCodeBuffer,
            content_type: 'image/png'
          }
        ]
      })
    })

    const results = await Promise.allSettled(emailPromises)
    
    // Check for failures
    const failures = results.filter(result => result.status === 'rejected')
    const successes = results.filter(result => result.status === 'fulfilled')

    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures)
      return NextResponse.json(
        { 
          error: 'Some emails failed to send',
          sent: successes.length,
          failed: failures.length,
          total: emails.length
        },
        { status: 207 } // 207 Multi-Status
      )
    }

    return NextResponse.json({
      success: true,
      sent: successes.length,
      message: `Successfully sent ${successes.length} invitation${successes.length > 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email invitations' },
      { status: 500 }
    )
  }
}