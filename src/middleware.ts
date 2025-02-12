import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'

// Middleware function
export async function middleware(request: NextRequest) {

  // Get token from next-auth
  const token = await getToken({ req: request })
  

  const url = request.nextUrl

  // If token exists, redirect from sign-in, sign-up, verify, and home page to the dashboard
  if (token) {
    // Allow access to dashboard if token exists
    if (url.pathname.startsWith('/dashboard')) {
      return NextResponse.next() // Token ke sath dashboard access dena
    }

    // Redirect user to /dashboard if they try to visit sign-in, sign-up, verify, or home page
    if (
      url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url)) // Redirect to dashboard
    }
  } else {
    // If token doesn't exist, restrict access to dashboard and redirect to sign-in
    if (url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', request.url)) // Redirect to sign-in if no token
    }

    // Allow access to sign-in, sign-up, and verify pages
    if (
      url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/')
    ) {
      return NextResponse.next() // Allow access to these pages
    }
  }

  // Default fallback (just in case)
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
    '/verify/:path*'
  ]
}
