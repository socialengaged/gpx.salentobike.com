import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getComuniFromDisk, getComuneBySlugFromDisk } from '@/lib/comuni/loader-server';
import { getSummaryLabels } from '@/lib/comuni/summaryLabels';
import { ComuneMiniMap } from './ComuneMiniMap';
import type { Comune } from '@/lib/comuni/types';
import type { Locale } from '@/i18n/types';
import { LOCALE_COOKIE } from '@/i18n/types';
import { getMessages } from '@/i18n/getMessages';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getComuniFromDisk()
    .filter((c) => c.lat != null && c.lon != null)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comune = getComuneBySlugFromDisk(slug);
  if (!comune) return {};
  return {
    title: `${comune.nome} — Salento Bike`,
    description: comune.improved_intro?.slice(0, 160) ?? `Informazioni su ${comune.nome} per ciclisti`,
  };
}

/** Count lines starting with "- " (CSV narrative lists). */
function countBulletItems(text: string | null): number {
  if (!text) return 0;
  const lines = text.split(/\n/).map((l) => l.trim());
  const bullets = lines.filter((l) => /^\s*-\s/.test(l));
  if (bullets.length > 0) return bullets.length;
  const inline = text.split(/\s+-\s+/).filter((p) => p.length > 8);
  if (inline.length >= 2) return inline.length;
  return 0;
}

/** Rough count of "places" in prose attractions (sentences with substance). */
function countAttractionItems(text: string | null): number {
  if (!text) return 0;
  const b = countBulletItems(text);
  if (b > 0) return b;
  const sentences = text.split(/\.\s+/).filter((s) => s.trim().length > 25);
  return Math.max(0, sentences.length);
}

