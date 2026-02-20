# Test Orders API
Write-Host "Testing Orders API..." -ForegroundColor Cyan

# Test 1: Get all orders
Write-Host "`n1. Testing GET /orders (all orders)..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "https://api.aicodestreams.com/orders" -Method GET -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"

# Test 2: Get orders by customer phone (example)
Write-Host "`n2. Testing GET /orders/customer/{phone}..." -ForegroundColor Yellow
$testPhone = "7028104413"
try {
    $response = Invoke-WebRequest -Uri "https://api.aicodestreams.com/orders/customer/$testPhone" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 3: Check if there are any orders in the database
Write-Host "`n3. Checking DynamoDB for orders..." -ForegroundColor Yellow
aws dynamodb scan --table-name food-ordering-orders --profile app --region us-east-1 --max-items 5
