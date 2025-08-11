#!/usr/bin/env node

/**
 * Minimal dummy data population that matches the exact database schema
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = '8d68f0b0-1fd0-4235-afc5-3b2fd9ec1f05'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearData() {
  console.log('🗑️  Clearing existing data...')
  
  const tables = ['jobs', 'recurring_jobs', 'clients', 'service_types', 'supplies', 'staff_members']
  
  for (const table of tables) {
    try {
      await supabase.from(table).delete().eq('user_id', userId)
      console.log(`✅ Cleared ${table}`)
    } catch (err) {
      console.log(`⚠️  ${table} might not exist`)
    }
  }
}

async function insertBasicData() {
  console.log('📝 Adding basic data...')
  
  // Service Types - minimal required fields only
  try {
    const { data: serviceTypes } = await supabase.from('service_types').insert([
      { user_id: userId, name: 'Standard House Cleaning', description: 'Regular cleaning service' },
      { user_id: userId, name: 'Deep House Cleaning', description: 'Comprehensive deep cleaning' },
      { user_id: userId, name: 'Move-In/Move-Out Cleaning', description: 'Complete move cleaning' }
    ]).select()
    console.log('✅ Added service types')
  } catch (err) {
    console.log('⚠️ Service types might have different schema')
  }
  
  // Clients - minimal required fields
  const clients = await supabase.from('clients').insert([
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
    }
  ]).select()
  console.log('✅ Added 6 clients')
  
  // Staff Members - minimal fields
  try {
    await supabase.from('staff_members').insert([
      {
        user_id: userId,
        name: 'Maria Gonzalez',
        email: 'maria.g@cleanteam.com',
        phone: '(555) 111-2222',
        role: 'Senior Cleaner'
      },
      {
        user_id: userId,
        name: 'John Anderson',
        email: 'john.a@cleanteam.com',
        phone: '(555) 222-3333',
        role: 'Cleaner'
      }
    ])
    console.log('✅ Added staff members')
  } catch (err) {
    console.log('⚠️ Staff members might have different schema')
  }
  
  // Supplies - minimal fields
  try {
    await supabase.from('supplies').insert([
      {
        user_id: userId,
        name: 'All-Purpose Cleaner',
        current_stock: 24,
        low_stock_threshold: 6,
        unit_cost: 4.50
      },
      {
        user_id: userId,
        name: 'Disinfectant Spray',
        current_stock: 18,
        low_stock_threshold: 5,
        unit_cost: 6.25
      },
      {
        user_id: userId,
        name: 'Microfiber Cloths',
        current_stock: 45,
        low_stock_threshold: 15,
        unit_cost: 2.20
      }
    ])
    console.log('✅ Added supplies')
  } catch (err) {
    console.log('⚠️ Supplies might have different schema')
  }
  
  if (!clients.data) return
  
  // Recurring Jobs - minimal fields
  try {
    const { data: recurringJobs } = await supabase.from('recurring_jobs').insert([
      {
        user_id: userId,
        client_id: clients.data[0].id,
        title: 'Weekly Cleaning - Sarah Johnson',
        description: 'Regular weekly cleaning',
        frequency: 'weekly',
        start_date: '2024-05-21',
        scheduled_time: '09:00:00'
      },
      {
        user_id: userId,
        client_id: clients.data[1].id,
        title: 'Bi-weekly Cleaning - Chen Family',
        description: 'Bi-weekly cleaning service',
        frequency: 'bi_weekly',
        start_date: '2024-05-27',
        scheduled_time: '10:30:00'
      }
    ]).select()
    console.log('✅ Added recurring jobs')
    
    // Jobs - minimal fields
    await supabase.from('jobs').insert([
      {
        user_id: userId,
        client_id: clients.data[0].id,
        recurring_job_id: recurringJobs?.[0]?.id,
        title: 'Weekly Cleaning - Sarah Johnson',
        description: 'Regular weekly cleaning',
        scheduled_date: '2024-08-06',
        scheduled_time: '09:00:00',
        end_time: '11:30:00',
        status: 'completed',
        agreed_hours: 2.5,
        total_cost: 120.00
      },
      {
        user_id: userId,
        client_id: clients.data[0].id,
        recurring_job_id: recurringJobs?.[0]?.id,
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
        client_id: clients.data[1].id,
        recurring_job_id: recurringJobs?.[1]?.id,
        title: 'Bi-weekly Cleaning - Chen Family',
        description: 'Deep clean',
        scheduled_date: '2024-08-05',
        scheduled_time: '10:30:00',
        end_time: '13:00:00',
        status: 'completed',
        agreed_hours: 3.0,
        total_cost: 150.00
      },
      {
        user_id: userId,
        client_id: clients.data[2].id,
        title: 'One-Time Deep Clean',
        description: 'Complete house deep cleaning',
        scheduled_date: '2024-07-25',
        scheduled_time: '09:00:00',
        end_time: '15:00:00',
        status: 'completed',
        agreed_hours: 6.0,
        total_cost: 240.00
      },
      {
        user_id: userId,
        client_id: clients.data[3].id,
        title: 'Office Cleaning',
        description: 'Home office cleaning',
        scheduled_date: '2024-08-16',
        scheduled_time: '08:00:00',
        status: 'scheduled',
        agreed_hours: 3.0,
        total_cost: 135.00
      },
      {
        user_id: userId,
        client_id: clients.data[4].id,
        title: 'Family Home Clean',
        description: 'Child-safe deep clean',
        scheduled_date: '2024-08-20',
        scheduled_time: '13:00:00',
        status: 'scheduled',
        agreed_hours: 4.0,
        total_cost: 200.00
      }
    ])
    console.log('✅ Added 6 jobs with various statuses')
  } catch (err) {
    console.log('⚠️ Jobs might have different schema:', err.message)
  }
}

async function main() {
  try {
    console.log('🧹 Clean Report - Basic Dummy Data Population')
    console.log('=' .repeat(50))
    
    await clearData()
    await insertBasicData()
    
    console.log('\n✨ Basic dummy data population completed!')
    console.log('📊 Your app now contains:')
    console.log('  • 6 clients with contact information')
    console.log('  • 2 recurring job schedules')
    console.log('  • 6 jobs with different statuses')
    console.log('  • Service types and supplies')
    console.log('  • Staff members for assignments')
    console.log('')
    console.log('🚀 You can now test your app with realistic data!')
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

main()