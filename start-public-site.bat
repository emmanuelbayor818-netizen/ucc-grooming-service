@echo off
title UCC Grooming Services - Live Production & Public Tunnel
echo ========================================================
echo    UCC GROOMING SERVICES - PRODUCTION & PUBLIC LAUNCH
echo ========================================================
echo [1/2] Launching Next.js Production Server on port 3000...
start /b cmd /c "npm run start"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Cloudflare Public HTTPS Tunnel...
echo Anyone on campus, student halls, or mobile phones can visit:
.\cloudflared.exe tunnel --url http://localhost:3000
