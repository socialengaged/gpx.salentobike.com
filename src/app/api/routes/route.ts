import { NextResponse } from 'next/server';
import {
  getRouteSummariesFromStore,
  addRoute,
  generateId,
  generateSlug,
} from '@/lib/routes/store';
import type { Route } from '@/lib/routes/types';

export async function GET() {
  const routes = await getRouteSummariesFromStore();
  return NextResponse.json(routes);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Route>;
    if (!body.title || !body.normalizedGeoJson) {
      return NextResponse.json({ error: 'Missing title or route data' }, { status: 400 });
    }
    const id = body.id || generateId();
    const slug = body.slug || generateSlug(body.title);
    const fullRoute: Route = {
      id,
      slug,
      title: body.title,
      shortDescription: body.shortDescription ?? '',
      language: body.language ?? 'en',
      category: body.category ?? 'road',
      distanceMeters: body.distanceMeters ?? 0,
      elevationGainMeters: body.elevationGainMeters ?? 0,
      elevationLossMeters: body.elevationLossMeters ?? 0,
      estimatedDuration: body.estimatedDuration ?? 0,
      difficulty: body.difficulty ?? 'moderate',
      normalizedGeoJson: body.normalizedGeoJson,
      waypoints: body.waypoints ?? [],
      published: body.published ?? true,
      updatedAt: new Date().toISOString(),
    };
    await addRoute(fullRoute);
    return NextResponse.json(fullRoute);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
