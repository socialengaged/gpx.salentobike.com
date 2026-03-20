# iOS PWA Constraints

## Add to Home Screen

- Must use **Safari**; Chrome/Firefox "Add to Home Screen" creates a bookmark, not a PWA
- Custom install instructions at `/install`

## Capabilities

### Works

- Geolocation (foreground)
- IndexedDB
- Service Worker caching
- Standalone display mode
- Offline access to cached/saved content

### Limited or Unreliable

- **Background geolocation**: iOS suspends PWAs; no reliable background GPS
- **Push notifications**: Not supported for PWAs
- **Background sync**: Not supported
- **Web Share API**: Limited

## UX Recommendations

1. **Keep app in foreground** while tracking; inform user
2. **Request location only when needed** (Start Route)
3. **Large tap targets** (min 44pt)
4. **Avoid modals** that block interaction
5. **Retry controls** for failed fetches and GPS
6. **Clear copy** for permission prompts and offline states

## Safe Area

- Use `env(safe-area-inset-*)` for notched devices
- Applied in `.safe-area-padding` class

## Testing

- Test on real iPhone; simulator behavior differs
- Test Add to Home Screen flow
- Test offline after saving route
- Test GPS with app in foreground and after switching away and back
