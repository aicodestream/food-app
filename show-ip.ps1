# Quick script to show your local IP for mobile testing

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Your Local Network URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all IPv4 addresses except loopback and APIPA
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" 
}

if ($ips.Count -eq 0) {
    Write-Host "❌ No network connection found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're connected to WiFi" -ForegroundColor Yellow
} else {
    Write-Host "Open these URLs on your mobile (same WiFi):" -ForegroundColor Green
    Write-Host ""
    
    foreach ($ip in $ips) {
        $url = "http://$($ip.IPAddress):3001"
        Write-Host "  📱 $url" -ForegroundColor White
        Write-Host "     Interface: $($ip.InterfaceAlias)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "Instructions:" -ForegroundColor Yellow
    Write-Host "  1. Make sure your mobile is on the same WiFi" -ForegroundColor White
    Write-Host "  2. Make sure the server is running (node local-server.js)" -ForegroundColor White
    Write-Host "  3. Open one of the URLs above on your mobile browser" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
