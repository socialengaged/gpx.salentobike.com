import { NextRequest, NextResponse } from 'next/server';
import {
  getRouteBySlugFromStore,
  getGpxRouteSlugs,
} from '@/lib/routes/store';
import { loadRouteBySlug } from '@/lib/gpx/loader';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let route = await getRouteBySlugFromStore(slug);

  if (!route && getGpxRouteSlugs().includes(slug)) {
    route = (await loadRouteBySlug(slug)) ?? undefined;
  }

  if (!route) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(route);
}
