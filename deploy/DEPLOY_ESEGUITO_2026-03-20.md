# Deploy Salento GPX - 2026-03-20

## Riepilogo

- **Dominio**: https://gpx.salentobike.com
- **Server**: 57.131.16.162 (OVH)
- **Path**: /home/ubuntu/apps/salentogpx
- **Porta**: 3010
- **Servizio**: salentogpx.service

## Stato

- [x] Cartella creata sul server
- [x] Deploy eseguito (deploy safe, nessun altro progetto toccato)
- [x] Servizio systemd attivo
- [x] Nginx configurato
- [x] HTTPS con Let's Encrypt attivo

## Ultimo deploy 2026-03-20 (15:15 UTC)

Modifiche deployate: admin protetto (password social123), persistenza route, dashboard statistiche, pulsante Installa App compatibile Safari/Chrome/Firefox, pagina /install rimossa.

## Fix 2026-03-20 (15:19 UTC) - HTTPS mostrava altro sito

**Problema**: https://gpx.salentobike.com mostrava "Ads Control Center" invece di Salento Bike.

**Causa**: Deploy aveva applicato config HTTP-only; richieste HTTPS andavano al default server Nginx (altra app).

**Fix applicato**: Config HTTPS applicata manualmente sul server (cert esisteva già). Script deploy aggiornato per usare `sudo test -d` nel check del cert.

**Riferimento**: `deploy/SINTESI_DEPLOY_E_PROBLEMI.md`

## Deploy 2026-03-20 (19:36 UTC)

Mappa a dimensione intera (flex-1 min-h-0), ResizeObserver, formattazione dislivello, fix bash nello script Nginx.

## Comandi utili

```bash
# Restart servizio
sudo systemctl restart salentogpx.service

# Log
journalctl -u salentogpx.service -f -n 50

# Test locale
curl -s http://127.0.0.1:3010/
```

## Deploy successivi

Da PowerShell:
```powershell
cd C:\Users\info\Desktop\salentogpx\deploy
.\deploy.ps1 -ServerIP "57.131.16.162"
```

## Note

- Certificato SSL scade 2026-06-18 (rinnovo automatico via certbot)
- Chiave SSH: `%USERPROFILE%\.ssh\ssh-key-2026-01-02.key` (OVH, spostata in `.ssh`)
