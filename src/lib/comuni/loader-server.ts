import { readFileSync } from 'fs';
import { join } from 'path';
import type { Comune } from './types';

let cache: Comune[] | null = null;

export function getComuniFromDisk(): Comune[] {
  if (cache) return cache;
  const filePath = join(process.cwd(), 'public', 'data', 'comuni-puglia.json');
  cache = JSON.parse(readFileSync(filePath, 'utf8')) as Comune[];
  return cache;
}

export function getComuneBySlugFromDisk(slug: string): Comune | undefined {
  return getComuniFromDisk().find((c) => c.slug === slug);
}
