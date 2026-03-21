import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getAdminStats } from '@/lib/admin/stats';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export default async function AdminPage() {
  const { stats, maps } = await getAdminStats();

  return (
    <div className="flex flex-1 flex-col overflow-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Pannello amministrazione</h1>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-4 rounded-lg bg-white border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.totalMaps}</div>
          <div className="text-sm text-slate-500">Mappe totali</div>
        </div>
        <div className="p-4 rounded-lg bg-white border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.uploadedMaps}</div>
          <div className="text-sm text-slate-500">Caricate da admin</div>
        </div>
        <div className="p-4 rounded-lg bg-white border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.totalDistanceKm}</div>
          <div className="text-sm text-slate-500">km totali</div>
        </div>
        <div className="p-4 rounded-lg bg-white border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">
            +{stats.totalElevationGainMeters} m
          </div>
          <div className="text-sm text-slate-500">dislivello positivo</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Mappe</h2>
      <ul className="space-y-2 mb-6">
        {maps.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200"
          >
            <div>
              <div className="font-medium text-slate-900">{m.title}</div>
              <div className="text-sm text-slate-500">
                {formatDistance(m.distanceMeters)} • +{m.elevationGainMeters} m •{' '}
                {m.source === 'gpx' ? 'GPX' : 'Caricata'}
              </div>
            </div>
            <Link href={`/admin/routes/${m.slug}/edit`}>
              <Button variant="ghost" size="sm">
                Dettagli
              </Button>
            </Link>
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        <Link href="/admin/upload">
          <Button variant="primary" size="lg" fullWidth>
            Carica nuova mappa GPX
          </Button>
        </Link>
        <Link href="/admin/routes">
          <Button variant="outline" size="md" fullWidth>
            Gestisci route
          </Button>
        </Link>
      </div>

      <form action="/api/admin/logout" method="POST" className="mt-8">
        <Button type="submit" variant="ghost" size="sm">
          Esci
        </Button>
      </form>
    </div>
  );
}
