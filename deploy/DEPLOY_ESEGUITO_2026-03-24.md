# Deploy Salento GPX – 2026-03-24 (UTC)

## Contenuto release

- Web Vitals: `WebVitalsReporter`, preconnect tile OSM, `touch-action: manipulation`, SW con `requestIdleCallback`, `poweredByHeader: false`
- Documentazione: `deploy/SINTESI_DEPLOY_E_PROBLEMI.md` (sezione Web Vitals + rollback)
- LOD mappa (se presente nello stesso branch): fontane `minzoom` 10, label comuni `minzoom` 11

## Esecuzione

- Script: `deploy/deploy.ps1 -ServerIP "57.131.16.162"`
- Dopo deploy: smoke HTTPS (home + `/routes`), eventuale Lighthouse mobile su `https://gpx.salentobike.com`

## Rollback

- `git revert` del commit di release → redeploy con `deploy.ps1`

## Riferimento

- `deploy/SINTESI_DEPLOY_E_PROBLEMI.md`
