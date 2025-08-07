import jsPDF from 'jspdf'
import type { Job, Client, UserProfile, Report } from '@/types/database'

interface PDFOptions {
  job: Job
  client: Client
  userProfile: UserProfile
  report: Report
}

export class PDFGenerator {
  private doc: jsPDF
  private options: PDFOptions
  private currentY: number = 20
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor(options: PDFOptions) {
    this.options = options
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin
  }

  private addNewPage() {
    this.doc.addPage()
    this.currentY = this.margin
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage()
    }
  }

  private addHeader() {
    const { userProfile } = this.options
    
    // Company logo placeholder (you can add actual logo later)
    this.doc.setFillColor(59, 130, 246) // Blue color
    this.doc.rect(this.margin, this.currentY, 30, 15, 'F')
    
    // Company name
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(59, 130, 246)
    this.doc.text(userProfile.company_name || 'Clean Report', this.margin + 35, this.currentY + 10)
    
    // Report title
    this.doc.setFontSize(14)
    this.doc.setTextColor(107, 114, 128) // Gray
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Professional Cleaning Service Report', this.margin + 35, this.currentY + 20)
    
    this.currentY += 40
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(15)
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(31, 41, 55) // Dark gray
    this.doc.text(title, this.margin, this.currentY)
    
    // Underline
    this.doc.setDrawColor(229, 231, 235) // Light gray
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)
    
    this.currentY += 20
  }

  private addDetailRow(label: string, value: string, requiredSpace: number = 8) {
    this.checkPageBreak(requiredSpace)
    
    // Label
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(75, 85, 99) // Medium gray
    this.doc.text(label + ':', this.margin, this.currentY)
    
    // Value
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(31, 41, 55) // Dark gray
    
    // Handle long text wrapping
    const maxWidth = this.pageWidth - (this.margin * 2) - 40 // 40 for label space
    const lines = this.doc.splitTextToSize(value, maxWidth)
    
    if (lines.length === 1) {
      this.doc.text(value, this.margin + 40, this.currentY)
      this.currentY += 8
    } else {
      this.doc.text(lines[0], this.margin + 40, this.currentY)
      this.currentY += 8
      
      for (let i = 1; i < lines.length; i++) {
        this.checkPageBreak(8)
        this.doc.text(lines[i], this.margin + 40, this.currentY)
        this.currentY += 8
      }
    }
  }

  private addServiceDetails() {
    this.addSectionTitle('Service Details')
    
    const { job } = this.options
    
    this.addDetailRow('Service Title', job.title)
    this.addDetailRow('Date', new Date(job.scheduled_date).toLocaleDateString())
    this.addDetailRow('Time', job.scheduled_time ? new Date(`2000-01-01T${job.scheduled_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not specified')
    this.addDetailRow('Status', job?.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN')
    
    if (job.description) {
      this.addDetailRow('Description', job.description, 12)
    }
    
    this.currentY += 10
  }

  private addClientInformation() {
    this.addSectionTitle('Client Information')
    
    const { client } = this.options
    
    this.addDetailRow('Name', client.name)
    this.addDetailRow('Email', client.email)
    this.addDetailRow('Phone', client.phone || 'Not provided')
    
    if (client.address) {
      this.addDetailRow('Address', client.address, 12)
    }
    
    this.currentY += 10
  }

  private addCompanyInformation() {
    this.addSectionTitle('Company Information')
    
    const { userProfile } = this.options
    
    this.addDetailRow('Company', userProfile.company_name || 'Clean Report')
    
    if (userProfile.contact_email) {
      this.addDetailRow('Contact Email', userProfile.contact_email)
    }
    
    if (userProfile.contact_phone) {
      this.addDetailRow('Contact Phone', userProfile.contact_phone)
    }
    
    if (userProfile.website_url) {
      this.addDetailRow('Website', userProfile.website_url)
    }
    
    this.currentY += 10
  }

  private addReportInformation() {
    this.addSectionTitle('Report Information')
    
    const { report } = this.options
    
    this.addDetailRow('Report ID', report.id)
    this.addDetailRow('Generated', new Date(report.created_at).toLocaleString())
    this.addDetailRow('Email Status', report.email_sent ? 'Sent' : 'Pending')
    
    if (report.email_sent && report.sent_at) {
      this.addDetailRow('Sent Date', new Date(report.sent_at).toLocaleString())
    }
    
    this.currentY += 10
  }

  private addFooter() {
    const { userProfile } = this.options
    
    this.checkPageBreak(30)
    
    // Separator line
    this.doc.setDrawColor(229, 231, 235)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
    
    // Footer text
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(107, 114, 128)
    
    const footerText = `Thank you for choosing ${userProfile.company_name || 'Clean Report'}!`
    const footerWidth = this.doc.getTextWidth(footerText)
    this.doc.text(footerText, (this.pageWidth - footerWidth) / 2, this.currentY)
    
    this.currentY += 5
    
    const contactText = 'For questions or concerns, please contact us.'
    const contactWidth = this.doc.getTextWidth(contactText)
    this.doc.text(contactText, (this.pageWidth - contactWidth) / 2, this.currentY)
    
    this.currentY += 5
    
    const dateText = `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    const dateWidth = this.doc.getTextWidth(dateText)
    this.doc.text(dateText, (this.pageWidth - dateWidth) / 2, this.currentY)
  }

  private addRatingSection() {
    this.addSectionTitle('Rate Our Service')
    
    this.checkPageBreak(40)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(75, 85, 99)
    
    const ratingText = 'We value your feedback! Please rate your experience with our service.'
    const ratingLines = this.doc.splitTextToSize(ratingText, this.pageWidth - (this.margin * 2))
    
    for (const line of ratingLines) {
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    }
    
    this.currentY += 10
    
    // Rating stars placeholder
    this.doc.setFontSize(14)
    this.doc.setTextColor(251, 191, 36) // Yellow for stars
    this.doc.text('★★★★★', this.margin, this.currentY)
    
    this.currentY += 15
    
    // Rating link
    this.doc.setFontSize(10)
    this.doc.setTextColor(59, 130, 246) // Blue for link
    this.doc.text('Click here to rate: ', this.margin, this.currentY)
    
    const feedbackUrl = `${window.location.origin}/feedback/${this.options.report.id}`
    this.doc.text(feedbackUrl, this.margin + 35, this.currentY)
    
    this.currentY += 20
  }

  public generate(): jsPDF {
    // Add header to first page
    this.addHeader()
    
    // Add content sections
    this.addServiceDetails()
    this.addClientInformation()
    this.addCompanyInformation()
    this.addReportInformation()
    
    // Add rating section
    this.addRatingSection()
    
    // Add footer
    this.addFooter()
    
    return this.doc
  }

  public download(filename?: string): void {
    const { report } = this.options
    const defaultFilename = `clean-report-${report.id}.pdf`
    this.doc.save(filename || defaultFilename)
  }
}

export function generateBrandedPDF(options: PDFOptions): jsPDF {
  const generator = new PDFGenerator(options)
  return generator.generate()
}

export function downloadBrandedPDF(options: PDFOptions, filename?: string): void {
  const generator = new PDFGenerator(options)
  generator.generate()
  generator.download(filename)
} 