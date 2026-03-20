import { RoutesListClient } from './RoutesListClient';

export default function RoutesListPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="px-5 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Routes</h1>
        <p className="text-slate-600 text-base sm:text-lg mb-6">
          Tap a route to view details and save for offline use.
        </p>
        <RoutesListClient />
      </div>
    </div>
  );
}
