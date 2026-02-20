# Test Visitor Analytics API
$ErrorActionPreference = "Stop"

$API_BASE = "https://api.aicodestreams.com"
$TODAY = Get-Date -Format "yyyy-MM-dd"
$YESTERDAY = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")

Write-Host "🧪 Testing Visitor Analytics API..." -ForegroundColor Cyan
Write-Host "API Base: $API_BASE" -ForegroundColor White
Write-Host "Date Range: $YESTERDAY to $TODAY`n" -ForegroundColor White

# Test GET request for visitor stats
Write-Host "📊 Testing GET /visitor-tracking..." -ForegroundColor Yellow
$url = "$API_BASE/visitor-tracking?startDate=$YESTERDAY" + '&' + "endDate=$TODAY"
Write-Host "URL: $url`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
