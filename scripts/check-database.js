const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  try {
    console.log('Checking database tables and relationships...\n')
    
    // Check if tables exist
    const tables = [
      'clients',
      'jobs', 
      'tasks',
      'photos',
      'notes',
      'reports',
      'user_profiles',
      'calendar_integrations'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Table '${table}' - ERROR: ${error.message}`)
        } else {
          console.log(`✅ Table '${table}' - OK`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - ERROR: ${err.message}`)
      }
    }
    
    console.log('\nChecking relationships...\n')
    
    // Test a simple job query with relationships
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .limit(1)
      
      if (error) {
        console.log(`❌ Jobs-Clients relationship - ERROR: ${error.message}`)
      } else {
        console.log(`✅ Jobs-Clients relationship - OK`)
      }
    } catch (err) {
      console.log(`❌ Jobs-Clients relationship - ERROR: ${err.message}`)
    }
    
    // Test tasks relationship
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          job:jobs(*)
        `)
        .limit(1)
      
      if (error) {
        console.log(`❌ Tasks-Jobs relationship - ERROR: ${error.message}`)
      } else {
        console.log(`✅ Tasks-Jobs relationship - OK`)
      }
    } catch (err) {
      console.log(`❌ Tasks-Jobs relationship - ERROR: ${err.message}`)
    }
    
    // Test photos relationship
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          task:tasks(*)
        `)
        .limit(1)
      
      if (error) {
        console.log(`❌ Photos-Tasks relationship - ERROR: ${error.message}`)
      } else {
        console.log(`✅ Photos-Tasks relationship - OK`)
      }
    } catch (err) {
      console.log(`❌ Photos-Tasks relationship - ERROR: ${err.message}`)
    }
    
    console.log('\nDatabase check completed!')
    console.log('\nIf you see any ❌ errors, run the database setup:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy and paste the contents of supabase-setup.sql')
    console.log('3. Run the SQL')
    
  } catch (error) {
    console.error('Database check failed:', error)
  }
}

checkDatabase() 