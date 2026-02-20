# Add Sample Visitor Data via API
$ErrorActionPreference = "Stop"

Write-Host "Adding sample visitor data via API..." -ForegroundColor Cyan

$apiUrl = "https://api.aicodestreams.com/visitor-tracking"
$today = Get-Date
$totalAdded = 0

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
            $body = @{
                visitorId = $visitorId
                pageUrl = "/"
            } | ConvertTo-Json
            
            try {
                Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" | Out-Null
                $totalAdded++
            } catch {
                Write-Host "Error adding record: $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nSuccessfully added $totalAdded visitor records!" -ForegroundColor Green
Write-Host "Now refresh the admin panel to see the data" -ForegroundColor Cyan