function QuickSummary({ comune, locale }: { comune: Comune; locale: Locale }) {
  const labels = getSummaryLabels(locale);
  const spec = countBulletItems(comune.restaurants_section);
  const attr = countAttractionItems(comune.attractions_section);

  const textRows: { label: string; value: number; sub: string }[] = [];
  if (spec > 0)
    textRows.push({ label: labels.rowSpec, value: spec, sub: labels.hintSpec });
  if (attr > 0)
    textRows.push({ label: labels.rowAttr, value: attr, sub: labels.hintAttr });

  const osmRows: { label: string; value: number; sub: string }[] = [];
  const add = (label: string, v: number | null | undefined) => {
    if (v != null) osmRows.push({ label, value: v, sub: labels.hintOsm });
  };
  add(labels.rowFontane, comune.poi_fontane);
  add(labels.rowRistoranti, comune.poi_ristoranti);
  add(labels.rowFarmacie, comune.poi_farmacie);
  add(labels.rowOspedali, comune.poi_ospedali);
  add(labels.rowBici, comune.poi_bici);

  const hasPoiData = osmRows.some((r) => r.value > 0);
  const hasTextData = textRows.length > 0;
  if (!hasPoiData && !hasTextData) return null;

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 space-y-3">
      <h2 className="text-xl font-bold text-slate-900">{labels.summaryTitle}</h2>
      {osmRows.length > 0 && (
        <p className="text-sm text-slate-600">{labels.summaryOsmNote}</p>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base">
        {textRows.map((c) => (
          <li
            key={c.label}
            className="flex justify-between gap-2 rounded-lg bg-white/90 border border-slate-200 px-3 py-3"
          >
            <span className="text-slate-700">{c.label}</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {c.value}
              <span className="font-normal text-slate-500 text-sm ml-1">({c.sub})</span>
            </span>
          </li>
        ))}
        {osmRows.map((c) => (
          <li
            key={c.label}
            className="flex justify-between gap-2 rounded-lg bg-white/90 border border-slate-200 px-3 py-3"
          >
            <span className="text-slate-700">{c.label}</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {c.value}
              <span className="font-normal text-slate-500 text-sm ml-1">({c.sub})</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function parseSectionContent(content: string): { bullets: string[] } | { paragraphs: string[] } {
  const trimmed = content.trim();
  const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const lineBullets = lines.filter((l) => /^\s*-\s/.test(l));
  if (lineBullets.length >= 1) {
    return {
      bullets: lineBullets.map((l) => l.replace(/^\s*-\s*/, '').trim()),
    };
  }
  if (trimmed.includes(' - ') && !trimmed.includes('\n')) {
    const parts = trimmed.split(/\s+-\s+/).map((p) => p.trim()).filter((p) => p.length > 2);
    if (parts.length >= 2) return { bullets: parts };
  }
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return { paragraphs };
}

function Section({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: string;
}) {
  const parsed = parseSectionContent(content);
  if ('bullets' in parsed && parsed.bullets.length > 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-xl">{icon}</span> {title}
        </h2>
        <ul className="list-none space-y-3 pl-0">
          {parsed.bullets.map((item, i) => {
            const colon = item.indexOf(':');
            const hasTitle = colon > 0 && colon < 80;
            return (
              <li key={i} className="flex gap-2 text-base leading-relaxed text-slate-700">
                <span className="text-sky-600 font-bold shrink-0">•</span>
                <span>
                  {hasTitle ? (
                    <>
                      <strong className="text-slate-900">{item.slice(0, colon).trim()}</strong>
                      {item.slice(colon)}
                    </>
                  ) : (
                    item
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
  const paragraphs = 'paragraphs' in parsed ? parsed.paragraphs : [];
  if (paragraphs.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h2>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-base leading-relaxed text-slate-700">
          {p}
        </p>
      ))}
    </section>
  );
}

export default async function ComuneDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const comune = getComuneBySlugFromDisk(slug);
  if (!comune) notFound();

  const cookieStore = await cookies();
  const locale: Locale =
    cookieStore.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'it';
  const m = getMessages(locale);
  const summaryBadges = getSummaryLabels(locale);

  const hasSections =
    comune.improved_intro || comune.attractions_section || comune.restaurants_section;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      <div className="bg-gradient-to-br from-sky-600 to-sky-700 text-white px-5 py-6">
        <Link
          href="/routes"
          className="inline-flex items-center gap-1 text-sky-100 hover:text-white text-sm mb-3"
        >
          {m['comune.back']}
        </Link>
        <h1 className="text-2xl font-bold">{comune.nome}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center bg-white/20 rounded-md px-2.5 py-0.5 text-sm font-medium">
            📍 {comune.provincia_sigla}
          </span>
          {comune.cap && (
            <span className="inline-flex items-center bg-white/20 rounded-md px-2.5 py-0.5 text-sm font-medium">
              CAP {comune.cap}
            </span>
          )}
          {comune.restaurants_section && (
            <span className="inline-flex items-center bg-green-400/30 rounded-md px-2.5 py-0.5 text-sm font-medium">
              {summaryBadges.cuisineBadge}
            </span>
          )}
          {comune.attractions_section && (
            <span className="inline-flex items-center bg-blue-400/30 rounded-md px-2.5 py-0.5 text-sm font-medium">
              {summaryBadges.attractionsBadge}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-6 space-y-8 max-w-3xl mx-auto w-full">
        <QuickSummary comune={comune} locale={locale} />

        {comune.improved_intro && (
          <Section icon="ℹ️" title="Informazioni" content={comune.improved_intro} />
        )}

        {comune.attractions_section && (
          <Section
            icon="🏛️"
            title="Attrazioni e luoghi di interesse"
            content={comune.attractions_section}
          />
        )}

        {comune.restaurants_section && (
          <Section
            icon="🍴"
            title="Ristoranti e cucina locale"
            content={comune.restaurants_section}
          />
        )}

        {!hasSections && (
          <p className="text-slate-500 text-center py-8">
            {m['comune.no_sections']}
          </p>
        )}

        {comune.lat != null && comune.lon != null && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-xl">🗺️</span> {m['comune.position']}
            </h2>
            <div className="rounded-xl overflow-hidden border border-slate-200 h-[250px]">
              <ComuneMiniMap lat={comune.lat} lon={comune.lon} nome={comune.nome} />
            </div>
          </section>
        )}

        <div className="pt-4 pb-8 text-center">
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 bg-sky-600 text-white rounded-lg px-6 py-3 text-base font-semibold hover:bg-sky-700 active:bg-sky-800"
          >
            {m['comune.back']}
          </Link>
        </div>
      </div>
    </div>
  );
}
