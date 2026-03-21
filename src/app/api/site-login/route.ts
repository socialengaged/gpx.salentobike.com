import { NextRequest, NextResponse } from 'next/server';
import { SITE_ACCESS_COOKIE, SITE_ACCESS_PASSWORD } from '@/lib/site-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password?.trim();
    if (password !== SITE_ACCESS_PASSWORD) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SITE_ACCESS_COOKIE, SITE_ACCESS_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 });
  }
}
