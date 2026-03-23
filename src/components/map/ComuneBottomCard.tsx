'use client';

import Link from 'next/link';
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
      className="absolute left-0 right-0 bottom-0 z-20 px-3 pb-4 pt-3 pointer-events-auto safe-area-padding"
      role="dialog"
      aria-label={comune.nome}
    >
      <div className="max-w-3xl w-full mx-auto rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                {t('comune.map_card_municipality')}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap gap-y-1">
                <h3 className="font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">{comune.nome}</h3>
                <span className="shrink-0 bg-slate-100 text-slate-700 rounded-lg px-2 py-1 text-sm font-semibold">
                  {comune.prov}
                </span>
              </div>
              <p className="text-base text-slate-600 mt-2 font-medium">{L.whatIsHere}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 text-2xl leading-none"
              aria-label={t('nav.close')}
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 pb-4 max-h-[min(50vh,420px)] overflow-y-auto">
          {rows.length > 0 ? (
            <ul className="space-y-0 rounded-2xl bg-slate-50 border border-slate-100 divide-y divide-slate-200/80">
              {rows.map((r) => (
                <li
                  key={r.label + r.emoji}
                  className="flex items-center gap-3 px-4 py-3.5 min-h-[56px] first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <span className="text-3xl shrink-0 w-12 text-center" aria-hidden>
                    {r.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">{r.label}</div>
                    {r.hint ? (
                      <div className="text-xs text-slate-500 mt-0.5">{r.hint}</div>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-2xl sm:text-3xl font-bold tabular-nums text-sky-800">{r.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-slate-600 py-4 px-2">{L.noData}</p>
          )}
          {hasOsmCounts ? (
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{L.summaryOsmNote}</p>
          ) : null}
        </div>

        <div className="px-5 pb-5 pt-1">
          <Link
            href={`/comuni/${comune.slug}`}
            className="flex w-full items-center justify-center text-center py-4 rounded-2xl bg-sky-600 text-white text-base font-semibold hover:bg-sky-700 transition-colors min-h-[52px]"
          >
            {L.popupMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
