# Test Admin Login API
Write-Host "🧪 Testing Admin Login API..." -ForegroundColor Cyan

$apiUrl = "https://api.aicodestreams.com/admin-login"
$password = "Admin@2024"

Write-Host "`n1. Testing with correct password..." -ForegroundColor Yellow
$body = @{
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token)" -ForegroundColor Cyan
    Write-Host "Expires: $($response.expiresAt)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing with wrong password..." -ForegroundColor Yellow
$wrongBody = @{
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $wrongBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected wrong password" -ForegroundColor Green
}

Write-Host "`n📋 Admin Login Details:" -ForegroundColor Cyan
Write-Host "URL: https://app.aicodestreams.com/admin-login.html" -ForegroundColor White
Write-Host "Password: Admin@2024" -ForegroundColor White

