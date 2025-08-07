// Diagnostic script for identifying common issues
// Run this in the browser console to get detailed information

console.log('🔍 Starting diagnostic check...')

// Check environment variables
const envCheck = {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 'missing',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'missing'
}

console.log('📋 Environment Variables Check:', envCheck)

// Check if we're in a browser environment
const browserCheck = {
  hasWindow: typeof window !== 'undefined',
  hasDocument: typeof document !== 'undefined',
  hasLocalStorage: typeof localStorage !== 'undefined',
  userAgent: navigator?.userAgent || 'unknown'
}

console.log('🌐 Browser Environment Check:', browserCheck)

// Check for common error patterns
const checkForErrors = () => {
  const errors = []
  
  // Check for missing environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  
  // Check for authentication issues
  const authToken = localStorage.getItem('sb-access-token')
  if (!authToken) {
    errors.push('No authentication token found in localStorage')
  }
  
  return errors
}

const errors = checkForErrors()
console.log('❌ Potential Issues Found:', errors)

// Provide recommendations
if (errors.length > 0) {
  console.log('💡 Recommendations:')
  errors.forEach(error => {
    console.log(`  - ${error}`)
  })
  
  console.log('🔧 To fix these issues:')
  console.log('  1. Check your .env.local file has the correct Supabase credentials')
  console.log('  2. Make sure you\'re logged in to the application')
  console.log('  3. Check the browser console for specific error messages')
  console.log('  4. Verify your Supabase database tables exist')
} else {
  console.log('✅ No obvious issues found in environment check')
}

console.log('🔍 Diagnostic check complete. Check the console above for details.') 