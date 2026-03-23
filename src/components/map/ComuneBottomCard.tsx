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

export function ComuneBottomCard({ comune, onClose }: ComuneBottomCardProps) {
  const { locale } = useLocale();
  const t = useT();
  const L = getSummaryLabels(locale);

  const chips: { emoji: string; n: number | null | undefined }[] = [
    { emoji: '🚰', n: comune.poi_fontane },
    { emoji: '🍴', n: comune.poi_ristoranti },
    { emoji: '💊', n: comune.poi_farmacie },
    { emoji: '🏥', n: comune.poi_ospedali },
    { emoji: '🔧', n: comune.poi_bici },
    { emoji: '🏛️', n: comune.txt_attr },
    { emoji: '📋', n: comune.txt_spec },
  ].filter((c) => c.n != null && c.n > 0);

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 px-3 pb-3 pt-2 pointer-events-auto safe-area-padding"
      role="dialog"
      aria-label={comune.nome}
    >
      <div className="max-w-lg mx-auto rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex items-start gap-2 px-4 pt-3 pb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-900 leading-tight">{comune.nome}</h3>
              <span className="shrink-0 bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-xs font-semibold">
                {comune.prov}
              </span>
            </div>
            {chips.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {chips.map((c) => (
                  <span
                    key={c.emoji + String(c.n)}
                    className="inline-flex items-center rounded px-1.5 py-0.5 bg-slate-100 text-xs font-semibold text-slate-800"
                  >
                    {c.emoji}
                    {c.n}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">{L.noData}</p>
            )}
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
        <div className="px-4 pb-3">
          <Link
            href={`/comuni/${comune.slug}`}
            className="block w-full text-center py-3 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
          >
            {L.popupMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
