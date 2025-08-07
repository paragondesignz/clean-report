const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please make sure you have:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  console.log('in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up database tables...')
    
    // Read the SQL file
    const fs = require('fs')
    const sql = fs.readFileSync('./supabase-setup.sql', 'utf8')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error setting up database:', error)
      console.log('\nPlease run the SQL manually in your Supabase dashboard:')
      console.log('1. Go to your Supabase project dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of supabase-setup.sql')
      console.log('4. Run the SQL')
    } else {
      console.log('Database setup completed successfully!')
    }
  } catch (error) {
    console.error('Setup failed:', error)
    console.log('\nPlease run the SQL manually in your Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase-setup.sql')
    console.log('4. Run the SQL')
  }
}

setupDatabase() 