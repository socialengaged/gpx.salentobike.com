'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function AccessoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/site-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Accesso negato');
      }
      const dest = from.startsWith('/') ? from : '/';
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Salento Bike</h1>
        <p className="text-base text-slate-600 text-center">
          Inserisci la password per accedere al sito.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="site-password" className="block text-base font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="site-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 text-base min-h-[52px]"
              placeholder="Password"
              autoFocus
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-base">{error}</div>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading || !password}>
            {loading ? 'Accesso...' : 'Entra'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AccessoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg text-slate-600">Caricamento...</div>}>
      <AccessoForm />
    </Suspense>
  );
}
