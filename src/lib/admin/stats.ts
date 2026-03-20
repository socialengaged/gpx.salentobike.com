import { getAllRoutes, getGpxRouteSlugs } from '@/lib/routes/store';
import { loadRouteBySlug } from '@/lib/gpx/loader';

export interface MapSummary {
  id: string;
  slug: string;
  title: string;
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  category: string;
  source: 'gpx' | 'uploaded';
  published?: boolean;
  updatedAt?: string;
}

export interface AdminStats {
  stats: {
    totalMaps: number;
    gpxMaps: number;
    uploadedMaps: number;
    totalDistanceMeters: number;
    totalDistanceKm: number;
    totalElevationGainMeters: number;
    totalElevationLossMeters: number;
  };
  maps: MapSummary[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const addedRoutes = await getAllRoutes();
  const gpxSlugs = getGpxRouteSlugs();

  const gpxRoutes = await Promise.all(
    gpxSlugs.map(async (slug) => {
      const r = await loadRouteBySlug(slug);
      if (!r) return null;
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        distanceMeters: r.distanceMeters,
        elevationGainMeters: r.elevationGainMeters,
        elevationLossMeters: r.elevationLossMeters,
        category: r.category,
        source: 'gpx' as const,
      };
    })
  );

  const gpxFiltered = gpxRoutes.filter((r): r is NonNullable<typeof r> => r !== null);
  const addedSummaries: MapSummary[] = addedRoutes.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    distanceMeters: r.distanceMeters,
    elevationGainMeters: r.elevationGainMeters,
    elevationLossMeters: r.elevationLossMeters,
    category: r.category,
    source: 'uploaded' as const,
    published: r.published,
    updatedAt: r.updatedAt,
  }));

  const allMaps = [...gpxFiltered, ...addedSummaries];
  const totalDistance = allMaps.reduce((s, r) => s + r.distanceMeters, 0);
  const totalElevationGain = allMaps.reduce((s, r) => s + r.elevationGainMeters, 0);
  const totalElevationLoss = allMaps.reduce((s, r) => s + r.elevationLossMeters, 0);

  return {
    stats: {
      totalMaps: allMaps.length,
      gpxMaps: gpxFiltered.length,
      uploadedMaps: addedSummaries.length,
      totalDistanceMeters: totalDistance,
      totalDistanceKm: Math.round(totalDistance / 10) / 100,
      totalElevationGainMeters: totalElevationGain,
      totalElevationLossMeters: totalElevationLoss,
    },
    maps: allMaps,
  };
}
