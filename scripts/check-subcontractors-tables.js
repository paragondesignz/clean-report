const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    console.log('Checking if subcontractors tables exist...')
    
    // Check if sub_contractors table exists
    const { data: contractors, error: contractorsError } = await supabase
      .from('sub_contractors')
      .select('count')
      .limit(1)
    
    console.log('sub_contractors table check:', { 
      exists: !contractorsError, 
      error: contractorsError?.message 
    })
    
    // Check if sub_contractor_job_assignments table exists
    const { data: assignments, error: assignmentsError } = await supabase
      .from('sub_contractor_job_assignments')
      .select('count')
      .limit(1)
    
    console.log('sub_contractor_job_assignments table check:', { 
      exists: !assignmentsError, 
      error: assignmentsError?.message 
    })
    
    // List all tables to see what exists
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => ({ data: null, error: 'RPC not available' }))
    
    if (!tablesError) {
      console.log('Available tables:', tables)
    }
    
  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

checkTables()
