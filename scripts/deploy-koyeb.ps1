# Deploy MediNova API to Koyeb (requires KOYEB_API_TOKEN)
# Get token: https://app.koyeb.com/settings/api
#
# Usage (PowerShell):
#   $env:KOYEB_API_TOKEN = "your-token"
#   .\scripts\deploy-koyeb.ps1

$ErrorActionPreference = "Stop"

if (-not $env:KOYEB_API_TOKEN) {
  Write-Error "Set KOYEB_API_TOKEN first. Create one at https://app.koyeb.com/settings/api"
}

$koyeb = if (Get-Command koyeb -ErrorAction SilentlyContinue) { "koyeb" }
         elseif (Test-Path "$env:TEMP\koyeb-cli\koyeb.exe") { "$env:TEMP\koyeb-cli\koyeb.exe" }
         else { throw "Install Koyeb CLI from https://github.com/koyeb/koyeb-cli/releases" }

$jwt = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "medinova-prod-" + [guid]::NewGuid().ToString("N") }
$mongo = if ($env:MONGODB_URI) { $env:MONGODB_URI } else {
  throw "Set MONGODB_URI before running (Atlas connection string)."
}
$client = if ($env:CLIENT_URL) { $env:CLIENT_URL } else { "http://localhost:3000" }

Write-Host "Deploying medinova-api to Koyeb..."

& $koyeb app init medinova-api `
  --token $env:KOYEB_API_TOKEN `
  --git "github.com/SharanjaaSenthuran123/MediNova-AI" `
  --git-branch main `
  --git-builder docker `
  --git-workdir server `
  --git-docker-dockerfile Dockerfile `
  --ports "4000:http" `
  --routes "/:4000" `
  --env "NODE_ENV=production" `
  --env "PORT=4000" `
  --env "MONGODB_URI=$mongo" `
  --env "JWT_SECRET=$jwt" `
  --env "CLIENT_URL=$client"

Write-Host ""
Write-Host "Done. Open https://app.koyeb.com and copy your *.koyeb.app URL."
Write-Host "Verify: https://YOUR-APP.koyeb.app/health"
