import { RoutesListClient } from './RoutesListClient';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function RoutesListPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="px-5 py-6 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Route</h1>
        <p className="text-slate-600 text-base sm:text-lg mb-6">
          Tocca una route per vedere i dettagli e salvarla per l&apos;uso offline.
        </p>
        <RoutesListClient />
      </div>
      <SiteFooter />
    </div>
  );
}
