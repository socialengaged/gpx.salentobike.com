import { NextRequest, NextResponse } from 'next/server';
import { loadGpxRoute } from '@/lib/gpx/loader';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const route = await loadGpxRoute(file);

  if (!route) {
    return NextResponse.json({ error: 'File not found or not allowed' }, { status: 404 });
  }

  return NextResponse.json(route);
}
