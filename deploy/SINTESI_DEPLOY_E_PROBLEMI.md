# Salento GPX - Sintesi Deploy, Problemi e Cose da NON Fare

## Dominio e server

- **URL**: https://gpx.salentobike.com
- **Server**: 57.131.16.162 (OVH)
- **Path app**: /home/ubuntu/apps/salentogpx
- **Porta**: 3010
- **Servizio**: salentogpx.service

---

## Flusso deploy (da seguire sempre)

1. **Da PowerShell**:
   ```powershell
   cd C:\Users\info\Desktop\salentogpx\deploy
   .\deploy.ps1 -ServerIP "57.131.16.162"
   ```

2. **Cosa fa lo script**:
   - Build locale (`npm run build`)
   - Crea/copia file sul server (esclude .git, node_modules, .next)
   - Sul server: `npm install`, `npm run build`
   - Copia servizio systemd, restart
   - Configura Nginx: HTTPS se cert esiste, altrimenti HTTP-only

3. **Chiave SSH OVH**: `%USERPROFILE%\.ssh\ssh-key-2026-01-02.key` (es. `C:\Users\info\.ssh\ssh-key-2026-01-02.key`) — spostata in `.ssh` rispetto al vecchio path `Desktop\ssh ORACLE\`

4. **Verifica post-deploy**:
   - https://gpx.salentobike.com (deve mostrare "Salento Bike Routes")
   - **PWA (Chrome Android)**: banner «Installa» → deve aprire il **dialogo di installazione di sistema** (non solo testo). Se compare solo la guida, controllare icone 192/512 reali e SW attivo.
   - Se vedi un altro sito → vedi sezione Problemi

---

## Problemi già riscontrati e fix

### 1. HTTPS mostra un altro sito (Ads Control Center o simile)

**Causa**: La config Nginx per gpx.salentobike.com era HTTP-only (porta 80). Le richieste HTTPS (porta 443) venivano gestite dal *default server* di Nginx, che puntava a un’altra app sullo stesso server.

**Fix**:
```powershell
# Da Windows PowerShell — SSH sul server (chiave in %USERPROFILE%\.ssh\)
ssh -i "$env:USERPROFILE\.ssh\ssh-key-2026-01-02.key" ubuntu@57.131.16.162
```
Sul server (bash):
```bash
sudo cp /home/ubuntu/apps/salentogpx/deploy/gpx.salentobike.com.nginx.conf /etc/nginx/sites-available/gpx-salentobike
sudo nginx -t
sudo systemctl reload nginx
```

**Prevenzione**: Lo script di deploy ora usa `sudo test -d` per verificare il cert, così applica la config HTTPS quando il certificato esiste.

### 2. Deploy applica sempre HTTP-only anche se il cert c’è

**Causa**: Lo script controllava `[ -d /etc/letsencrypt/live/gpx.salentobike.com ]` come utente `ubuntu`, ma la directory è leggibile solo da root.

**Fix**: Usare `sudo test -d` nel controllo (già applicato nello script).

---

## Cose da NON fare

1. **Non modificare altri siti Nginx**  
   Sul server ci sono molti siti (ads-control-center, plan.salentobike.com, nemira.ai, ecc.). Modificare solo i file in `deploy/` e la config `gpx-salentobike`.

2. **Non usare Vercel o altri host per questo progetto**  
   Il deploy è su OVH con lo script `deploy.ps1`. Non usare `vercel deploy` o simili.

3. **Non toccare la porta 3010**  
   L’app Next.js gira sulla 3010. Nginx fa proxy da 80/443 a 3010. Cambiare porta richiede aggiornare Nginx e systemd.

4. **Non disabilitare il link gpx-salentobike in sites-enabled**  
   `sudo ln -sf /etc/nginx/sites-available/gpx-salentobike /etc/nginx/sites-enabled/` deve restare attivo.

5. **Non fare deploy senza verificare**  
   Dopo ogni deploy, controllare https://gpx.salentobike.com. Se compare un altro sito, applicare subito il fix HTTPS (vedi sopra).

6. **Non eliminare il backup Nginx**  
   Lo script fa backup in `gpx-salentobike.bak`. Utile per rollback.

---

## Comandi utili sul server

```bash
# Restart app
sudo systemctl restart salentogpx.service

