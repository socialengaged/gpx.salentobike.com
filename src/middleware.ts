import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = 'social123';
const AUTH_COOKIE = 'admin_auth';

function isAdminAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  return cookie === ADMIN_PASSWORD;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (!isAdminAuthenticated(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname === '/api/upload' || pathname === '/api/routes') {
    if (request.method === 'POST' && !isAdminAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/logout') return NextResponse.next();
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/upload', '/api/routes', '/api/admin/:path*'],
};
