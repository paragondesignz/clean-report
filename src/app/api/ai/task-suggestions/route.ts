import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiTaskSuggestionEngine, prepareClientAnalysisData } from '@/lib/ai-task-suggestions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { clientId, userId } = await request.json()

    if (!clientId || !userId) {
      return NextResponse.json(
        { error: 'Client ID and User ID are required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get recurring jobs with tasks
    const { data: recurringJobs } = await supabase
      .from('recurring_jobs')
      .select(`
        *,
        jobs:jobs(
          id,
          scheduled_date,
          status,
          tasks:tasks(id, title, description, is_completed)
        )
      `)
      .eq('client_id', clientId)
      .eq('user_id', userId)

    // Get completion history (last 90 days)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    const { data: completionHistory } = await supabase
      .from('jobs')
      .select(`
        id,
        scheduled_date,
        status,
        tasks:tasks(id, title, is_completed)
      `)
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })

    // Process completion history
    const processedHistory = completionHistory?.map((job: any) => {
      const totalTasks = job.tasks?.length || 0
      const completedTasks = job.tasks?.filter((task: any) => task.is_completed).length || 0
      const skippedTasks = job.tasks?.filter((task: any) => !task.is_completed).map((task: any) => task.title) || []

      return {
        date: job.scheduled_date,
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        skipped_tasks: skippedTasks,
        job_status: job.status
      }
    }) || []

    // Process recurring jobs data
    const processedRecurringJobs = recurringJobs?.map((rJob: any) => {
      const allTasks = rJob.jobs?.flatMap((job: any) => job.tasks || []) || []
      const taskStats = allTasks.reduce((acc: any, task: any) => {
        if (!acc[task.title]) {
          acc[task.title] = { total: 0, completed: 0 }
        }
        acc[task.title].total++
        if (task.is_completed) {
          acc[task.title].completed++
        }
        return acc
      }, {})

      const tasks = Object.entries(taskStats).map(([title, stats]: [string, any]) => ({
        title,
        description: '',
        completionRate: Math.round((stats.completed / stats.total) * 100)
      }))

      return {
        id: rJob.id,
        title: rJob.title,
        frequency: rJob.frequency,
        tasks,
        createdAt: rJob.created_at,
        lastModified: rJob.updated_at || rJob.created_at
      }
    }) || []

    // Prepare data for AI analysis
    const analysisData = await prepareClientAnalysisData(
      clientId,
      client.name,
      client.property_type || 'residential',
      processedRecurringJobs,
      processedHistory
    )

    // Generate AI suggestions
    const suggestions = await aiTaskSuggestionEngine.generateTaskSuggestions(analysisData)

    // Save suggestions to database
    const savedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        const { data, error } = await supabase
          .from('task_suggestions')
          .insert([{
            user_id: userId,
            client_id: clientId,
            recurring_job_id: suggestion.recurringJobId,
            type: suggestion.type,
            title: suggestion.title,
            description: suggestion.description,
            suggested_task: suggestion.suggestedTask,
            confidence: suggestion.confidence,
            reasoning: suggestion.reasoning,
            status: suggestion.status || 'pending'
          }])
          .select()
          .single()

        if (error) {
          console.error('Error saving suggestion:', error)
          return null
        }
        return data
      })
    )

    const validSuggestions = savedSuggestions.filter(s => s !== null)

    return NextResponse.json({ 
      success: true, 
      suggestions: validSuggestions,
      count: validSuggestions.length
    })

  } catch (error) {
    console.error('Error generating task suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}