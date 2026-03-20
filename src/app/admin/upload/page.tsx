'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Route, RouteCategory, RouteDifficulty } from '@/lib/routes/types';

interface ParsedResult {
  normalizedGeoJson: GeoJSON.LineString;
  waypoints: Array<{ id: string; name: string; lat: number; lng: number; elevation?: number }>;
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  trackName?: string;
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [meta, setMeta] = useState({
    title: '',
    shortDescription: '',
    category: 'road' as RouteCategory,
    difficulty: 'moderate' as RouteDifficulty,
    published: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setParsed(null);
    setError(null);
  };

  const handleParse = async () => {
    if (!file) return;
    setError(null);
    try {
      const formData = new FormData();
      formData.append('gpx', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Parse failed');
      }
      const data = await res.json();
      setParsed(data);
      setMeta((m) => ({
        ...m,
        title: data.trackName || file.name.replace(/\.gpx$/i, '') || 'New Route',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
    }
  };

  const handleSave = async () => {
    if (!parsed || !meta.title) return;
    setError(null);
    try {
      const route: Partial<Route> = {
        title: meta.title,
        shortDescription: meta.shortDescription,
        category: meta.category,
        difficulty: meta.difficulty,
        distanceMeters: parsed.distanceMeters,
        elevationGainMeters: parsed.elevationGainMeters,
        elevationLossMeters: parsed.elevationLossMeters,
        estimatedDuration: Math.round(parsed.distanceMeters / 200) + Math.round(parsed.elevationGainMeters / 10),
        normalizedGeoJson: parsed.normalizedGeoJson,
        waypoints: parsed.waypoints,
        published: meta.published,
        language: 'en',
      };
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route),
      });
      if (!res.ok) throw new Error('Save failed');
      const savedRoute = await res.json();
      setSaved(true);
      setParsed(null);
      setFile(null);
      setMeta({ title: '', shortDescription: '', category: 'road', difficulty: 'moderate', published: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Upload GPX</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">GPX File</label>
          <input
            type="file"
            accept=".gpx"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 min-h-[44px]"
          />
        </div>

        <Button variant="primary" onClick={handleParse} disabled={!file}>
          Parse & Preview
        </Button>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
            Route saved successfully.
          </div>
        )}

        {parsed && (
          <div className="p-4 rounded-lg bg-slate-100 space-y-4">
            <h2 className="font-semibold text-slate-900">Metadata</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={meta.title}
                  onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={meta.shortDescription}
                  onChange={(e) => setMeta((m) => ({ ...m, shortDescription: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 min-h-[44px]"
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Type</label>
                  <select
                    value={meta.category}
                    onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value as RouteCategory }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 min-h-[44px]"
                  >
                    <option value="road">Road</option>
                    <option value="gravel">Gravel</option>
                    <option value="ebike">E-bike</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Difficulty</label>
                  <select
                    value={meta.difficulty}
                    onChange={(e) => setMeta((m) => ({ ...m, difficulty: e.target.value as RouteDifficulty }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 min-h-[44px]"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={meta.published}
                  onChange={(e) => setMeta((m) => ({ ...m, published: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm text-slate-600">Published</label>
              </div>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Distance: {(parsed.distanceMeters / 1000).toFixed(2)} km</p>
              <p>Elevation: +{parsed.elevationGainMeters} m / -{parsed.elevationLossMeters} m</p>
            </div>
            <Button variant="primary" size="lg" onClick={handleSave} disabled={!meta.title}>
              Save Route
            </Button>
          </div>
        )}
      </div>

      <Link href="/admin" className="mt-8">
        <Button variant="outline" size="md">
          Back to Admin
        </Button>
      </Link>
    </div>
  );
}
