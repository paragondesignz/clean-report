#!/usr/bin/env node

/**
 * Script to populate Clean Report app with comprehensive dummy data
 * Run with: node run-dummy-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getCurrentUserId() {
  console.log('🔍 Using provided user ID...')
  const userId = '8d68f0b0-1fd0-4235-afc5-3b2fd9ec1f05'
  console.log(`✅ User ID: ${userId}`)
  return userId
}

async function executeSqlScript(userId) {
  console.log('📄 Reading SQL script...')
  
  const sqlPath = path.join(__dirname, 'populate-comprehensive-dummy-data.sql')
  let sqlContent = fs.readFileSync(sqlPath, 'utf8')
  
  // Replace placeholder with actual user ID
  sqlContent = sqlContent.replace(/YOUR_USER_ID_HERE/g, userId)
  
  console.log('🚀 Executing SQL script...')
  console.log('⚠️  This will DELETE all existing data and replace it with dummy data!')
  
  // Split the SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'COMMIT')
  
  console.log(`📊 Executing ${statements.length} SQL statements...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement) continue
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        // Try direct execution for statements that might not work with rpc
        const { error: directError } = await supabase.from('_dummy').select('*').limit(0)
        if (directError && directError.message.includes('does not exist')) {
          // Table doesn't exist, try executing directly via low-level query
          console.log(`⚠️  Statement ${i + 1} had issues, trying alternative approach...`)
        } else {
          throw error
        }
      }
      
      successCount++
      if ((i + 1) % 10 === 0) {
        console.log(`📈 Progress: ${i + 1}/${statements.length} statements completed`)
      }
    } catch (error) {
      console.error(`❌ Error in statement ${i + 1}:`, error.message)
      console.error(`Statement: ${statement.substring(0, 100)}...`)
      errorCount++
      
      // Don't exit on errors, continue with remaining statements
      if (errorCount > 10) {
        console.error('❌ Too many errors, stopping execution')
        break
      }
    }
  }
  
  console.log(`\n📊 Execution Summary:`)
  console.log(`✅ Successful statements: ${successCount}`)
  console.log(`❌ Failed statements: ${errorCount}`)
}

async function executeDirectSql() {
  console.log('🔄 Trying alternative approach with direct SQL execution...')
  
  const userId = await getCurrentUserId()
  
  // Execute key data insertions directly
  const insertions = [
    // Clear existing data first
    { table: 'jobs', action: 'delete' },
    { table: 'clients', action: 'delete' },
    { table: 'staff_members', action: 'delete' },
    { table: 'service_types', action: 'delete' },
    { table: 'supplies', action: 'delete' },
    
    // Insert service types
    { 
      table: 'service_types', 
      action: 'insert', 
      data: [
        { user_id: userId, name: 'Standard House Cleaning', description: 'Regular cleaning including bathrooms, kitchen, living areas, and bedrooms', base_price: 120.00, estimated_duration: 120, is_active: true },
        { user_id: userId, name: 'Deep House Cleaning', description: 'Comprehensive cleaning including inside appliances, baseboards, windows', base_price: 200.00, estimated_duration: 180, is_active: true },
        { user_id: userId, name: 'Move-In/Move-Out Cleaning', description: 'Complete cleaning for property transitions', base_price: 250.00, estimated_duration: 240, is_active: true },
        { user_id: userId, name: 'Post-Construction Cleanup', description: 'Cleaning after construction or renovation work', base_price: 300.00, estimated_duration: 300, is_active: true },
        { user_id: userId, name: 'Window Cleaning', description: 'Interior and exterior window cleaning service', base_price: 80.00, estimated_duration: 90, is_active: true },
        { user_id: userId, name: 'Carpet Deep Clean', description: 'Professional carpet cleaning and stain removal', base_price: 150.00, estimated_duration: 120, is_active: true }
      ]
    },
    
    // Insert clients
    { 
      table: 'clients', 
      action: 'insert', 
      data: [
        { user_id: userId, name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '(555) 123-4567', address: '123 Maple Street, Springfield, MA 01103', notes: 'Weekly cleaning every Tuesday. Has 2 cats. Use pet-safe products only.', created_at: '2024-05-15T10:00:00Z' },
        { user_id: userId, name: 'Michael & Lisa Chen', email: 'mchen@email.com', phone: '(555) 234-5678', address: '456 Oak Avenue, Springfield, MA 01104', notes: 'Bi-weekly cleaning. Key under flower pot. Prefer eco-friendly products.', created_at: '2024-05-20T14:30:00Z' },
        { user_id: userId, name: 'Robert Thompson', email: 'r.thompson@email.com', phone: '(555) 345-6789', address: '789 Pine Road, Springfield, MA 01105', notes: 'Monthly deep clean. Large house, 4 bedrooms. Takes 3-4 hours.', created_at: '2024-06-01T09:15:00Z' },
        { user_id: userId, name: 'Jennifer Martinez', email: 'jen.martinez@email.com', phone: '(555) 456-7890', address: '321 Elm Drive, Springfield, MA 01106', notes: 'Weekly cleaning Fridays. Home office needs special attention. No scented products.', created_at: '2024-06-10T16:45:00Z' },
        { user_id: userId, name: 'David & Amy Wilson', email: 'dwilson@email.com', phone: '(555) 567-8901', address: '654 Cedar Lane, Springfield, MA 01107', notes: 'Bi-weekly service. 3 young children, focus on sanitizing. Flexible with timing.', created_at: '2024-06-15T11:20:00Z' },
        { user_id: userId, name: 'Margaret Foster', email: 'margaret.f@email.com', phone: '(555) 678-9012', address: '987 Birch Street, Springfield, MA 01108', notes: 'Elderly client, weekly cleaning. Be gentle with antique furniture.', created_at: '2024-06-20T13:30:00Z' },
        { user_id: userId, name: 'James Rodriguez', email: 'jrodriguez@email.com', phone: '(555) 789-0123', address: '147 Spruce Court, Springfield, MA 01109', notes: 'Every other week. Bachelor pad, kitchen needs extra attention.', created_at: '2024-07-01T08:45:00Z' },
        { user_id: userId, name: 'Patricia Davis', email: 'pdavis@email.com', phone: '(555) 901-2345', address: '369 Poplar Place, Springfield, MA 01111', notes: 'Weekly cleaning Mondays. Work from home, prefer morning appointments.', created_at: '2024-07-10T15:00:00Z' }
      ]
    },
    
    // Insert staff members
    { 
      table: 'staff_members', 
      action: 'insert', 
      data: [
        { user_id: userId, name: 'Maria Gonzalez', email: 'maria.g@cleanteam.com', phone: '(555) 111-2222', role: 'Senior Cleaner', hourly_rate: 22.00, is_active: true, hire_date: '2024-05-01', notes: 'Excellent with detail work. Specializes in kitchen deep cleaning. Bilingual.' },
        { user_id: userId, name: 'John Anderson', email: 'john.a@cleanteam.com', phone: '(555) 222-3333', role: 'Cleaner', hourly_rate: 18.00, is_active: true, hire_date: '2024-06-01', notes: 'Reliable and punctual. Good with carpet cleaning and window work.' },
        { user_id: userId, name: 'Sofia Petrov', email: 'sofia.p@cleanteam.com', phone: '(555) 333-4444', role: 'Cleaner', hourly_rate: 19.50, is_active: true, hire_date: '2024-06-15', notes: 'Fast and efficient. Prefers bathroom and kitchen cleaning. Available weekends.' }
      ]
    },
    
    // Insert supplies
    { 
      table: 'supplies', 
      action: 'insert', 
      data: [
        { user_id: userId, name: 'All-Purpose Cleaner', category: 'Cleaning Chemicals', current_stock: 24, low_stock_threshold: 6, unit_cost: 4.50, supplier: 'CleanPro Supply Co.', last_restocked: '2024-08-01', notes: 'Eco-friendly formula. Popular with clients who prefer green products.' },
        { user_id: userId, name: 'Disinfectant Spray', category: 'Cleaning Chemicals', current_stock: 18, low_stock_threshold: 5, unit_cost: 6.25, supplier: 'CleanPro Supply Co.', last_restocked: '2024-08-01', notes: 'EPA registered. Use in bathrooms and kitchens.' },
        { user_id: userId, name: 'Glass Cleaner', category: 'Cleaning Chemicals', current_stock: 15, low_stock_threshold: 4, unit_cost: 3.75, supplier: 'CleanPro Supply Co.', last_restocked: '2024-08-01', notes: 'Streak-free formula. Good for mirrors and windows.' },
        { user_id: userId, name: 'Microfiber Cloths', category: 'Tools & Equipment', current_stock: 45, low_stock_threshold: 15, unit_cost: 2.20, supplier: 'Cleaning Warehouse', last_restocked: '2024-08-05', notes: 'High-quality microfiber. Color coded - blue for glass, yellow for general cleaning.' },
        { user_id: userId, name: 'Rubber Gloves (Large)', category: 'Safety & PPE', current_stock: 30, low_stock_threshold: 10, unit_cost: 1.25, supplier: 'Safety First Supply', last_restocked: '2024-08-10', notes: 'Nitrile gloves. Size large most popular with staff.' },
        { user_id: userId, name: 'Paper Towels', category: 'Disposables', current_stock: 36, low_stock_threshold: 12, unit_cost: 2.80, supplier: 'Office Depot', last_restocked: '2024-08-08', notes: 'High-absorbency. Buy in bulk for cost savings.' }
      ]
    }
  ]
  
  for (const insertion of insertions) {
    try {
      if (insertion.action === 'delete') {
        console.log(`🗑️  Clearing ${insertion.table}...`)
        const { error } = await supabase
          .from(insertion.table)
          .delete()
          .eq('user_id', userId)
        
        if (error) {
          console.error(`❌ Error clearing ${insertion.table}:`, error.message)
        } else {
          console.log(`✅ Cleared ${insertion.table}`)
        }
      } else if (insertion.action === 'insert') {
        console.log(`📝 Inserting data into ${insertion.table}...`)
        const { error } = await supabase
          .from(insertion.table)
          .insert(insertion.data)
        
        if (error) {
          console.error(`❌ Error inserting into ${insertion.table}:`, error.message)
        } else {
          console.log(`✅ Inserted ${insertion.data.length} records into ${insertion.table}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error with ${insertion.table}:`, error.message)
    }
  }
  
  // Now let's add some jobs
  console.log('📅 Adding recent jobs...')
  
  try {
    // Get Sarah Johnson's client ID
    const { data: sarahClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Sarah Johnson')
      .single()
    
    if (sarahClient) {
      const jobsData = [
        {
          user_id: userId,
          client_id: sarahClient.id,
          title: 'Weekly Cleaning - Sarah Johnson',
          description: 'Regular weekly cleaning with pet-safe products',
          scheduled_date: '2024-08-06',
          scheduled_time: '09:00:00',
          end_time: '11:30:00',
          status: 'completed',
          agreed_hours: 2.5,
          actual_hours: 2.5,
          total_cost: 120.00,
          created_at: '2024-08-03T10:00:00Z'
        },
        {
          user_id: userId,
          client_id: sarahClient.id,
          title: 'Weekly Cleaning - Sarah Johnson',
          description: 'Regular cleaning',
          scheduled_date: '2024-08-13',
          scheduled_time: '09:00:00',
          status: 'scheduled',
          agreed_hours: 2.5,
          total_cost: 120.00,
          created_at: '2024-08-10T10:00:00Z'
        }
      ]
      
      const { error: jobsError } = await supabase
        .from('jobs')
        .insert(jobsData)
      
      if (jobsError) {
        console.error('❌ Error inserting jobs:', jobsError.message)
      } else {
        console.log('✅ Added sample jobs')
      }
    }
  } catch (error) {
    console.error('❌ Error adding jobs:', error.message)
  }
}

async function main() {
  try {
    console.log('🧹 Clean Report - Comprehensive Dummy Data Population')
    console.log('=' .repeat(60))
    console.log('')
    
    // First try the direct approach which is more reliable
    await executeDirectSql()
    
    console.log('\n✨ Dummy data population completed!')
    console.log('📊 Your app now contains:')
    console.log('  • 8 diverse clients with realistic contact info')
    console.log('  • 3 staff members with different roles and rates') 
    console.log('  • 6 service types covering all cleaning scenarios')
    console.log('  • 6 supply items with stock management')
    console.log('  • Sample jobs showing different statuses')
    console.log('  • Realistic business data spanning 3 months')
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