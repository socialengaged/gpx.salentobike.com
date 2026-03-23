'use client';

import type { ComuneLite } from '@/lib/comuni/types';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { getSummaryLabels } from '@/lib/comuni/summaryLabels';

interface ComuneBottomCardProps {
  comune: ComuneLite;
  onClose: () => void;
}

type RowDef = {
  emoji: string;
  label: string;
  n: number | null | undefined;
  /** Short hint under label (e.g. OSM vs schede) */
  hint?: string;
};

export function ComuneBottomCard({ comune, onClose }: ComuneBottomCardProps) {
  const { locale } = useLocale();
  const t = useT();
  const L = getSummaryLabels(locale);

  const rows: RowDef[] = [
    { emoji: '🚰', label: L.rowFontane, n: comune.poi_fontane },
    { emoji: '🍴', label: L.rowRistoranti, n: comune.poi_ristoranti },
    { emoji: '💊', label: L.rowFarmacie, n: comune.poi_farmacie },
    { emoji: '🏥', label: L.rowOspedali, n: comune.poi_ospedali },
    { emoji: '🔧', label: L.rowBici, n: comune.poi_bici },
    { emoji: '🏛️', label: L.rowAttr, n: comune.txt_attr, hint: t('comune.map_hint_row_attr') },
    { emoji: '📋', label: L.rowSpec, n: comune.txt_spec, hint: t('comune.map_hint_row_spec') },
  ].filter((r) => r.n != null && r.n > 0);

  const hasOsmCounts =
    (comune.poi_fontane ?? 0) > 0 ||
    (comune.poi_ristoranti ?? 0) > 0 ||
    (comune.poi_farmacie ?? 0) > 0 ||
    (comune.poi_ospedali ?? 0) > 0 ||
    (comune.poi_bici ?? 0) > 0;

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 px-3 pb-3 sm:pb-3 pt-2 sm:pt-2 pointer-events-auto safe-area-padding"
      role="dialog"
      aria-label={comune.nome}
    >
      <div className="w-full max-w-lg sm:max-w-md mx-auto rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-4 pt-4 sm:pt-3 pb-2">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5 sm:mb-1">
                {t('comune.map_card_municipality')}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap gap-y-1">
                <h3 className="font-bold text-xl sm:text-lg md:text-xl text-slate-900 leading-tight">
                  {comune.nome}
                </h3>
                <span className="shrink-0 bg-slate-100 text-slate-700 rounded-md sm:rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm font-semibold">
                  {comune.prov}
                </span>
              </div>
              <p className="text-sm sm:text-xs text-slate-600 mt-1.5 sm:mt-1 font-medium leading-snug">
                {L.whatIsHere}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 text-2xl sm:text-xl leading-none"
              aria-label={t('nav.close')}
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-4 pb-3 max-h-[min(40vh,320px)] sm:max-h-[min(24vh,220px)] overflow-y-auto">
          {rows.length > 0 ? (
            <ul className="space-y-0 rounded-xl sm:rounded-lg bg-slate-50 border border-slate-100 divide-y divide-slate-200/80">
              {rows.map((r) => (
                <li
                  key={r.label + r.emoji}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-3 py-3 min-h-[48px] sm:min-h-[44px] sm:py-2 first:rounded-t-xl sm:first:rounded-t-lg last:rounded-b-xl sm:last:rounded-b-lg"
                >
                  <span className="text-2xl sm:text-xl shrink-0 w-10 sm:w-9 text-center" aria-hidden>
                    {r.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {r.label}
                    </div>
                    {r.hint ? (
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{r.hint}</div>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-lg sm:text-xl font-bold tabular-nums text-sky-800">{r.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm sm:text-base text-slate-600 py-3 px-1">{L.noData}</p>
          )}
          {hasOsmCounts ? (
            <p className="text-xs sm:text-[11px] text-slate-500 mt-2 sm:mt-1.5 leading-relaxed">{L.summaryOsmNote}</p>
          ) : null}
        </div>

        <div className="px-4 pb-4 sm:pb-3 pt-0.5">
          {/*
            Full document navigation (plain <a>) — not next/link. Client-side transition from
            the route map page tears down MapLibre/WebGL while React navigates; on mobile + SW
            that can surface as an application error ("refresh / go back"). Hard navigation avoids it.
          */}
          <a
            href={`/comuni/${comune.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center text-center py-3.5 sm:py-2.5 rounded-xl bg-sky-600 text-white text-sm sm:text-base font-semibold hover:bg-sky-700 transition-colors min-h-[48px] sm:min-h-[44px] touch-manipulation"
          >
            {L.popupMore}
          </a>
        </div>
      </div>
    </div>
  );
}
