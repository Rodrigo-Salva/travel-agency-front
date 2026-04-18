import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route groups that require authentication
const CUSTOMER_PATHS = ['/dashboard', '/bookings', '/profile', '/wishlist', '/reviews/new']
const ADMIN_PATHS = ['/admin']
const AUTH_PATHS = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read cookies set by the client after login
  const isAuthenticated = request.cookies.has('ta_auth')
  const userType = request.cookies.get('ta_user_type')?.value

  // Redirect already-authenticated users away from login/register
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) {
      const dest = userType === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // Protect customer routes
  if (CUSTOMER_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    if (userType === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Protect admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    if (userType !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
