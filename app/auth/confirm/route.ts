import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

// Create Supabase client for server-side operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth confirm:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = createServerClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('Auth confirm successful, redirecting to:', next)
      // Redirect user to specified redirect URL or dashboard
      redirect(next)
    } else {
      console.error('Auth confirm error:', error)
    }
  }

  // Redirect the user to an error page with some instructions
  console.log('Auth confirm failed, redirecting to error page')
  redirect('/auth/error?message=invalid_link')
}


