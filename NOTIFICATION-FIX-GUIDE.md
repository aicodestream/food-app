# Notification Delivery Fix Guide

## Problem Analysis

Based on testing and logs, the notification delivery issues are:

1. **Intermittent API calls**: Some orders call the API successfully (ORD91901744) while others don't call it at all (ORD92371901)
2. **Frontend error handling**: Limited retry logic and error reporting
3. **Lambda logging**: Insufficient logging to debug issues
4. **Timeout issues**: No proper timeout handling in frontend

## Solution Overview

### 1. Enhanced Backend (Robust Lambda)
- **Comprehensive logging**: Every request step is logged with request ID
- **Better error handling**: Validates all inputs and provides detailed error messages  
- **Timeout protection**: 25-second timeout for Twilio requests
- **Partial success handling**: Returns success even if only one notification succeeds
- **CloudWatch integration**: Structured logging for easy debugging

### 2. Improved Frontend
- **Retry logic**: 3 attempts with exponential backoff (2s, 4s delays)
- **Timeout handling**: 15-second timeout per request
- **Enhanced logging**: Console logs for every step of the checkout process
- **Order persistence**: Always saves order first, then attempts notification
- **Better UX**: Shows notification status in confirmation modal

## Deployment Steps

### Step 1: Deploy Robust Backend

```bash
cd food-app
chmod +x aws/deploy-robust-backend.sh
./aws/deploy-robust-backend.sh
```

This will:
- Deploy the enhanced Lambda function with comprehensive logging
- Create new API Gateway with access logging
- Set up CloudWatch log groups with 14-day retention

### Step 2: Update API Gateway Domain Mapping

After deployment, update the custom domain to point to the new API:

```bash
# Get the new API Gateway ID
NEW_API_ID=$(aws cloudformation describe-stacks \
    --stack-name food-ordering-robust-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text \
    --profile app \
    --region us-east-1 | cut -d'/' -f3 | cut -d'.' -f1)

echo "New API ID: $NEW_API_ID"

# Update the domain mapping
aws apigatewayv2 update-domain-name \
    --domain-name api.aicodestreams.com \
    --domain-name-configurations ApiId=$NEW_API_ID,Stage='$default' \
    --profile app \
    --region us-east-1
```

### Step 3: Test the New Backend

```bash
# Run comprehensive tests
node test-api-comprehensive.js

# Or test manually
curl -X POST https://api.aicodestreams.com/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderDetails": {
      "orderId": "TEST123",
      "customerName": "Test User",
      "items": "1x Test Item - ₹100",
      "total": 100,
      "address": "Test Address"
    },
    "customerPhone": "+919766007557"
  }'
```

### Step 4: Deploy Updated Frontend

The frontend changes are already in place. Deploy to Amplify:

```bash
# Commit and push changes
git add .
git commit -m "Fix notification delivery with enhanced error handling and retry logic"
git push origin main
```

Amplify will automatically deploy the updated frontend.

## Monitoring and Debugging

### View Lambda Logs
```bash
# Real-time logs
aws logs tail /aws/lambda/food-ordering-notifications-robust --follow --profile app --region us-east-1

# Specific time range
aws logs filter-log-events \
    --log-group-name /aws/lambda/food-ordering-notifications-robust \
    --start-time $(date -d '1 hour ago' +%s)000 \
    --profile app \
    --region us-east-1
```

### View API Gateway Logs
```bash
aws logs tail /aws/apigateway/food-ordering-api-robust --follow --profile app --region us-east-1
```

### Frontend Debug Console
Open browser developer tools and check the Console tab during checkout. You'll see:
- `🛒 CHECKOUT STARTED`
- `📋 Order Data: {...}`
- `📡 API Payload: {...}`
- `📞 Notification attempt 1/3`
- `📊 Response status: 200`
- `✅ Notification sent successfully!`

## Expected Improvements

### Before Fix
- ❌ Some orders don't call API at all
- ❌ No retry on failure
- ❌ Limited error information
- ❌ No timeout handling
- ❌ Minimal logging

### After Fix
- ✅ All orders attempt API call (saved first, then notification)
- ✅ 3 retry attempts with backoff
- ✅ Detailed error reporting in console and UI
- ✅ 15-second timeout per attempt
- ✅ Comprehensive logging with request IDs
- ✅ Partial success handling (restaurant OR customer notification)
- ✅ Better user feedback

## Rollback Plan

If issues occur, rollback by updating the domain mapping to the original API:

```bash
# Rollback to original API
aws apigatewayv2 update-domain-name \
    --domain-name api.aicodestreams.com \
    --domain-name-configurations ApiId=ewbzhkjb20,Stage='$default' \
    --profile app \
    --region us-east-1
```

## Success Metrics

Monitor these metrics to verify the fix:

1. **API Call Rate**: 100% of orders should attempt API call
2. **Success Rate**: >90% of notifications should succeed
3. **Response Time**: <5 seconds average
4. **Error Rate**: <10% of requests should fail
5. **User Experience**: Clear status messages in confirmation modal

## Troubleshooting

### Common Issues

1. **DNS Propagation**: Wait 5-30 minutes after domain mapping update
2. **Environment Variables**: Verify Twilio credentials in Lambda
3. **Phone Format**: Check +91 prefix handling in logs
4. **CORS**: Verify Access-Control headers in response

### Debug Commands

```bash
# Check domain mapping
aws apigatewayv2 get-domain-name --domain-name api.aicodestreams.com --profile app --region us-east-1

# Test DNS resolution
nslookup api.aicodestreams.com

# Check Lambda function
aws lambda get-function --function-name food-ordering-notifications-robust --profile app --region us-east-1
```