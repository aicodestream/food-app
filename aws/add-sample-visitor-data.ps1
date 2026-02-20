# Add Sample Visitor Data for Testing
$ErrorActionPreference = "Stop"

Write-Host "Adding sample visitor data..." -ForegroundColor Cyan

# Generate sample data for the last 7 days
$today = Get-Date
$totalItems = 0

for ($i = 0; $i -lt 7; $i++) {
    $date = $today.AddDays(-$i)
    $dateStr = $date.ToString("yyyy-MM-dd")
    
    # Add 5-10 visitors per day
    $visitorCount = Get-Random -Minimum 5 -Maximum 11
    
    Write-Host "Adding data for $dateStr - $visitorCount visitors" -ForegroundColor Gray
    
    for ($v = 1; $v -le $visitorCount; $v++) {
        $visitorId = "visitor_" + $date.ToString("yyyyMMdd") + "_" + $v
        
        # Each visitor views 2-5 pages
        $pageViews = Get-Random -Minimum 2 -Maximum 6
        
        for ($p = 1; $p -le $pageViews; $p++) {
            $timestamp = $date.AddHours((Get-Random -Minimum 8 -Maximum 20)).AddMinutes((Get-Random -Minimum 0 -Maximum 60))
            
            $json = @"
{
    "visitorId": {"S": "$visitorId"},
    "timestamp": {"S": "$($timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))"},
    "date": {"S": "$dateStr"},
    "pageUrl": {"S": "/"},
    "userAgent": {"S": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
}
"@
            
            aws dynamodb put-item `
                --table-name food-ordering-visitors `
                --item $json `
                --region us-east-1 `
                --profile app | Out-Null
            
            $totalItems++
        }
    }
}

Write-Host "`nSuccessfully added $totalItems visitor records!" -ForegroundColor Green
Write-Host "Now refresh the admin panel to see the data" -ForegroundColor Cyan
