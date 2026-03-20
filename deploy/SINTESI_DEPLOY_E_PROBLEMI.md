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

3. **Chiave SSH**: `C:\Users\info\Desktop\ssh ORACLE\ssh-key-2026-01-02.key`

4. **Verifica post-deploy**:
   - https://gpx.salentobike.com (deve mostrare "Salento Bike Routes")
   - Se vedi un altro sito → vedi sezione Problemi

---

## Problemi già riscontrati e fix

### 1. HTTPS mostra un altro sito (Ads Control Center o simile)

**Causa**: La config Nginx per gpx.salentobike.com era HTTP-only (porta 80). Le richieste HTTPS (porta 443) venivano gestite dal *default server* di Nginx, che puntava a un’altra app sullo stesso server.

**Fix**:
```bash
# SSH sul server
ssh -i "C:\Users\info\Desktop\ssh ORACLE\ssh-key-2026-01-02.key" ubuntu@57.131.16.162

# Applica config HTTPS (il cert esiste in /etc/letsencrypt/live/gpx.salentobike.com)
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

## File di deploy

| File | Scopo |
|------|-------|
| `deploy.ps1` | Script principale di deploy |
| `gpx.salentobike.com.nginx.conf` | Config Nginx con HTTPS |
| `gpx.salentobike.com.nginx-http-only.conf` | Config Nginx solo HTTP (fallback) |
| `salentogpx.service` | Servizio systemd |
| `DEPLOY_ESEGUITO_*.md` | Storico deploy |
| `SINTESI_DEPLOY_E_PROBLEMI.md` | Questo file |

---

## Certificato SSL

- **Path**: /etc/letsencrypt/live/gpx.salentobike.com/
- **Scadenza**: verificare con `sudo certbot certificates`
- **Rinnovo**: certbot in genere rinnova in automatico

---

*Ultimo aggiornamento: 2026-03-20*
