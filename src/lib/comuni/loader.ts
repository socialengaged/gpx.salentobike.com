import type { Comune } from './types';

let cachedComuni: Comune[] | null = null;

export async function getComuniSalento(): Promise<Comune[]> {
  if (cachedComuni) return cachedComuni;
  const res = await fetch('/data/comuni-puglia.json');
  if (!res.ok) return [];
  cachedComuni = (await res.json()) as Comune[];
  return cachedComuni;
}

export async function getComuniWithCoords(): Promise<Comune[]> {
  const all = await getComuniSalento();
  return all.filter((c) => c.lat != null && c.lon != null);
}

export async function getComuneBySlug(slug: string): Promise<Comune | null> {
  const all = await getComuniSalento();
  return all.find((c) => c.slug === slug) ?? null;
}

