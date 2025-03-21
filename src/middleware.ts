import {NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server'

import { sellerAuthRoutes, sellerPrefix } from './lib/routes'

export async function middleware(request: NextRequest) {
  console.log('✅ Middleware is running for:', request.nextUrl.pathname)
  
  // First, update the session
  const response = await updateSession(request)

  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname

  const supabase = await createClient()

  const isSellerAuthRoutes = sellerAuthRoutes.includes(pathname)

  const isSellerPrefix = pathname.startsWith(sellerPrefix)

  // Get the user - this is safe to use in middleware for checking if the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If the user is not logged in and trying to access protected routes
  if (!user) {
    if (isSellerPrefix ) {
      return NextResponse.redirect(new URL("/vendor-market/auth/sign-in", request.url))
    }
    return response
  }

  // If we have a user, check their role for role-specific routes
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const role = profile?.role || null

  // Redirect based on role restrictions

  if (isSellerPrefix && role !== "seller") {
    return NextResponse.redirect(new URL("/vendor-market/auth/sign-in", request.url))
  }

  // If user is logged in but tries to access login page, redirect to dashboard
  if (isSellerAuthRoutes) {
    return NextResponse.redirect(new URL("/vendor-marketplace", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}