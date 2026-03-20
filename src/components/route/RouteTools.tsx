'use client';

import { useState } from 'react';
import type { Route } from '@/lib/routes/types';
import { Button } from '@/components/ui/Button';
import {
  reverseTrack,
  computeReversedStats,
  splitTrackAtPercentage,
  downloadGpx,
  routeToGpxPoints,
  gpxPointsToRoute,
} from '@/lib/gpx';

interface RouteToolsProps {
  route: Route;
  onRouteChange: (route: Route) => void;
  onSplitResult?: (routes: [Route, Route]) => void;
}

export function RouteTools({ route, onRouteChange, onSplitResult }: RouteToolsProps) {
  const [splitPercent, setSplitPercent] = useState(50);
  const [showSplit, setShowSplit] = useState(false);

  const handleReverse = () => {
    const points = routeToGpxPoints(route);
    const reversed = reverseTrack(points);
    const stats = computeReversedStats(points);
    const newRoute = gpxPointsToRoute(reversed, route, {
      ...stats,
      title: `${route.title} (reversed)`,
      slug: `${route.slug}-reversed`,
      id: `${route.id}-reversed`,
    });
    onRouteChange(newRoute);
  };

  const handleSplit = () => {
    const points = routeToGpxPoints(route);
    const { part1, part2, stats1, stats2 } = splitTrackAtPercentage(points, splitPercent);
    if (part1.length < 2 || part2.length < 2) return;
    const route1 = gpxPointsToRoute(part1, route, {
      ...stats1,
      title: `${route.title} (part 1)`,
      slug: `${route.slug}-part1`,
      id: `${route.id}-part1`,
      waypoints: [],
    });
    const route2 = gpxPointsToRoute(part2, route, {
      ...stats2,
      title: `${route.title} (part 2)`,
      slug: `${route.slug}-part2`,
      id: `${route.id}-part2`,
      waypoints: [],
    });
    onRouteChange(route1);
    onSplitResult?.([route1, route2]);
    setShowSplit(false);
  };

  const handleExport = () => {
    downloadGpx(route);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        <Button variant="ghost" size="md" onClick={handleReverse}>
          Reverse route
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowSplit(!showSplit)}
        >
          Split route
        </Button>
        <Button variant="ghost" size="md" onClick={handleExport}>
          Export GPX
        </Button>
      </div>
      {showSplit && (
        <div className="p-4 rounded-xl bg-slate-100 space-y-3">
          <label className="block text-base text-slate-600">
            Split at {splitPercent}%
          </label>
          <input
            type="range"
            min="10"
            max="90"
            value={splitPercent}
            onChange={(e) => setSplitPercent(Number(e.target.value))}
            className="w-full h-3"
          />
          <Button variant="primary" size="md" onClick={handleSplit}>
            Apply split
          </Button>
        </div>
      )}
    </div>
  );
}
