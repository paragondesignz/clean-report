#!/usr/bin/env node

/**
 * Script to populate Clean Report app with comprehensive dummy data
 * Matches actual database schema
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = '8d68f0b0-1fd0-4235-afc5-3b2fd9ec1f05'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...')
  
  // Clear in correct order due to foreign keys
  const tables = ['tasks', 'notes', 'photos', 'reports', 'job_supplies', 'job_assignments', 
                  'jobs', 'recurring_jobs', 'booking_requests', 'feedback', 'supplies', 
                  'staff_members', 'service_types', 'clients']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)
      if (error && !error.message.includes('does not exist')) {
        console.error(`Error clearing ${table}:`, error.message)
      } else {
        console.log(`✅ Cleared ${table}`)
      }
    } catch (err) {
      console.log(`⚠️  Table ${table} might not exist or already empty`)
    }
  }
}

async function insertServiceTypes() {
  console.log('📝 Adding service types...')
  
  const serviceTypes = [
    {
      user_id: userId,
      name: 'Standard House Cleaning',
      description: 'Regular cleaning including bathrooms, kitchen, living areas, and bedrooms',
      is_active: true
    },
    {
      user_id: userId,
      name: 'Deep House Cleaning',
      description: 'Comprehensive cleaning including inside appliances, baseboards, windows',
      is_active: true
    },
    {
      user_id: userId,
      name: 'Move-In/Move-Out Cleaning',
      description: 'Complete cleaning for property transitions',
      is_active: true
    },
    {
      user_id: userId,
      name: 'Post-Construction Cleanup',
      description: 'Cleaning after construction or renovation work',
      is_active: true
    },
    {
      user_id: userId,
      name: 'Window Cleaning',
      description: 'Interior and exterior window cleaning service',
      is_active: true
    }
  ]
  
  const { data, error } = await supabase.from('service_types').insert(serviceTypes).select()
  
  if (error) {
    console.error('❌ Error inserting service types:', error.message)
  } else {
    console.log(`✅ Added ${data.length} service types`)
  }
  
  return data
}

async function insertClients() {
  console.log('📝 Adding clients...')
  
  const clients = [
    {
      user_id: userId,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      address: '123 Maple Street, Springfield, MA 01103'
    },
    {
      user_id: userId,
      name: 'Michael & Lisa Chen',
      email: 'mchen@email.com',
      phone: '(555) 234-5678',
      address: '456 Oak Avenue, Springfield, MA 01104'
    },
    {
      user_id: userId,
      name: 'Robert Thompson',
      email: 'r.thompson@email.com',
      phone: '(555) 345-6789',
      address: '789 Pine Road, Springfield, MA 01105'
    },
    {
      user_id: userId,
      name: 'Jennifer Martinez',
      email: 'jen.martinez@email.com',
      phone: '(555) 456-7890',
      address: '321 Elm Drive, Springfield, MA 01106'
    },
    {
      user_id: userId,
      name: 'David & Amy Wilson',
      email: 'dwilson@email.com',
      phone: '(555) 567-8901',
      address: '654 Cedar Lane, Springfield, MA 01107'
    },
    {
      user_id: userId,
      name: 'Margaret Foster',
      email: 'margaret.f@email.com',
      phone: '(555) 678-9012',
      address: '987 Birch Street, Springfield, MA 01108'
    },
    {
      user_id: userId,
      name: 'James Rodriguez',
      email: 'jrodriguez@email.com',
      phone: '(555) 789-0123',
      address: '147 Spruce Court, Springfield, MA 01109'
    },
    {
      user_id: userId,
      name: 'Patricia Davis',
      email: 'pdavis@email.com',
      phone: '(555) 901-2345',
      address: '369 Poplar Place, Springfield, MA 01111'
    },
    {
      user_id: userId,
      name: 'Steven Lee',
      email: 'steven.lee@email.com',
      phone: '(555) 012-3456',
      address: '741 Ash Avenue, Springfield, MA 01112'
    },
    {
      user_id: userId,
      name: 'Emma Richardson',
      email: 'emma.r@email.com',
      phone: '(555) 123-9876',
      address: '852 Chestnut Street, Springfield, MA 01113'
    },
    {
      user_id: userId,
      name: 'Kevin Murphy',
      email: 'kmurphy@email.com',
      phone: '(555) 234-8765',
      address: '963 Hickory Road, Springfield, MA 01114'
    },
    {
      user_id: userId,
      name: 'Michelle Wright',
      email: 'mwright@email.com',
      phone: '(555) 345-7654',
      address: '159 Magnolia Drive, Springfield, MA 01115'
    }
  ]
  
  const { data, error } = await supabase.from('clients').insert(clients).select()
  
  if (error) {
    console.error('❌ Error inserting clients:', error.message)
  } else {
    console.log(`✅ Added ${data.length} clients`)
  }
  
  return data
}

async function insertStaffMembers() {
  console.log('📝 Adding staff members...')
  
  const staff = [
    {
      user_id: userId,
      name: 'Maria Gonzalez',
      email: 'maria.g@cleanteam.com',
      phone: '(555) 111-2222',
      role: 'Senior Cleaner',
      hourly_rate: 22.00,
      is_active: true
    },
    {
      user_id: userId,
      name: 'John Anderson',
      email: 'john.a@cleanteam.com',
      phone: '(555) 222-3333',
      role: 'Cleaner',
      hourly_rate: 18.00,
      is_active: true
    },
    {
      user_id: userId,
      name: 'Sofia Petrov',
      email: 'sofia.p@cleanteam.com',
      phone: '(555) 333-4444',
      role: 'Cleaner',
      hourly_rate: 19.50,
      is_active: true
    },
    {
      user_id: userId,
      name: 'Carlos Rivera',
      email: 'carlos.r@cleanteam.com',
      phone: '(555) 444-5555',
      role: 'Senior Cleaner',
      hourly_rate: 21.00,
      is_active: true
    }
  ]
  
  const { data, error } = await supabase.from('staff_members').insert(staff).select()
  
  if (error) {
    console.error('❌ Error inserting staff:', error.message)
  } else {
    console.log(`✅ Added ${data.length} staff members`)
  }
  
  return data
}

async function insertSupplies() {
  console.log('📝 Adding supplies...')
  
  const supplies = [
    {
      user_id: userId,
      name: 'All-Purpose Cleaner',
      current_stock: 24,
      low_stock_threshold: 6,
      unit_cost: 4.50,
      supplier: 'CleanPro Supply Co.'
    },
    {
      user_id: userId,
      name: 'Disinfectant Spray',
      current_stock: 18,
      low_stock_threshold: 5,
      unit_cost: 6.25,
      supplier: 'CleanPro Supply Co.'
    },
    {
      user_id: userId,
      name: 'Glass Cleaner',
      current_stock: 15,
      low_stock_threshold: 4,
      unit_cost: 3.75,
      supplier: 'CleanPro Supply Co.'
    },
    {
      user_id: userId,
      name: 'Microfiber Cloths',
      current_stock: 45,
      low_stock_threshold: 15,
      unit_cost: 2.20,
      supplier: 'Cleaning Warehouse'
    },
    {
      user_id: userId,
      name: 'Rubber Gloves (Large)',
      current_stock: 30,
      low_stock_threshold: 10,
      unit_cost: 1.25,
      supplier: 'Safety First Supply'
    },
    {
      user_id: userId,
      name: 'Paper Towels',
      current_stock: 36,
      low_stock_threshold: 12,
      unit_cost: 2.80,
      supplier: 'Office Depot'
    },
    {
      user_id: userId,
      name: 'Toilet Brushes',
      current_stock: 12,
      low_stock_threshold: 4,
      unit_cost: 3.50,
      supplier: 'Cleaning Warehouse'
    },
    {
      user_id: userId,
      name: 'Vacuum Bags',
      current_stock: 25,
      low_stock_threshold: 10,
      unit_cost: 1.85,
      supplier: 'Equipment Supply'
    }
  ]
  
  const { data, error } = await supabase.from('supplies').insert(supplies).select()
  
  if (error) {
    console.error('❌ Error inserting supplies:', error.message)
  } else {
    console.log(`✅ Added ${data.length} supplies`)
  }
  
  return data
}

async function insertRecurringJobs(clients) {
  console.log('📝 Adding recurring jobs...')
  
  if (!clients || clients.length === 0) return []
  
  const recurringJobs = [
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Sarah Johnson')?.id,
      title: 'Weekly House Cleaning - Sarah Johnson',
      description: 'Regular weekly cleaning including all rooms, with special attention to pet areas',
      frequency: 'weekly',
      start_date: '2024-05-21',
      scheduled_time: '09:00:00',
      is_active: true
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Michael & Lisa Chen')?.id,
      title: 'Bi-weekly Cleaning - Chen Family',
      description: 'Thorough bi-weekly cleaning with eco-friendly products',
      frequency: 'bi_weekly',
      start_date: '2024-05-27',
      scheduled_time: '10:30:00',
      is_active: true
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Jennifer Martinez')?.id,
      title: 'Weekly Office Clean - Martinez',
      description: 'Weekly cleaning with focus on home office sanitization',
      frequency: 'weekly',
      start_date: '2024-06-14',
      scheduled_time: '08:00:00',
      is_active: true
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Margaret Foster')?.id,
      title: 'Senior Care Weekly - Foster',
      description: 'Gentle weekly cleaning with special care for antiques',
      frequency: 'weekly',
      start_date: '2024-06-24',
      scheduled_time: '11:00:00',
      is_active: true
    }
  ]
  
  const { data, error } = await supabase.from('recurring_jobs').insert(recurringJobs).select()
  
  if (error) {
    console.error('❌ Error inserting recurring jobs:', error.message)
  } else {
    console.log(`✅ Added ${data.length} recurring jobs`)
  }
  
  return data
}

async function insertJobs(clients, recurringJobs) {
  console.log('📝 Adding jobs (3 months of history)...')
  
  if (!clients || clients.length === 0) return []
  
  const jobs = [
    // Completed jobs from recent months
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Sarah Johnson')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Sarah Johnson'))?.id,
      title: 'Weekly Cleaning - Sarah Johnson',
      description: 'Regular weekly cleaning with pet-safe products',
      scheduled_date: '2024-07-30',
      scheduled_time: '09:00:00',
      end_time: '11:30:00',
      status: 'completed',
      agreed_hours: 2.5,
      actual_hours: 2.5,
      total_cost: 120.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Sarah Johnson')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Sarah Johnson'))?.id,
      title: 'Weekly Cleaning - Sarah Johnson',
      description: 'Regular cleaning',
      scheduled_date: '2024-08-06',
      scheduled_time: '09:00:00',
      end_time: '11:15:00',
      status: 'completed',
      agreed_hours: 2.5,
      actual_hours: 2.25,
      total_cost: 120.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Michael & Lisa Chen')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Chen'))?.id,
      title: 'Bi-weekly Cleaning - Chen Family',
      description: 'Deep clean with eco-friendly products',
      scheduled_date: '2024-08-05',
      scheduled_time: '10:30:00',
      end_time: '13:00:00',
      status: 'completed',
      agreed_hours: 3.0,
      actual_hours: 2.5,
      total_cost: 150.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Jennifer Martinez')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Martinez'))?.id,
      title: 'Weekly Office Clean - Martinez',
      description: 'Regular cleaning with office focus',
      scheduled_date: '2024-08-09',
      scheduled_time: '08:00:00',
      end_time: '10:30:00',
      status: 'completed',
      agreed_hours: 3.0,
      actual_hours: 2.5,
      total_cost: 135.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Margaret Foster')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Foster'))?.id,
      title: 'Senior Care Weekly - Foster',
      description: 'Gentle weekly cleaning',
      scheduled_date: '2024-08-05',
      scheduled_time: '11:00:00',
      end_time: '13:30:00',
      status: 'completed',
      agreed_hours: 3.0,
      actual_hours: 2.5,
      total_cost: 150.00
    },
    // One-time jobs
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Kevin Murphy')?.id,
      title: 'Post-Renovation Cleanup',
      description: 'Kitchen remodel cleanup, heavy duty work',
      scheduled_date: '2024-07-25',
      scheduled_time: '09:00:00',
      end_time: '17:00:00',
      status: 'completed',
      agreed_hours: 8.0,
      actual_hours: 8.0,
      total_cost: 300.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Emma Richardson')?.id,
      title: 'Move-Out Deep Clean',
      description: 'Complete move-out cleaning for security deposit',
      scheduled_date: '2024-08-10',
      scheduled_time: '08:00:00',
      end_time: '15:00:00',
      status: 'completed',
      agreed_hours: 7.0,
      actual_hours: 7.0,
      total_cost: 280.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Michelle Wright')?.id,
      title: 'Pre-Party Deep Clean',
      description: 'Deep clean before anniversary party',
      scheduled_date: '2024-07-12',
      scheduled_time: '09:00:00',
      end_time: '15:00:00',
      status: 'completed',
      agreed_hours: 6.0,
      actual_hours: 6.0,
      total_cost: 240.00
    },
    // Current/upcoming jobs
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Sarah Johnson')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Sarah Johnson'))?.id,
      title: 'Weekly Cleaning - Sarah Johnson',
      description: 'Regular cleaning',
      scheduled_date: '2024-08-13',
      scheduled_time: '09:00:00',
      status: 'in_progress',
      agreed_hours: 2.5,
      total_cost: 120.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Margaret Foster')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Foster'))?.id,
      title: 'Senior Care Weekly - Foster',
      description: 'Regular gentle cleaning',
      scheduled_date: '2024-08-19',
      scheduled_time: '11:00:00',
      status: 'scheduled',
      agreed_hours: 3.0,
      total_cost: 150.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'Jennifer Martinez')?.id,
      recurring_job_id: recurringJobs?.find(r => r.title.includes('Martinez'))?.id,
      title: 'Weekly Office Clean - Martinez',
      description: 'Regular cleaning',
      scheduled_date: '2024-08-16',
      scheduled_time: '08:00:00',
      status: 'scheduled',
      agreed_hours: 3.0,
      total_cost: 135.00
    },
    {
      user_id: userId,
      client_id: clients.find(c => c.name === 'David & Amy Wilson')?.id,
      title: 'Back-to-School Deep Clean',
      description: 'Deep sanitization before school starts',
      scheduled_date: '2024-08-20',
      scheduled_time: '13:00:00',
      status: 'scheduled',
      agreed_hours: 4.0,
      total_cost: 200.00
    }
  ]
  
  const { data, error } = await supabase.from('jobs').insert(jobs).select()
  
  if (error) {
    console.error('❌ Error inserting jobs:', error.message)
  } else {
    console.log(`✅ Added ${data.length} jobs`)
  }
  
  return data
}

async function insertTasksAndNotes(jobs) {
  console.log('📝 Adding tasks and notes...')
  
  if (!jobs || jobs.length === 0) return
  
  // Add tasks to the job in progress
  const inProgressJob = jobs.find(j => j.status === 'in_progress')
  if (inProgressJob) {
    const tasks = [
      {
        user_id: userId,
        job_id: inProgressJob.id,
        title: 'Kitchen Deep Clean',
        description: 'Clean appliances, countertops, sink with pet-safe products',
        is_completed: true,
        estimated_minutes: 45,
        actual_minutes: 42,
        order_index: 1
      },
      {
        user_id: userId,
        job_id: inProgressJob.id,
        title: 'Bathroom Sanitization',
        description: 'Deep clean shower, toilet, sink, mirrors, floors',
        is_completed: true,
        estimated_minutes: 30,
        actual_minutes: 28,
        order_index: 2
      },
      {
        user_id: userId,
        job_id: inProgressJob.id,
        title: 'Living Areas & Pet Areas',
        description: 'Vacuum, dust surfaces, clean litter area',
        is_completed: false,
        estimated_minutes: 35,
        order_index: 3
      },
      {
        user_id: userId,
        job_id: inProgressJob.id,
        title: 'Final Walkthrough',
        description: 'Bedroom cleaning and quality check',
        is_completed: false,
        estimated_minutes: 30,
        order_index: 4
      }
    ]
    
    const { error: tasksError } = await supabase.from('tasks').insert(tasks)
    if (tasksError) {
      console.error('❌ Error inserting tasks:', tasksError.message)
    } else {
      console.log('✅ Added sample tasks')
    }
  }
  
  // Add notes to some completed jobs
  const completedJobs = jobs.filter(j => j.status === 'completed').slice(0, 3)
  const notes = completedJobs.map(job => ({
    user_id: userId,
    job_id: job.id,
    content: `Job completed successfully. Client was very satisfied with the results. ${job.title.includes('Sarah') ? 'Used pet-safe products as requested.' : job.title.includes('Chen') ? 'Used eco-friendly products.' : 'Standard cleaning completed.'}`,
    category: 'completion'
  }))
  
  if (notes.length > 0) {
    const { error: notesError } = await supabase.from('notes').insert(notes)
    if (notesError) {
      console.error('❌ Error inserting notes:', notesError.message)
    } else {
      console.log('✅ Added sample notes')
    }
  }
}

async function insertBookingRequests() {
  console.log('📝 Adding booking requests...')
  
  const bookingRequests = [
    {
      user_id: userId,
      client_name: 'Amanda Foster',
      client_email: 'amanda.foster@email.com',
      client_phone: '(555) 987-6543',
      service_type: 'Standard House Cleaning',
      preferred_date: '2024-08-20',
      preferred_time: '10:00:00',
      message: 'Hi! I found your service online and would love to schedule a regular bi-weekly cleaning. I have a 3-bedroom house with 2 dogs.',
      status: 'pending'
    },
    {
      user_id: userId,
      client_name: 'Mark Thompson',
      client_email: 'mark.t@email.com',
      client_phone: '(555) 876-5432',
      service_type: 'Move-In/Move-Out Cleaning',
      preferred_date: '2024-08-25',
      preferred_time: '09:00:00',
      message: 'Need move-out cleaning for apartment rental. Landlord requires professional cleaning receipt.',
      status: 'pending'
    },
    {
      user_id: userId,
      client_name: 'Lisa Park',
      client_email: 'lisa.park@email.com',
      client_phone: '(555) 765-4321',
      service_type: 'Deep House Cleaning',
      preferred_date: '2024-08-18',
      preferred_time: '13:00:00',
      message: 'Looking for one-time deep clean before hosting family reunion. 4 bedroom house.',
      status: 'contacted'
    }
  ]
  
  const { error } = await supabase.from('booking_requests').insert(bookingRequests)
  
  if (error) {
    console.error('❌ Error inserting booking requests:', error.message)
  } else {
    console.log('✅ Added sample booking requests')
  }
}

async function main() {
  try {
    console.log('🧹 Clean Report - Comprehensive Dummy Data Population')
    console.log('=' .repeat(60))
    console.log('')
    
    await clearExistingData()
    
    const serviceTypes = await insertServiceTypes()
    const clients = await insertClients()
    const staff = await insertStaffMembers()
    const supplies = await insertSupplies()
    const recurringJobs = await insertRecurringJobs(clients)
    const jobs = await insertJobs(clients, recurringJobs)
    
    await insertTasksAndNotes(jobs)
    await insertBookingRequests()
    
    console.log('\n✨ Dummy data population completed!')
    console.log('📊 Your app now contains:')
    console.log('  • 12 diverse clients with realistic contact info')
    console.log('  • 4 staff members with different roles and rates')
    console.log('  • 5 service types covering all cleaning scenarios')
    console.log('  • 8 supply items with stock management')
    console.log('  • 4 recurring job schedules for regular clients')
    console.log('  • 12 jobs with mix of completed/in-progress/scheduled')
    console.log('  • Tasks and notes showing work details')
    console.log('  • 3 pending booking requests from prospects')
    console.log('')
    console.log('🚀 You can now explore your app with comprehensive dummy data!')
    console.log('💡 All data is filtered by your user account for security.')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }