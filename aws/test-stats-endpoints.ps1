# Test stats API endpoints
Write-Host "🧪 Testing Stats API Endpoints" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "https://api.aicodestreams.com"

# Test 1: GET /stats/range
Write-Host "1️⃣ Testing GET /stats/range..." -ForegroundColor Yellow
$startDate = "2026-02-01"
$endDate = "2026-02-28"
$url = "$baseUrl/stats/range?startDate=$startDate&endDate=$endDate"

Write-Host "   URL: $url" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n"

# Test 2: GET /stats/customers
Write-Host "2️⃣ Testing GET /stats/customers..." -ForegroundColor Yellow
$url = "$baseUrl/stats/customers"

Write-Host "   URL: $url" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ Testing complete!" -ForegroundColor Green
