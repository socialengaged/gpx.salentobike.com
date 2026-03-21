import { notFound } from 'next/navigation';
import {
  getRouteSummariesFromStore,
  getRouteBySlugFromStore,
  getGpxRouteSlugs,
} from '@/lib/routes/store';
import { loadRouteBySlug } from '@/lib/gpx/loader';
import { Chip } from '@/components/ui/Chip';
import { RouteDetailView } from './RouteDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const summaries = await getRouteSummariesFromStore();
  return summaries.map((r) => ({ slug: r.slug }));
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let route = await getRouteBySlugFromStore(slug);

  if (!route && getGpxRouteSlugs().includes(slug)) {
    route = (await loadRouteBySlug(slug)) ?? undefined;
  }

  if (!route) notFound();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-900 truncate min-w-0 flex-1">
          {route.title}
        </h1>
        <div className="flex gap-2 shrink-0">
          <Chip>{route.category}</Chip>
          <Chip variant="default" className="capitalize">
            {route.difficulty}
          </Chip>
        </div>
      </div>
      <p className="flex-shrink-0 px-4 pb-2 text-slate-600 text-base line-clamp-2">
        {route.shortDescription}
      </p>

      <div className="flex-1 min-h-0 flex flex-col">
        <RouteDetailView route={route} />
      </div>
    </div>
  );
}
