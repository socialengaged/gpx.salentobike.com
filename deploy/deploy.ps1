# Deploy Salento GPX su OVH - gpx.salentobike.com
# Uso: .\deploy.ps1 -ServerIP "57.131.16.162"
# Deploy safe: crea cartella dedicata, non tocca altri progetti

param(
    [string]$ServerIP = "57.131.16.162"
)

$ErrorActionPreference = "Stop"
# Chiave OVH in ~/.ssh (stesso file, spostato da Desktop\ssh ORACLE)
$sshKey = Join-Path $env:USERPROFILE ".ssh\ssh-key-2026-01-02.key"
$projectRoot = Split-Path -Parent $PSScriptRoot
$remotePath = "/home/ubuntu/apps/salentogpx"

if (-not (Test-Path $sshKey)) {
    Write-Host "ERRORE: Chiave SSH non trovata: $sshKey" -ForegroundColor Red
    exit 1
}

Write-Host "Deploy Salento GPX su ubuntu@$ServerIP" -ForegroundColor Cyan
Write-Host "Progetto: $projectRoot" -ForegroundColor Gray
Write-Host "Destinazione: $remotePath" -ForegroundColor Gray

# 1. Build locale
Write-Host "`n1. Build locale..." -ForegroundColor Green
Push-Location $projectRoot
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# 2. Crea directory sul server
Write-Host "`n2. Creazione directory sul server..." -ForegroundColor Green
ssh -i $sshKey -o StrictHostKeyChecking=no ubuntu@$ServerIP "sudo mkdir -p $remotePath && sudo chown ubuntu:ubuntu $remotePath"

# 3. Copia file (escludi node_modules, .git, .next - ricostruiamo sul server)
Write-Host "`n3. Copia file sul server..." -ForegroundColor Green
$exclude = @('.git', 'node_modules', '.next')
Push-Location $projectRoot
Get-ChildItem -Force | Where-Object { $_.Name -notin $exclude } | ForEach-Object {
    $name = $_.Name
    Write-Host "  Copia $name..." -ForegroundColor Gray
    scp -i $sshKey -r "$($_.FullName)" "ubuntu@${ServerIP}:${remotePath}/"
}
Pop-Location

# 4. Setup sul server (npm install, build gia fatto - copiamo .next)
Write-Host "`n4. Setup sul server (npm install)..." -ForegroundColor Green
$setupScript = @"
cd $remotePath
npm install --production=false
npm run build
echo 'Build completato'
"@ -replace "`r`n", "`n" -replace "`r", "`n"
ssh -i $sshKey ubuntu@$ServerIP $setupScript

# 5. Installa servizio systemd
Write-Host "`n5. Installazione servizio systemd..." -ForegroundColor Green
$svcScript = @"
sudo cp $remotePath/deploy/salentogpx.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable salentogpx.service
sudo systemctl restart salentogpx.service
sleep 2
sudo systemctl status salentogpx.service --no-pager
"@ -replace "`r`n", "`n" -replace "`r", "`n"
ssh -i $sshKey ubuntu@$ServerIP $svcScript

# 6. Nginx - usa config HTTPS se cert esiste, altrimenti HTTP-only
# NOTA: usa sudo per il check - la dir letsencrypt e' root-only
Write-Host "`n6. Configurazione Nginx..." -ForegroundColor Green
$nginxScript = @"
# Backup config esistente
sudo cp /etc/nginx/sites-available/gpx-salentobike /etc/nginx/sites-available/gpx-salentobike.bak 2>/dev/null || true
# Usa HTTPS se cert LetsEncrypt esiste (sudo per leggere dir root-only)
if sudo test -d /etc/letsencrypt/live/gpx.salentobike.com; then
  sudo cp $remotePath/deploy/gpx.salentobike.com.nginx.conf /etc/nginx/sites-available/gpx-salentobike
  echo "Nginx: config HTTPS applicata"
else
  sudo cp $remotePath/deploy/gpx.salentobike.com.nginx-http-only.conf /etc/nginx/sites-available/gpx-salentobike
  echo 'Nginx: config HTTP-only - cert non trovato'
fi
sudo ln -sf /etc/nginx/sites-available/gpx-salentobike /etc/nginx/sites-enabled/ 2>/dev/null || true
sudo nginx -t && sudo systemctl reload nginx
"@ -replace "`r`n", "`n" -replace "`r", "`n"
ssh -i $sshKey ubuntu@$ServerIP $nginxScript

Write-Host "`n=== DEPLOY COMPLETATO ===" -ForegroundColor Green
Write-Host "Verifica: https://gpx.salentobike.com" -ForegroundColor Cyan
Write-Host "`nTest locale sul server: curl -s http://127.0.0.1:3010 | head -5" -ForegroundColor Gray
