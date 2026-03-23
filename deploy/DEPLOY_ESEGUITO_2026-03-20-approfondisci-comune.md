# Deploy Salento GPX – 2026-03-20 (fix Approfondisci comune da mappa)

## Contenuto release

- **Fix UX**: da route con mappa MapLibre, tap «Approfondisci» sulla card comune (`ComuneBottomCard`) usa **`<a href="/comuni/…">`** (navigazione documento completa) invece di `next/link`, per evitare errore / schermata «refresh / go back» durante lo smontaggio WebGL + transizione client-side.
- **SW**: rigenerato con `npm run build` (`public/sw.js`).

## Verifica post-deploy

- Apri una route con mappa → tap su un comune → **Approfondisci** → deve caricare la scheda `/comuni/[slug]` senza errore (anche su Chrome Android / PWA).

## Riferimenti

- Codice: [`src/components/map/ComuneBottomCard.tsx`](../src/components/map/ComuneBottomCard.tsx)
- Sintesi: [`deploy/SINTESI_DEPLOY_E_PROBLEMI.md`](SINTESI_DEPLOY_E_PROBLEMI.md) (sezione «Approfondisci comune dalla mappa route»)

## Esecuzione

- Script: `deploy/deploy.ps1 -ServerIP "57.131.16.162"`
- **Deploy OK** (2026-03-23 ~22:04 UTC): `salentogpx.service` attivo; Nginx HTTPS OK
- **Smoke HTTPS**: `GET https://gpx.salentobike.com/comuni/lecce` → **200**
- **Git**: `main` → `origin/main` (commit deploy: `fix: Approfondisci comune da mappa con <a>…` + `docs: deploy note…`)
