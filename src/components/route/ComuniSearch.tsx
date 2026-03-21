'use client';

import { useState, useEffect } from 'react';
import { getComuniSalento } from '@/lib/comuni/loader';
import type { Comune } from '@/lib/comuni/types';

type Filter = 'all' | 'restaurants' | 'attractions' | 'history';

function matchFilter(c: Comune, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'restaurants') return !!c.restaurants_section?.trim();
  if (filter === 'attractions') return !!c.attractions_section?.trim();
  if (filter === 'history') return !!(c.improved_intro?.trim() || c.attractions_section?.trim());
  return true;
}

function truncate(s: string | null, len: number): string {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= len ? t : t.slice(0, len) + '…';
}

export function ComuniSearch() {
  const [comuni, setComuni] = useState<Comune[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getComuniSalento().then(setComuni);
  }, []);

  const q = query.toLowerCase().trim();
  const filtered = comuni.filter(
    (c) =>
      matchFilter(c, filter) &&
      (c.nome.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-slate-700">Cerca comuni</div>
      <input
        type="search"
        placeholder="Nome comune..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-base"
      />
      <div className="flex gap-2 flex-wrap">
        {(['all', 'restaurants', 'attractions', 'history'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1.5 min-h-[36px] rounded-full text-sm font-medium ${
              filter === f ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {f === 'all' ? 'Tutti' : f === 'restaurants' ? 'Ristoranti' : f === 'attractions' ? 'Attrazioni' : 'Storico'}
          </button>
        ))}
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-1">
        {filtered.slice(0, 20).map((c) => (
          <div
            key={c.slug}
            className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === c.slug ? null : c.slug)}
              className="w-full px-3 py-2.5 min-h-[44px] text-left text-base font-medium text-slate-900 hover:bg-slate-100"
            >
              {c.nome}
            </button>
            {expanded === c.slug && (
              <div className="px-3 py-2 text-xs text-slate-600 space-y-1 border-t border-slate-200">
                {c.improved_intro && <p>{truncate(c.improved_intro, 120)}</p>}
                {c.restaurants_section && (
                  <p><span className="font-medium">Cucina:</span> {truncate(c.restaurants_section, 80)}</p>
                )}
                {c.attractions_section && (
                  <p><span className="font-medium">Attrazioni:</span> {truncate(c.attractions_section, 80)}</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length > 20 && (
          <p className="text-sm text-slate-500 py-1">+{filtered.length - 20} altri</p>
        )}
      </div>
    </div>
  );
}
