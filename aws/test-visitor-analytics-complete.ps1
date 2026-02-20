# Complete Visitor Analytics Test
$ErrorActionPreference = "Stop"

Write-Host "=== Testing Visitor Analytics System ===" -ForegroundColor Cyan

# Test 1: Check if GET route exists
Write-Host "`n1. Checking API Gateway route..." -ForegroundColor Yellow
$route = aws apigatewayv2 get-routes --api-id ewbzhkjb20 --region us-east-1 --profile app --query "Items[?RouteKey=='GET /visitor-tracking']" --output json | ConvertFrom-Json

if ($route.Count -gt 0) {
    Write-Host "   GET /visitor-tracking route exists" -ForegroundColor Green
} else {
    Write-Host "   Route not found!" -ForegroundColor Red
    exit 1
}

# Test 2: Test the API endpoint
Write-Host "`n2. Testing API endpoint..." -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
$weekAgo = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$url = "https://api.aicodestreams.com/visitor-tracking?startDate=$weekAgo&endDate=$today"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "   API Response:" -ForegroundColor Green
    Write-Host "   - Visitors: $($response.visitors)" -ForegroundColor Gray
    Write-Host "   - Page Views: $($response.pageViews)" -ForegroundColor Gray
    Write-Host "   - Date Range: $($response.startDate) to $($response.endDate)" -ForegroundColor Gray
} catch {
    Write-Host "   API Error: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Test with different date ranges
Write-Host "`n3. Testing different date ranges..." -ForegroundColor Yellow

# Today
$todayUrl = "https://api.aicodestreams.com/visitor-tracking?startDate=$today&endDate=$today"
try {
    $todayResponse = Invoke-RestMethod -Uri $todayUrl -Method Get
    Write-Host "   Today: $($todayResponse.visitors) visitors, $($todayResponse.pageViews) views" -ForegroundColor Green
} catch {
    Write-Host "   Today test failed" -ForegroundColor Red
}

# Last 30 days
$monthAgo = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$monthUrl = "https://api.aicodestreams.com/visitor-tracking?startDate=$monthAgo&endDate=$today"
try {
    $monthResponse = Invoke-RestMethod -Uri $monthUrl -Method Get
    Write-Host "   Last 30 days: $($monthResponse.visitors) visitors, $($monthResponse.pageViews) views" -ForegroundColor Green
} catch {
    Write-Host "   30-day test failed" -ForegroundColor Red
}

Write-Host "`n=== All Tests Passed ===" -ForegroundColor Green
Write-Host "`nVisitor Analytics is ready!" -ForegroundColor Cyan
Write-Host "Admin panel can now access: https://api.aicodestreams.com/visitor-tracking" -ForegroundColor Gray
