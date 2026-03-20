import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getRouteBySlugFromStore,
  getGpxRouteSlugs,
} from '@/lib/routes/store';
import { loadRouteBySlug } from '@/lib/gpx/loader';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminRouteEditPage({ params }: PageProps) {
  const { slug } = await params;
  let route = await getRouteBySlugFromStore(slug);

  if (!route && getGpxRouteSlugs().includes(slug)) {
    route = (await loadRouteBySlug(slug)) ?? undefined;
  }

  if (!route) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Edit: {route.title}
      </h1>
      <p className="text-slate-600 mb-6">
        Full edit form coming in Phase 8. Metadata, waypoints, publish toggle.
      </p>

      <div className="space-y-2 text-sm text-slate-600">
        <p>Slug: {route.slug}</p>
        <p>Category: {route.category}</p>
        <p>Published: {route.published ? 'Yes' : 'No'}</p>
      </div>

      <Link href="/admin/routes" className="mt-6">
        <Button variant="outline" size="md">
          Back to Routes
        </Button>
      </Link>
    </div>
  );
}
