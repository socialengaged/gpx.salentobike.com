import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'admin_auth';

export async function POST(request: NextRequest) {
  const url = new URL('/admin/login', request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
