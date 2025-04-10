import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server'



export async function middleware(request: NextRequest) {
  console.log('✅ Middleware is running for:', request.nextUrl.pathname)

  
  // First, update the session
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  const supabase = await createClient()

  let user = null

  try {
    const {
      data:  userData ,
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching authenticated user:', error)
    } else {
      user = userData
    }
  
  } catch (error) {
    
  }

  
  

  const sellerRoutes = new Set([
    '/vendor-marketplace',
    '/vendor-marketplace/products',
    '/vendor-marketplace/settings'
  ]);

  const authRoutes = new Set([
    '/auth/sign-in',
    '/auth/sign-up',
    '/vendor-market/auth/sign-up',
    '/vendor-market/auth/sign-in',
    '/vendor-market/auth/callback'
  ]);

  const publicRoutes = new Set([
    '/',
    '/vendor-market',
    '/terms',
    "/cart"
  ]);

   // Ensure `/auth/callback` isn't interrupted
   if (pathname.startsWith('/auth/callback') || pathname.startsWith('/vendor-market/auth/callback')) {
    return response;
  }


  const isPublicRoute = publicRoutes.has(pathname) || authRoutes.has(pathname);
  const isSellerRoute = sellerRoutes.has(pathname);
  const isAuthRoute = authRoutes.has(pathname);

  // Get user role if session exists
  let userRole = null
  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
    } else {
      userRole = profile?.role
    }
  }

// 🔹 Restrict seller users from accessing auth routes
if (user && userRole === 'seller' && isAuthRoute) {
  return NextResponse.redirect(new URL('/vendor-marketplace', request.url));
}

 // 🔹 If accessing a protected route and not authenticated, redirect to sign-in
 if (!user && !isPublicRoute) {
  const redirectUrl = new URL('/auth/sign-in', request.url);
  redirectUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(redirectUrl);
}

// 🔹 Restrict access to seller routes
if (isSellerRoute && userRole !== 'seller') {
  return NextResponse.redirect(new URL('/', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
