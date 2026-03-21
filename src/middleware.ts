import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SITE_ACCESS_COOKIE, isSiteAccessGranted } from '@/lib/site-auth';

const ADMIN_PASSWORD = 'social123';
const AUTH_COOKIE = 'admin_auth';

function isPublicAssetPath(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/icons/')) return true;
  if (pathname.startsWith('/data/')) return true;
  if (pathname.startsWith('/mappe/')) return true;
  if (/\.(ico|png|svg|jpg|jpeg|gif|webp|json|webmanifest|js|woff2?|txt|map)$/.test(pathname)) {
    return true;
  }
  return false;
}

function isSiteAuthExempt(pathname: string): boolean {
  if (pathname === '/accesso') return true;
  if (pathname === '/api/site-login' || pathname === '/api/site-logout') return true;
  if (isPublicAssetPath(pathname)) return true;
  return false;
}

function isAdminAuthenticated(request: NextRequest): boolean {
  return request.cookies.get(AUTH_COOKIE)?.value === ADMIN_PASSWORD;
}

function isSiteAuthenticated(request: NextRequest): boolean {
  const v = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  return isSiteAccessGranted(v);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSiteAuthExempt(pathname) && !isSiteAuthenticated(request)) {
    const url = request.nextUrl.clone();
    url.pathname = '/accesso';
    const dest = pathname + request.nextUrl.search;
    url.searchParams.set('from', dest || '/');
    return NextResponse.redirect(url);
  }

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
