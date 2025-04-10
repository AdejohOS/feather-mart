import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

type UserRole = 'admin' | 'buyer' | 'seller'

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const role = searchParams.get('role')
  const origin = request.nextUrl.origin

  try {
    const supabase = await createClient()

    // Validate required parameters
    if (!token_hash || !type) {
      throw new Error('Missing authentication parameters')
    }

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })

    if (error || !data?.session) throw error || new Error('Session not found')

    const role = data.session.user.user_metadata?.role as string
    const validRoles = ['seller', 'buyer', 'admin']
    const safeRole = validRoles.includes(role) ? role : 'buyer'

    await supabase.from('profiles').upsert({
      id: data.session.user.id,
      role: safeRole as UserRole,
      email: data.session.user.email
    })

    // Redirect based on validated role
    const redirectPath = {
      seller: '/vendor-marketplace',
      buyer: '/',
      admin: '/admin'
    }[safeRole]

    return NextResponse.redirect(`${origin}${redirectPath}`)
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.redirect(`${origin}/auth/error`)
  }
}

// Validate role type
function isValidRole(role: string | null): role is UserRole {
  return ['admin', 'buyer', 'seller'].includes(role || '')
}

// Determine redirect path based on role
function getRoleRedirect(role: UserRole): string {
  return (
    {
      seller: '/vendor-marketplace',
      buyer: '/',
      admin: '/admin'
    }[role] || '/'
  )
}
