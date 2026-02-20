# Test Visitor Tracking API
$ErrorActionPreference = "Stop"

Write-Host "Testing Visitor Tracking API..." -ForegroundColor Cyan

# Get today's date
$today = Get-Date -Format "yyyy-MM-dd"
$yesterday = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")

Write-Host "Testing GET /visitor-tracking with date range: $yesterday to $today" -ForegroundColor Yellow

$url = "https://api.aicodestreams.com/visitor-tracking?startDate=$yesterday&endDate=$today"

Write-Host "URL: $url" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
