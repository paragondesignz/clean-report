import { UserProfile } from "@/types/database"

interface BookingNotificationData {
  userProfile: UserProfile
  bookingData: {
    client_name: string
    client_email: string
    client_phone: string
    requested_date: string
    requested_time: string
    service_types: string[]
    description: string
  }
  bookingToken: string
}

export const sendBookingNotification = async (data: BookingNotificationData) => {
  const { userProfile, bookingData, bookingToken } = data
  
  // Format the service types for display
  const serviceTypesDisplay = bookingData.service_types
    .map(type => {
      const serviceMap: Record<string, string> = {
        'general_cleaning': 'General Cleaning',
        'deep_cleaning': 'Deep Cleaning',
        'kitchen_cleaning': 'Kitchen Cleaning',
        'bathroom_cleaning': 'Bathroom Cleaning',
        'carpet_cleaning': 'Carpet Cleaning',
        'window_cleaning': 'Window Cleaning',
        'move_in_out': 'Move In/Out Cleaning'
      }
      return serviceMap[type] || type
    })
    .join(', ')

  // Format the date and time
  const formattedDate = new Date(bookingData.requested_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = new Date(`2000-01-01T${bookingData.requested_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const emailContent = `
New Booking Request Received

A new booking request has been submitted through your booking portal.

Client Details:
- Name: ${bookingData.client_name}
- Email: ${bookingData.client_email}
- Phone: ${bookingData.client_phone}

Service Details:
- Services Requested: ${serviceTypesDisplay}
- Preferred Date: ${formattedDate}
- Preferred Time: ${formattedTime}
${bookingData.description ? `- Additional Details: ${bookingData.description}` : ''}

Booking Token: ${bookingToken}

This booking has been automatically created as a job with 'enquiry' status in your dashboard. You can review and schedule it from there.

---
${userProfile.company_name}
${userProfile.contact_email ? `Email: ${userProfile.contact_email}` : ''}
${userProfile.contact_phone ? `Phone: ${userProfile.contact_phone}` : ''}
${userProfile.website_url ? `Website: ${userProfile.website_url}` : ''}
  `.trim()

  // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
  // For now, we'll simulate sending the email
  console.log('Sending booking notification email:')
  console.log('To:', userProfile.contact_email || 'admin@company.com')
  console.log('Subject: New Booking Request - ' + bookingData.client_name)
  console.log('Content:', emailContent)

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    success: true,
    message: 'Booking notification email sent successfully'
  }
}

export const sendBookingConfirmation = async (data: {
  userProfile: UserProfile
  bookingData: {
    client_name: string
    client_email: string
    client_phone: string
    requested_date: string
    requested_time: string
    service_types: string[]
    description: string
  }
  bookingToken: string
  jobId: string
}) => {
  const { userProfile, bookingData, bookingToken, jobId } = data
  
  const serviceTypesDisplay = bookingData.service_types
    .map(type => {
      const serviceMap: Record<string, string> = {
        'general_cleaning': 'General Cleaning',
        'deep_cleaning': 'Deep Cleaning',
        'kitchen_cleaning': 'Kitchen Cleaning',
        'bathroom_cleaning': 'Bathroom Cleaning',
        'carpet_cleaning': 'Carpet Cleaning',
        'window_cleaning': 'Window Cleaning',
        'move_in_out': 'Move In/Out Cleaning'
      }
      return serviceMap[type] || type
    })
    .join(', ')

  const formattedDate = new Date(bookingData.requested_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = new Date(`2000-01-01T${bookingData.requested_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const emailContent = `
Booking Request Confirmation

Dear ${bookingData.client_name},

Thank you for your booking request with ${userProfile.company_name}. We have received your request and will review it shortly.

Booking Details:
- Services Requested: ${serviceTypesDisplay}
- Preferred Date: ${formattedDate}
- Preferred Time: ${formattedTime}
${bookingData.description ? `- Additional Details: ${bookingData.description}` : ''}

Booking Reference: ${bookingToken}

We will contact you within 24 hours to confirm your booking and discuss any specific requirements.

If you have any questions, please don't hesitate to contact us.

Best regards,
${userProfile.company_name} Team

---
${userProfile.contact_email ? `Email: ${userProfile.contact_email}` : ''}
${userProfile.contact_phone ? `Phone: ${userProfile.contact_phone}` : ''}
${userProfile.website_url ? `Website: ${userProfile.website_url}` : ''}
  `.trim()

  // TODO: Integrate with actual email service
  console.log('Sending booking confirmation email:')
  console.log('To:', bookingData.client_email)
  console.log('Subject: Booking Request Confirmation - ' + userProfile.company_name)
  console.log('Content:', emailContent)

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    success: true,
    message: 'Booking confirmation email sent successfully'
  }
} 