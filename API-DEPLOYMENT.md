# API Backend Deployment Summary

## API Gateway Configuration

### Custom Domain
- **Domain**: https://api.aicodestreams.com
- **API Gateway ID**: ewbzhkjb20
- **Default URL**: https://ewbzhkjb20.execute-api.us-east-1.amazonaws.com
- **Region**: us-east-1

### SSL Certificate
- **Certificate ARN**: arn:aws:acm:us-east-1:647739191071:certificate/33ed251a-25da-4ba8-b8d5-f3096912e4fe
- **Status**: ✅ ISSUED
- **Domain**: api.aicodestreams.com

### DNS Configuration
The following DNS records have been created:

1. **API Domain**:
   - Name: `api.aicodestreams.com`
   - Type: CNAME
   - Value: `d-238suvvm2l.execute-api.us-east-1.amazonaws.com`
   - TTL: 300

2. **Certificate Validation**:
   - Name: `_950209a5d7c7bfd43d96d683a185ec09.api.aicodestreams.com`
   - Type: CNAME
   - Value: `_79bc0d857c24a3dc661e13fb9a6baa56.jkddzztszm.acm-validations.aws.`

## API Endpoints

### Send Notification
- **URL**: `https://api.aicodestreams.com/send-notification`
- **Method**: POST
- **Content-Type**: application/json

**Request Body**:
```json
{
  "orderDetails": {
    "orderId": "ORD123",
    "customerName": "John Doe",
    "items": "2x Chicken Thali, 1x Mutton Thali",
    "total": 1200,
    "address": "123 Main St, Miraj"
  },
  "customerPhone": "+919876543210"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Notifications sent"
}
```

## Lambda Function

### Function Details
- **Name**: food-ordering-notifications
- **Runtime**: Node.js 18.x
- **Timeout**: 30 seconds
- **Memory**: 256 MB

### Environment Variables
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_NUMBER
- TWILIO_SMS_NUMBER
- RESTAURANT_WHATSAPP_NUMBER
- RESTAURANT_SMS_NUMBER

## Testing the API

### Using curl (bash/Linux):
```bash
curl -X POST https://api.aicodestreams.com/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderDetails": {
      "orderId": "TEST123",
      "customerName": "Test User",
      "items": "1x Test Item",
      "total": 100,
      "address": "Test Address"
    },
    "customerPhone": "+919766007557"
  }'
```

### Using PowerShell:
```powershell
$body = @{
    orderDetails = @{
        orderId = "TEST123"
        customerName = "Test User"
        items = "1x Test Item"
        total = 100
        address = "Test Address"
    }
    customerPhone = "+919766007557"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.aicodestreams.com/send-notification" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## Frontend Integration

Update your frontend JavaScript to use the new API URL:

```javascript
// In js/script.js - Update the API endpoint
const API_URL = 'https://api.aicodestreams.com';

async function sendNotification(orderDetails, customerPhone) {
    try {
        const response = await fetch(`${API_URL}/send-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderDetails,
                customerPhone
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}
```

## Monitoring

### View Lambda Logs
```bash
aws logs tail /aws/lambda/food-ordering-notifications --follow --profile app --region us-east-1
```

### Check API Gateway Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiId,Value=ewbzhkjb20 \
  --start-time 2026-02-20T00:00:00Z \
  --end-time 2026-02-20T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --profile app \
  --region us-east-1
```

## Status

- ✅ Lambda function deployed
- ✅ API Gateway created
- ✅ SSL certificate issued
- ✅ Custom domain configured
- ✅ DNS records created
- ⏳ DNS propagation in progress (5-30 minutes)

## Next Steps

1. Wait for DNS propagation (typically 5-30 minutes)
2. Test the API endpoint
3. Update frontend to use https://api.aicodestreams.com
4. Deploy updated frontend to Amplify

## Troubleshooting

### Check DNS Propagation
```bash
nslookup api.aicodestreams.com
```

### Test with Default URL (works immediately)
```bash
curl https://ewbzhkjb20.execute-api.us-east-1.amazonaws.com/send-notification
```

### View Lambda Function
```bash
aws lambda get-function --function-name food-ordering-notifications --profile app --region us-east-1
```
