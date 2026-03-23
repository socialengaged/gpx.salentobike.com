'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Logs Core Web Vitals in development (Chrome DevTools / console).
 * In production, enable with NEXT_PUBLIC_WEB_VITALS_LOG=1 for field debugging (mobile).
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const log =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_WEB_VITALS_LOG === '1';
    if (!log) return;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[web-vitals] ${metric.name}`, metric.value.toFixed(2), metric.rating ?? '');
    } else {
      console.info('[web-vitals]', metric.name, Math.round(metric.value), metric.rating ?? '');
    }
  });

  return null;
}
