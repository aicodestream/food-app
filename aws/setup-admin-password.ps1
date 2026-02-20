# Setup Admin Password in AWS Secrets Manager
Write-Host "🔐 Setting up Admin Password in AWS Secrets Manager..." -ForegroundColor Cyan

$secretName = "food-ordering-admin-password"
$region = "us-east-1"
$profile = "app"

# Prompt for admin password
Write-Host "`nEnter the admin password you want to set:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Create secret JSON
$secretJson = @{
    password = $plainPassword
} | ConvertTo-Json

Write-Host "`nCreating secret in AWS Secrets Manager..." -ForegroundColor Yellow

# Check if secret already exists
try {
    aws secretsmanager describe-secret --secret-id $secretName --profile $profile --region $region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Secret already exists. Updating..." -ForegroundColor Yellow
        aws secretsmanager update-secret `
            --secret-id $secretName `
            --secret-string $secretJson `
            --profile $profile `
            --region $region
    }
} catch {
    Write-Host "Creating new secret..." -ForegroundColor Yellow
    aws secretsmanager create-secret `
        --name $secretName `
        --description "Admin password for food ordering app" `
        --secret-string $secretJson `
        --profile $profile `
        --region $region
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Admin password stored successfully in Secrets Manager!" -ForegroundColor Green
    Write-Host "Secret Name: $secretName" -ForegroundColor Cyan
    Write-Host "`nYou can now use this password to login to the admin panel." -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to store admin password" -ForegroundColor Red
}
