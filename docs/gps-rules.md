# GPS Rules and Behavior

## Overview

The GPS engine provides reliable position tracking for route following. It is designed for PWA constraints: foreground-only, no background guarantees on iOS.

## Components

- **GpsWatcher** (`src/lib/gps/watcher.ts`): Wraps `navigator.geolocation.watchPosition`
- **route-tracking** (`src/lib/gps/route-tracking.ts`): Nearest point, progress, off-route detection
- **useGpsTracking** (`src/lib/hooks/useGpsTracking.ts`): React hook for route detail screen

## Behavior

### Permission

- Request location only when user taps "Start Route"
- Handle denied/unavailable gracefully
- No retry loops; user can tap again

### Accuracy

- **ok**: accuracy ≤ 20 m
- **weak**: accuracy 20–100 m
- **unavailable**: permission denied or error

### Noise Filtering

- **Impossible jump rejection**: Positions that jump > 500 m from the previous fix are discarded
- Configurable via `maxJumpMeters` in GpsWatcher

### Off-Route Detection

- Threshold: 50 m from nearest point on route
- State: "Possibly off route" when distance exceeds threshold
- No automatic rerouting; user decides

## iOS Constraints

- PWA runs in Safari WebView; geolocation works when app is in foreground
- Background updates are unreliable; do not depend on them
- High-accuracy mode may drain battery; consider `enableHighAccuracy: false` for long rides
- First fix can be slow; show "Acquiring GPS..." state

## Testing

- Test on real device; simulators often have poor or fake GPS
- Test with airplane mode + WiFi to simulate weak signal
- Test permission denial flow
