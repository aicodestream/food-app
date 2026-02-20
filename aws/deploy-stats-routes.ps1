# Deploy stats API routes
Write-Host "🚀 Deploying stats API routes..." -ForegroundColor Cyan

$stackName = "food-ordering-stats-routes"
$templateFile = "cloudformation/stats-routes.yaml"

# Deploy CloudFormation stack
Write-Host "📦 Creating/updating CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file $templateFile `
    --stack-name $stackName `
    --capabilities CAPABILITY_IAM `
    --profile app `
    --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Stats routes deployed successfully!" -ForegroundColor Green
    
    # Verify routes
    Write-Host "`n📋 Verifying routes..." -ForegroundColor Yellow
    aws apigatewayv2 get-routes `
        --api-id ewbzhkjb20 `
        --profile app `
        --region us-east-1 `
        --query "Items[?contains(RouteKey, 'stats')].{RouteKey:RouteKey}" `
        --output table
    
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "Test the endpoints:" -ForegroundColor Cyan
    Write-Host "  GET https://api.aicodestreams.com/stats/range?startDate=2026-02-01&endDate=2026-02-28" -ForegroundColor White
    Write-Host "  GET https://api.aicodestreams.com/stats/customers" -ForegroundColor White
}
else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
