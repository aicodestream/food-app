# Add Test Visitor Data to DynamoDB
$ErrorActionPreference = "Stop"

Write-Host "Adding test visitor data..." -ForegroundColor Cyan

$TABLE_NAME = "food-ordering-visitors"
$REGION = "us-east-1"
$PROFILE = "app"

# Generate test data for the last 7 days
for ($i = 0; $i -le 7; $i++) {
    $date = (Get-Date).AddDays(-$i)
    $dateStr = $date.ToString("yyyy-MM-dd")
    $timestamp = $date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    # Add 3-10 visitors per day
    $visitorCount = Get-Random -Minimum 3 -Maximum 10
    
    for ($v = 1; $v -le $visitorCount; $v++) {
        $visitorId = "visitor_test_$dateStr_$v"
        
        # Each visitor views 1-5 pages
        $pageViews = Get-Random -Minimum 1 -Maximum 5
        
        for ($p = 1; $p -le $pageViews; $p++) {
            $pages = @("/", "/menu", "/cart", "/checkout", "/my-orders")
            $pageUrl = $pages | Get-Random
            
            $item = @{
                visitorId = @{ S = $visitorId }
                timestamp = @{ S = $timestamp }
                date = @{ S = $dateStr }
                pageUrl = @{ S = $pageUrl }
                userAgent = @{ S = "Mozilla/5.0 (Test Data)" }
            }
            
            $itemJson = $item | ConvertTo-Json -Compress -Depth 10
            
            aws dynamodb put-item `
                --table-name $TABLE_NAME `
                --item $itemJson `
                --region $REGION `
                --profile $PROFILE | Out-Null
        }
    }
    
    Write-Host "Added $visitorCount visitors for $dateStr" -ForegroundColor Green
}

Write-Host "`nTest data added successfully!" -ForegroundColor Green
Write-Host "Now test the API to see the data" -ForegroundColor Cyan
