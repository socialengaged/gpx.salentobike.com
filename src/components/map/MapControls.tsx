'use client';

import { useEffect } from 'react';
import { useMapContext } from './MapContext';

interface MapControlsProps {
  position?: { lat: number; lng: number } | null;
  onRecenter?: () => void;
  autoCenter?: boolean;
  onAutoCenterToggle?: () => void;
  showRecenter?: boolean;
}

export function MapControls({
  position,
  onRecenter,
  autoCenter,
  onAutoCenterToggle,
  showRecenter = true,
}: MapControlsProps) {
  const { map, mapReady } = useMapContext();

  useEffect(() => {
    if (autoCenter && map && position) {
      map.flyTo({ center: [position.lng, position.lat], duration: 300 });
    }
  }, [autoCenter, map, position?.lat, position?.lng]);

  const handleRecenter = () => {
    if (map && position) {
      map.flyTo({ center: [position.lng, position.lat], duration: 500 });
    } else if (onRecenter) {
      onRecenter();
    }
  };

  if (!map || !mapReady) return null;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {showRecenter && (position || onRecenter) && (
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 min-w-[44px] min-h-[44px]"
          aria-label="Centra mappa"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      )}
      {onAutoCenterToggle && (
        <button
          type="button"
          onClick={onAutoCenterToggle}
          className={`w-10 h-10 rounded-full shadow-md border flex items-center justify-center min-w-[44px] min-h-[44px] ${
            autoCenter
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          aria-label={autoCenter ? 'Auto-center on' : 'Auto-center off'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
    </div>
  );
}
