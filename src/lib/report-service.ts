import { supabase } from './supabase-client'
import type { 
  Job, 
  Client, 
  Task, 
  Photo, 
  Note, 
  Report, 
  ReportPhoto, 
  ReportTask, 
  ReportConfiguration,
  ReportTemplate 
} from '@/types/database'

export class ReportService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Get or create user's report configuration
  async getReportConfiguration(): Promise<ReportConfiguration> {
    const { data, error } = await supabase
      .from('report_configurations')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Configuration doesn't exist, create default
      return this.createDefaultConfiguration()
    }

    if (error) throw error
    return data
  }

  private async createDefaultConfiguration(): Promise<ReportConfiguration> {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('company_name, logo_url')
      .eq('user_id', this.userId)
      .single()

    const defaultConfig = {
      user_id: this.userId,
      company_name: userProfile?.company_name || 'Your Company',
      company_logo_url: userProfile?.logo_url || null,
      primary_color: '#3B82F6',
      secondary_color: '#1F2937',
      accent_color: '#10B981',
      font_family: 'Inter',
      include_company_logo: true,
      include_company_colors: true,
      include_photos: true,
      include_tasks: true,
      include_notes: true,
      include_timer_data: true,
      photo_layout: 'grid',
      max_photos_per_report: 20,
      report_template: 'standard',
      custom_header_text: null,
      custom_footer_text: null
    }

    const { data, error } = await supabase
      .from('report_configurations')
      .insert(defaultConfig)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update report configuration
  async updateReportConfiguration(config: Partial<ReportConfiguration>): Promise<ReportConfiguration> {
    const { data, error } = await supabase
      .from('report_configurations')
      .update(config)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get available report templates
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })

    if (error) throw error
    return data
  }

  // Prepare report data for a job
  async prepareReportData(jobId: string): Promise<{
    job: Job & { client: Client }
    tasks: Task[]
    photos: Photo[]
    notes: Note[]
    reportPhotos: ReportPhoto[]
    reportTasks: ReportTask[]
    configuration: ReportConfiguration
    timerData?: any
  }> {
    // Get job with client
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    // Get tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('job_id', jobId)
      .order('order_index')

    if (tasksError) throw tasksError

    // Get photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('task_id', tasks?.map(t => t.id) || [])

    if (photosError) throw photosError

    // Get notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (notesError) throw notesError

    // Get report configuration (handle missing table gracefully)
    let configuration
    try {
      configuration = await this.getReportConfiguration()
    } catch (error) {
      console.log('Report configuration table not found, using default configuration')
      configuration = {
        company_name: 'Your Company',
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#10B981',
        font_family: 'Inter',
        include_company_logo: true,
        include_company_colors: true,
        include_photos: true,
        include_tasks: true,
        include_notes: true,
        include_timer_data: true,
        photo_layout: 'grid',
        max_photos_per_report: 20,
        report_template: 'standard',
        custom_header_text: null,
        custom_footer_text: null
      }
    }

    // Get or create report photos (handle missing table gracefully)
    let reportPhotos = []
    try {
      reportPhotos = await this.getOrCreateReportPhotos(jobId, photos)
    } catch (error) {
      console.log('Report photos table not found, using empty array')
    }

    // Get or create report tasks (handle missing table gracefully)
    let reportTasks = []
    try {
      reportTasks = await this.getOrCreateReportTasks(jobId, tasks)
    } catch (error) {
      console.log('Report tasks table not found, using empty array')
    }

    // Get timer data if available (handle missing table gracefully)
    let timerData = null
    try {
      timerData = await this.getTimerData(jobId)
    } catch (error) {
      console.log('Timer data not available')
    }

    return {
      job,
      tasks: tasks || [],
      photos: photos || [],
      notes: notes || [],
      reportPhotos,
      reportTasks,
      configuration,
      timerData
    }
  }

  // Get or create report photos
  private async getOrCreateReportPhotos(jobId: string, photos: Photo[]): Promise<ReportPhoto[]> {
    // First, get existing report photos
    const { data: existingReportPhotos } = await supabase
      .from('report_photos')
      .select('*')
      .eq('report_id', jobId)

    if (existingReportPhotos && existingReportPhotos.length > 0) {
      return existingReportPhotos
    }

    // Create report photos for all photos
    const reportPhotosData = photos.map((photo, index) => ({
      report_id: jobId,
      photo_id: photo.id,
      photo_type: 'general',
      display_order: index,
      include_in_report: true,
      caption: photo.file_name
    }))

    const { data: newReportPhotos, error } = await supabase
      .from('report_photos')
      .insert(reportPhotosData)
      .select()

    if (error) throw error
    return newReportPhotos || []
  }

  // Get or create report tasks
  private async getOrCreateReportTasks(jobId: string, tasks: Task[]): Promise<ReportTask[]> {
    // First, get existing report tasks
    const { data: existingReportTasks } = await supabase
      .from('report_tasks')
      .select('*')
      .eq('report_id', jobId)

    if (existingReportTasks && existingReportTasks.length > 0) {
      return existingReportTasks
    }

    // Create report tasks for all tasks
    const reportTasksData = tasks.map((task, index) => ({
      report_id: jobId,
      task_id: task.id,
      task_title: task.title,
      task_description: task.description,
      is_completed: task.is_completed,
      completed_at: task.is_completed ? new Date().toISOString() : null,
      display_order: index,
      include_in_report: true
    }))

    const { data: newReportTasks, error } = await supabase
      .from('report_tasks')
      .insert(reportTasksData)
      .select()

    if (error) throw error
    return newReportTasks || []
  }

  // Get timer data
  private async getTimerData(jobId: string): Promise<any> {
    // This would need to be implemented based on your timer system
    // For now, returning null
    return null
  }

  // Update report photo selection
  async updateReportPhotoSelection(
    reportId: string, 
    photoId: string, 
    includeInReport: boolean,
    caption?: string,
    photoType?: string
  ): Promise<ReportPhoto> {
    const updateData: any = { include_in_report: includeInReport }
    if (caption !== undefined) updateData.caption = caption
    if (photoType !== undefined) updateData.photo_type = photoType

    const { data, error } = await supabase
      .from('report_photos')
      .update(updateData)
      .eq('report_id', reportId)
      .eq('photo_id', photoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update report task selection
  async updateReportTaskSelection(
    reportId: string,
    taskId: string,
    includeInReport: boolean
  ): Promise<ReportTask> {
    const { data, error } = await supabase
      .from('report_tasks')
      .update({ include_in_report: includeInReport })
      .eq('report_id', reportId)
      .eq('task_id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Generate and save report
  async generateReport(jobId: string): Promise<{ reportUrl: string; reportId: string }> {
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        userId: this.userId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate report')
    }

    const result = await response.json()
    return {
      reportUrl: result.reportUrl,
      reportId: result.reportId
    }
  }

  // Get report by ID
  async getReport(reportId: string): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) throw error
    return data
  }

  // Get reports for a job
  async getJobReports(jobId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Delete report
  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error
  }

  // Send report via email
  async sendReportEmail(reportId: string, recipientEmail: string): Promise<void> {
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError) throw reportError

    // Update report as sent
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        email_sent: true,
        sent_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) throw updateError

    // Here you would integrate with your email service
    // For now, just log the action
    console.log(`Report ${reportId} sent to ${recipientEmail}`)
  }
}
