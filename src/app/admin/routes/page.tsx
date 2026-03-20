import Link from 'next/link';
import { getRouteSummariesFromStore } from '@/lib/routes/store';
import { Button } from '@/components/ui/Button';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export default async function AdminRoutesPage() {
  const routes = await getRouteSummariesFromStore();

  return (
    <div className="flex flex-1 flex-col overflow-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Routes</h1>

      <ul className="space-y-3">
        {routes.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200"
          >
            <div>
              <div className="font-medium text-slate-900">{r.title}</div>
              <div className="text-sm text-slate-500">
                {formatDistance(r.distanceMeters)} • {r.category}
              </div>
            </div>
            <Link href={`/admin/routes/${r.slug}/edit`}>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/admin" className="mt-6">
        <Button variant="outline" size="md">
          Back to Admin
        </Button>
      </Link>
    </div>
  );
}
