# Test usabilità mobile e performance (Salento Bike / gpx)

Checklist per verificare che l’app carichi in modo accettabile, sia leggibile e usabile su mobile, e per tracciare regressioni.

**URL produzione:** https://gpx.salentobike.com

---

## 1. Lighthouse (lab) – ultima esecuzione automatizzata

Eseguito con `npx lighthouse@11.6.0` (preset **perf** = emulazione mobile), categorie Performance + Accessibility, Chrome headless.

| Pagina | Performance | Accessibility | LCP | CLS | TBT | FCP |
|--------|---------------|----------------|-----|-----|-----|-----|
| `/` (home) | 61 | 86 | ~3.4 s | 0.121 | ~820 ms | ~3.4 s |
| `/routes` | 58 | 88 | ~2.8 s | 0.193 | ~1200 ms | ~2.8 s |
| `/routes/lecce-loop` (mappa) | 47 | 87 | ~3.2 s | 0.121 | ~4480 ms | ~2.5 s |

**Note:**

- Su pagina con **MapLibre** (`/routes/[slug]`) è normale un **Performance** più basso e **TBT** più alto: molto JavaScript sul main thread.
- **CLS** > 0.1 va monitorato; miglioramenti possibili con contenuti a dimensione fissa o riduzione shift del layout.
- Ripetere i test dopo deploy importanti:  
  `npx lighthouse@11 https://gpx.salentobike.com/ --preset=perf --only-categories=performance,accessibility --chrome-flags="--headless"`

---

## 2. Rete (lab)

In Chrome DevTools → **Network** → throttling **Fast 3G** o **4G**:

- Home: la shell (header, hero, CTA) deve apparire rapidamente.
- Route con mappa: testo e pannello visibili; tiles mappa possono completare dopo.

---

## 3. Web Vitals in campo (opzionale)

Il componente [`WebVitalsReporter`](../src/components/layout/WebVitalsReporter.tsx) logga LCP / INP / CLS in **sviluppo**. In **produzione** attivare solo per debug:

1. Build con `NEXT_PUBLIC_WEB_VITALS_LOG=1` (vedi [`.env.example`](../.env.example)).
2. Deploy.
3. Su Chrome Android: **Remote debugging** → Console → cercare `[web-vitals]`.

---

## 4. Usabilità mobile (manuale – smartphone)

Completare su **iOS Safari** e/o **Chrome Android**, display in verticale.

| Area | Verifica |
|------|----------|
| **Home** | Hero leggibile; CTA Esplora route / Salvate / Installa tappabili; nessun testo tagliato dal notch (safe area). |
| **Lista `/routes`** | Scroll fluido; card leggibili; tap apre il dettaglio. |
| **Dettaglio route** | Mappa visibile; pannello non copre tutto lo schermo in modo ingestibile; toggle comuni/fontane; **tap traccia** vs **tap comune**. |
| **Scheda comune** | Testo leggibile; scheda compatta su desktop; scroll se molte righe. |
| **Nav** | Bottom nav / header chiari; switch IT/EN se usato. |
| **PWA** | Installa / Aggiungi a Home; apertura standalone; prova offline (route salvata) se applicabile. |

**Annotare:** dispositivo, OS, browser, data, esito, screenshot se problemi.

---

## 5. Stabilità

- Refresh su `/routes/[slug]` con mappa: niente schermata bianca persistente.
- Rotazione portrait/landscape: layout non rotto.
- **Avvia route** (se testato): permessi posizione; chip GPS leggibile.

---

## 6. Riferimenti

- Deploy e dominio: [`deploy/SINTESI_DEPLOY_E_PROBLEMI.md`](../deploy/SINTESI_DEPLOY_E_PROBLEMI.md)
