import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  console.log('Callback URL Params:', searchParams.toString())

  const supabase = await createClient()
  const redirectUrl = new URL('/auth/error', origin)

  try {
    if (!code) {
      throw new Error('Authentication code missing')
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data?.session?.user) {
      throw error || new Error('SESSION_ERROR: Failed to create session')
    }

    const userId = data.session.user.id

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'buyer' })
      .eq('id', userId)
      .is('role', null)

    if (updateError) {
      throw updateError
    }

    return NextResponse.redirect(new URL('/', origin))
  } catch (error) {
    console.error('Buyer callback error:', error)
    redirectUrl.searchParams.set('code', 'buyer_auth_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
