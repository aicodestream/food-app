#!/usr/bin/env node

// Comprehensive API Test Script
const https = require('https');

const API_URL = 'https://api.aicodestreams.com/send-notification';

// Test data
const testCases = [
    {
        name: 'Valid Order Test',
        data: {
            orderDetails: {
                orderId: 'TEST001',
                customerName: 'Test Customer',
                items: '2x Chicken Thali - ₹400, 1x Mutton Thali - ₹450',
                total: 850,
                address: 'Test Address, Miraj, Maharashtra'
            },
            customerPhone: '+919766007557'
        }
    },
    {
        name: 'Phone Without +91 Test',
        data: {
            orderDetails: {
                orderId: 'TEST002',
                customerName: 'Test Customer 2',
                items: '1x Jira Rice - ₹200',
                total: 200,
                address: 'Another Test Address'
            },
            customerPhone: '9766007557'
        }
    },
    {
        name: 'Missing Field Test (should fail)',
        data: {
            orderDetails: {
                orderId: 'TEST003',
                customerName: 'Test Customer 3',
                // Missing items field
                total: 300,
                address: 'Test Address'
            },
            customerPhone: '+919766007557'
        }
    }
];

async function runTest(testCase) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    console.log('📋 Data:', JSON.stringify(testCase.data, null, 2));
    
    return new Promise((resolve) => {
        const postData = JSON.stringify(testCase.data);
        
        const options = {
            hostname: 'api.aicodestreams.com',
            port: 443,
            path: '/send-notification',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };
        
        const startTime = Date.now();
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const duration = Date.now() - startTime;
                
                try {
                    const result = JSON.parse(data);
                    console.log(`📊 Status: ${res.statusCode}`);
                    console.log(`⏱️  Duration: ${duration}ms`);
                    console.log('📨 Response:', JSON.stringify(result, null, 2));
                    
                    if (res.statusCode === 200 && result.success) {
                        console.log('✅ Test PASSED');
                    } else if (testCase.name.includes('should fail') && res.statusCode >= 400) {
                        console.log('✅ Test PASSED (expected failure)');
                    } else {
                        console.log('❌ Test FAILED');
                    }
                } catch (parseError) {
                    console.log('❌ Test FAILED - Invalid JSON response');
                    console.log('📄 Raw response:', data);
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            const duration = Date.now() - startTime;
            console.log(`❌ Test FAILED - Network error (${duration}ms)`);
            console.log('🔧 Error:', error.message);
            resolve();
        });
        
        req.on('timeout', () => {
            console.log('❌ Test FAILED - Timeout');
            req.destroy();
            resolve();
        });
        
        req.setTimeout(30000); // 30 second timeout
        req.write(postData);
        req.end();
    });
}

async function runAllTests() {
    console.log('🚀 Starting Comprehensive API Tests');
    console.log(`🌐 API Endpoint: ${API_URL}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    for (const testCase of testCases) {
        await runTest(testCase);
        
        // Wait between tests
        if (testCase !== testCases[testCases.length - 1]) {
            console.log('⏳ Waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check CloudWatch logs for detailed Lambda execution logs');
    console.log('2. Verify WhatsApp and SMS delivery');
    console.log('3. Test frontend integration');
    
    console.log('\n📊 View Lambda logs:');
    console.log('aws logs tail /aws/lambda/food-ordering-notifications-robust --follow --profile app --region us-east-1');
}

// Run tests
runAllTests().catch(console.error);