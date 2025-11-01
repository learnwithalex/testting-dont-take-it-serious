import { NextRequest, NextResponse } from 'next/server'

// Define protected frontend routes and their required roles
const protectedRoutes = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/moderator': ['MODERATOR', 'ADMIN'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/dashboard',
  // Public pages
  '/marketplace',
  '/collections',
  '/nft',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Skip middleware for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For frontend routes, check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname)
  
  if (requiredRoles.length > 0) {
    // This is a protected route - client-side auth will handle the actual verification
    // Middleware just ensures proper routing structure
    return NextResponse.next()
  }

  return NextResponse.next()
}

function getRequiredRoles(pathname: string): string[] {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return roles
    }
  }
  return []
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}