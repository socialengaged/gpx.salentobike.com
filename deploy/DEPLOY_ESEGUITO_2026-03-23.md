# Deploy Salento GPX – 2026-03-23 (UTC)

## Esecuzione

- **Script**: `deploy/deploy.ps1 -ServerIP "57.131.16.162"`
- **Esito**: OK (exit 0)
- **Build locale + remoto**: OK
- **salentogpx.service**: `active (running)` dopo restart
- **Nginx**: `nginx -t` OK, config **HTTPS** applicata (`sudo test -d` LetsEncrypt)

## Warning Nginx (preesistenti, altri vhost)

Durante `reload` compaiono avvisi `protocol options redefined for 0.0.0.0:443` su altri siti (`eubot.seo.srl`, `images.seo.srl`, `nemira.ai`, ecc.). **Non** provengono da `gpx-salentobike`; non modificare altri file senza bisogno.

## Smoke test produzione (HTTPS)

| URL | HTTP | Note |
|-----|------|------|
| https://gpx.salentobike.com/ | **200** | `<title>Salento Bike Routes</title>`, contenuto “Salento Bike” |
| https://gpx.salentobike.com/routes | **200** | Lista route |

Test eseguiti da Windows con `curl.exe` (non alias PowerShell).

## Deploy successivo (stesso giorno) – scheda comune + marker

- **Ora UTC indicativa**: ~18:40
- **Modifiche**: `ComuneBottomCard` più grande, righe con etichetta + conteggio; `ComuniLayer` cerchi/etichette più leggibili
- **Smoke**: `GET /routes` → **200**

## Riferimento

- Procedura e cautele: `deploy/SINTESI_DEPLOY_E_PROBLEMI.md`