# Log app
journalctl -u salentogpx.service -f -n 50

# Test locale (dall'interno del server)
curl -s http://127.0.0.1:3010/ | head -20

# Verifica config Nginx
sudo nginx -t

# Reload Nginx (dopo modifica config)
sudo systemctl reload nginx

# Lista cert LetsEncrypt
sudo ls /etc/letsencrypt/live/
```

---

## Web Vitals, mobile-first, stabilità

- **`WebVitalsReporter`** ([`src/components/layout/WebVitalsReporter.tsx`](../src/components/layout/WebVitalsReporter.tsx)): in **sviluppo** logga LCP / INP / CLS in console. In **produzione** solo se `NEXT_PUBLIC_WEB_VITALS_LOG=1` nel build (vedi [`.env.example`](../.env.example); utile per debug mobile sul campo).
- **Checklist test** (Lighthouse lab + usabilità manuale + comandi): [`docs/usability-performance-checklist.md`](../docs/usability-performance-checklist.md).
- **`layout.tsx`**: `dns-prefetch` + `preconnect` verso `a.tile.openstreetmap.org` (tile mappa OSM dopo primo paint).
- **`globals.css`**: su `pointer: coarse`, `touch-action: manipulation` su bottoni/link (migliora reattività tap / INP su WebKit legacy).
- **`MobileShell`**: registrazione Service Worker con **`requestIdleCallback`** (timeout 1.5s) o `setTimeout(0)` fallback — meno lavoro sul main thread al caricamento.
- **`next.config.ts`**: `poweredByHeader: false` (header in meno).
- **Mappe (LOD)**: fontane e label comuni con `minzoom` (vedi [`ComuniLayer`](../src/components/map/ComuniLayer.tsx), [`FontaneLayer`](../src/components/map/FontaneLayer.tsx)) per meno draw su zoom regionale.

### Rollback sicuro (produzione)

1. **Codice**: `git revert <commit>` (o `git checkout <tag> -- .`) poi commit.
2. **Deploy**: rieseguire [`deploy/deploy.ps1`](deploy.ps1) come sempre (build sul server da cartella aggiornata).
3. **Nginx/systemd**: non toccati se non si modificano file in `deploy/`; backup `gpx-salentobike.bak` resta sul server.
4. **Emergenza senza git sul server**: ripristinare backup cartella app se ne esiste uno (lo script non crea tarball automatico; il rollback “pulito” è git + redeploy).

---

## File di deploy

| File | Scopo |
|------|-------|
| `deploy.ps1` | Script principale di deploy |
| `gpx.salentobike.com.nginx.conf` | Config Nginx con HTTPS |
| `gpx.salentobike.com.nginx-http-only.conf` | Config Nginx solo HTTP (fallback) |
| `salentogpx.service` | Servizio systemd |
| `DEPLOY_ESEGUITO_*.md` | Storico deploy (es. `DEPLOY_ESEGUITO_2026-03-23.md`) |
| `SINTESI_DEPLOY_E_PROBLEMI.md` | Questo file |

---

## Certificato SSL

- **Path**: /etc/letsencrypt/live/gpx.salentobike.com/
- **Scadenza**: verificare con `sudo certbot certificates`
- **Rinnovo**: certbot in genere rinnova in automatico

---

## Storico modifiche

| Data | Modifica |
|------|----------|
| 2026-03-24 | **QA usabilità/performance**: `docs/usability-performance-checklist.md` (Lighthouse su `/`, `/routes`, `/routes/lecce-loop`; tabella punteggi; checklist mobile manuale); `.env.example` per `NEXT_PUBLIC_WEB_VITALS_LOG` |
| 2026-03-23 | **Scheda comune mappa**: card più grande (`max-w-3xl`), titolo comune evidenziato + etichetta «Comune»; elenco righe emoji + nome categoria + numero; note OSM/schede; cerchi e label comuni sulla mappa più grandi |
| 2026-03-24 | **Route page – mappa vs pannello + click traccia**: pannello controlli più compatto (`max-h` ~42vh, stats/profilo più bassi); mappa con `min-h` generosa; **priorità tap**: `mapHitUtils` + layer order così il tap sulla traccia non viene “rubato” dai comuni/fontane/waypoint; card tappa GPX (`RouteSegmentCard`); hit linea più larga |
| 2026-03-24 | **Leggibilità mobile (tipografia)**: `html` root **20px** (≤1023px) per scalare tutti i `rem` Tailwind; `body` `1rem` + `line-height` 1.55; `BottomNav` etichette `text-xs` al posto di 10px fissi; popup fontane e label comuni mappa leggermente più grandi |
| 2026-03-21 | **Mobile Map UX**: comuni/fontane marker zoom-adattivi + hit-area tappabile; etichette nome comune (zoom ≥11); `ComuneBottomCard` in basso al posto del popup MapLibre; selezione colore + `flyTo`; fontane colore cyan distinto; i18n pannello route + `RouteTools`/`RouteElevationStats`; toggle layer a icone; sezione Avanzate (default chiusa) con cerca comuni e strumenti GPX |
| 2026-03-21 | **Mobile UX Overhaul**: BottomNav 4 tab (Home/Route/Salvate/Installa); hero gradient home; route cards con bordo difficolta e icone stats; Avvia route sempre visibile; contatto WhatsApp (wa.me/393204864478); footer Made with love by SalentoBike; scrollbar nascosti su mobile; saved page i18n; fix Part 2 |
| 2026-03-21 | **Popup mappa comuni**: scheda compatta (emoji + conteggi, link «Approfondisci») per evitare taglio sotto la mappa su mobile; `map.fontane_public` i18n per popup fontane |
| 2026-03-21 | **PWA install**: icone PNG reali 192/512 (prima 1×1 → Chrome non dava `beforeinstallprompt`); SW registrato subito (non a `load`); script `beforeInteractive` per catturare BIP; modal/banner install con guide Chrome / Firefox / Safari + i18n; manifest con icone `any`+`maskable`; `metadata.icons` per Apple |
| 2026-03-21 | i18n IT/EN (cookie `sb_locale`, switch header, `html lang`), sintesi comuni unificata (`summaryLabels` + popup mappa), testi home/nav; leggibilità mobile su QuickSummary e popup comuni |
| 2026-03-20 | Fix mappa tagliata in produzione: layout flex (h-dvh, min-h-0), resize MapLibre ritardato |
| 2026-03-20 | Label "Installa app" → "Install app" (HomeContent, AppHeader, InstallBanner, InstallModal) |
| 2026-03-20 | Setup Git: init, primo commit. Per push: creare repo su GitHub/GitLab, poi `git remote add origin <url>` e `git push -u origin master` |
| 2026-03-20 | Integrazione comuni Puglia: script build-comuni (regione Puglia), ComuniLayer, geocoding Nominatim |
| 2026-03-20 | App tutta in italiano; label "Installa app" |
| 2026-03-20 | UI mobile: titoli/stats più grandi, grid 2 col su telefono, pill comuni touch-friendly |
| 2026-03-20 | ~~Password sito~~ (rimossa 2026-03-21: sito pubblico senza login) |
| 2026-03-20 | Performance comuni: `comuni-puglia-lite.json` (~25KB) + layer MapLibre GeoJSON (cerchi GPU) al posto di 271 marker DOM |

---

## Accesso sito (aggiornato 2026-03-21)

- **Sito pubblico**: nessuna password; `/accesso` reindirizza a `/` (`next.config.ts`).
- **Admin** (`/admin`): solo login admin (cookie `admin_auth`, password in `middleware.ts`).

---

## Fix mappa tagliata (2026-03-20) + evoluzioni layout route

**Problema originale**: Mappa tagliata su mobile e desktop in produzione; OK in locale.

**Fix strutturali (ancora validi)**:
- `layout.tsx`: body `h-full min-h-full`
- `MobileShell.tsx`: `h-dvh min-h-dvh`, main `min-h-0`
- `RouteDetailView.tsx`: contenitore mappa `flex-1 min-h-0` + altezza minima generosa (es. `min-h-[min(50vh,100%)]`) e `overflow-hidden` — **non** più il vecchio solo `min-h-[200px]`
- `RouteMap.tsx`: `ResizeObserver` + resize MapLibre ritardato dopo load per layout shift
- `RouteDetailClient.tsx`: pannello inferiore con altezza massima controllata così la mappa resta la parte dominante dello schermo

---

*Ultimo aggiornamento: 2026-03-24 (Web Vitals, mobile-first, rollback, LOD mappa)*
