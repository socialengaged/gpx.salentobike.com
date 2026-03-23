# Deploy Salento GPX – 2026-03-24 (UTC)

## Contenuto release

- Web Vitals: `WebVitalsReporter`, preconnect tile OSM, `touch-action: manipulation`, SW con `requestIdleCallback`, `poweredByHeader: false`
- Documentazione: `deploy/SINTESI_DEPLOY_E_PROBLEMI.md` (sezione Web Vitals + rollback)
- LOD mappa (se presente nello stesso branch): fontane `minzoom` 10, label comuni `minzoom` 11

## Esecuzione

- Script: `deploy/deploy.ps1 -ServerIP "57.131.16.162"`
- **Deploy OK** (UTC ~19:55 server log); `salentogpx.service` attivo; Nginx `nginx -t` OK
- **Smoke HTTPS**: `GET /` → 200, `GET /routes` → 200
- **Git**: commit `9ae70d6` su `main`, push `origin/main` OK
- Dopo deploy: Lighthouse mobile / PageSpeed (campo) su `https://gpx.salentobike.com` opzionale; in dev aprire console per log `[web-vitals]`

## Rollback

- `git revert` del commit di release → redeploy con `deploy.ps1`

## Riferimento

- `deploy/SINTESI_DEPLOY_E_PROBLEMI.md`
