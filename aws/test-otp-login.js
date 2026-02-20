// Test OTP login system
require('dotenv').config();

async function testOTPLogin() {
    console.log('🧪 Testing OTP Login System...\n');
    
    const testPhone = '7028104413';
    
    // Step 1: Send OTP
    console.log('Step 1: Sending OTP to', testPhone);
    try {
        const sendResponse = await fetch('http://localhost:3001/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: testPhone })
        });
        
        const sendData = await sendResponse.json();
        console.log('✅ OTP sent:', sendData);
        
        if (sendData.otp) {
            console.log('\n📱 Development OTP:', sendData.otp);
            console.log('   (This OTP is shown only in development mode)\n');
            
            // Step 2: Verify OTP
            console.log('Step 2: Verifying OTP...');
            const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: testPhone, 
                    otp: sendData.otp 
                })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
                console.log('✅ Login successful!');
                console.log('   User:', verifyData.user);
                console.log('\n📝 User can now:');
                console.log('   - Track their orders');
                console.log('   - View order history');
                console.log('   - Place new orders');
            } else {
                console.log('❌ Verification failed:', verifyData.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    console.log('\n📋 How to use:');
    console.log('1. Open: http://localhost:3001/login-otp.html');
    console.log('2. Enter phone number: 7028104413');
    console.log('3. Click "Send OTP"');
    console.log('4. Check SMS for OTP code');
    console.log('5. Enter OTP and login');
    console.log('6. View orders at: http://localhost:3001/my-orders.html');
}

testOTPLogin();
