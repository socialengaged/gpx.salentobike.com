'use client';

import type { RouteSegmentWithStats } from '@/lib/gpx';
import { useT } from '@/i18n/useT';

interface RouteSegmentCardProps {
  segment: RouteSegmentWithStats;
  onClose: () => void;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function RouteSegmentCard({ segment, onClose }: RouteSegmentCardProps) {
  const t = useT();
  const idx = segment.segmentIndex + 1;
  const total = segment.totalSegments;

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 px-3 pb-3 pt-2 pointer-events-auto safe-area-padding"
      role="dialog"
      aria-label={t('route.segment_aria')}
    >
      <div className="max-w-lg mx-auto rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex items-start gap-2 px-4 pt-3 pb-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {total > 1
                  ? interpolate(t('route.segment_stage'), { n: String(idx), total: String(total) })
                  : t('route.segment_single')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <div>
                <span className="text-slate-500">{t('route.stat_distance')}</span>
                <div className="font-semibold text-slate-900">{formatDistance(segment.distanceMeters)}</div>
              </div>
              <div>
                <span className="text-slate-500">{t('route.stat_elev_plus')}</span>
                <div className="font-semibold text-slate-900">+{Math.round(segment.elevationGainMeters)} m</div>
              </div>
              <div>
                <span className="text-slate-500">{t('route.stat_elev_minus')}</span>
                <div className="font-semibold text-slate-900">−{Math.round(segment.elevationLossMeters)} m</div>
              </div>
              <div>
                <span className="text-slate-500">{t('route.segment_points')}</span>
                <div className="font-semibold text-slate-900">{segment.pointCount}</div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 text-xl leading-none"
            aria-label={t('nav.close')}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
