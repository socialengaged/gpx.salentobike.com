import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/admin/stats';

export async function GET() {
  const data = await getAdminStats();
  return NextResponse.json(data);
}
