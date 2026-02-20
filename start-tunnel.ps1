# Mobile Testing Tunnel Starter (PowerShell)
# This script helps you quickly start a tunnel for mobile testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mobile Testing Tunnel Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if server is running on port 3001..." -ForegroundColor Yellow
$serverRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $serverRunning) {
    Write-Host "❌ Server is not running on port 3001" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "  cd aws" -ForegroundColor White
    Write-Host "  node local-server.js" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Server is running!" -ForegroundColor Green
Write-Host ""

# Menu for tunnel selection
Write-Host "Select a tunneling service:" -ForegroundColor Cyan
Write-Host "1. ngrok (Recommended - requires signup)" -ForegroundColor White
Write-Host "2. localtunnel (Free, no signup)" -ForegroundColor White
Write-Host "3. cloudflared (Cloudflare Tunnel)" -ForegroundColor White
Write-Host "4. Show local network IP" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting ngrok..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if ngrok is installed
        if (Get-Command ngrok -ErrorAction SilentlyContinue) {
            Write-Host "Opening ngrok tunnel on port 3001..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
            Write-Host ""
            ngrok http 3001
        } else {
            Write-Host "❌ ngrok is not installed" -ForegroundColor Red
            Write-Host ""
            Write-Host "Install ngrok:" -ForegroundColor Yellow
            Write-Host "  1. Download from: https://ngrok.com/download" -ForegroundColor White
            Write-Host "  2. Or install via npm: npm install -g ngrok" -ForegroundColor White
            Write-Host "  3. Or via Chocolatey: choco install ngrok" -ForegroundColor White
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Starting localtunnel..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if localtunnel is installed
        if (Get-Command lt -ErrorAction SilentlyContinue) {
            Write-Host "Opening localtunnel on port 3001..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
            Write-Host ""
            lt --port 3001
        } else {
            Write-Host "❌ localtunnel is not installed" -ForegroundColor Red
            Write-Host ""
            Write-Host "Install localtunnel:" -ForegroundColor Yellow
            Write-Host "  npm install -g localtunnel" -ForegroundColor White
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if cloudflared is installed
        if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
            Write-Host "Opening Cloudflare tunnel on port 3001..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
            Write-Host ""
            cloudflared tunnel --url http://localhost:3001
        } else {
            Write-Host "❌ cloudflared is not installed" -ForegroundColor Red
            Write-Host ""
            Write-Host "Install cloudflared:" -ForegroundColor Yellow
            Write-Host "  1. Download from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor White
            Write-Host "  2. Or via Chocolatey: choco install cloudflared" -ForegroundColor White
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Your Local Network IP Addresses:" -ForegroundColor Cyan
        Write-Host ""
        
        $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" }
        
        foreach ($ip in $ips) {
            Write-Host "  📱 http://$($ip.IPAddress):3001" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Yellow
        Write-Host "  1. Make sure your mobile is on the same WiFi network" -ForegroundColor White
        Write-Host "  2. Open one of the URLs above on your mobile browser" -ForegroundColor White
        Write-Host ""
    }
    
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
