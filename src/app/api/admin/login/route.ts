import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'social123';
const AUTH_COOKIE = 'admin_auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password?.trim();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
