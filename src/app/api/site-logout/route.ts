import { NextResponse } from 'next/server';
import { SITE_ACCESS_COOKIE } from '@/lib/site-auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
