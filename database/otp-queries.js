// OTP authentication queries
const { pool } = require('./config');
const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioSmsNumber = process.env.TWILIO_SMS_NUMBER;
const client = twilio(accountSid, authToken);

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS
async function sendOTP(phone) {
    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
    
    // Generate OTP
    const otpCode = generateOTP();
    
    // Set expiry (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    try {
        // Store OTP in database
        await pool.query(
            'INSERT INTO otp_codes (phone, otp_code, expires_at) VALUES (?, ?, ?)',
            [formattedPhone, otpCode, expiresAt]
        );
        
        // Send SMS via Twilio
        const message = `Your Shiv Tirth Wada OTP is: ${otpCode}. Valid for 5 minutes. Do not share this code.`;
        
        const smsResult = await client.messages.create({
            body: message,
            from: twilioSmsNumber,
            to: formattedPhone
        });
        
        console.log('OTP sent:', smsResult.sid, 'to', formattedPhone);
        
        return {
            success: true,
            message: 'OTP sent successfully',
            phone: formattedPhone,
            // For testing only - remove in production
            otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
        };
        
    } catch (error) {
        console.error('Send OTP error:', error);
        throw new Error('Failed to send OTP');
    }
}

// Verify OTP and login/register user
async function verifyOTPAndLogin(phone, otpCode) {
    const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
    
    // Get the most recent unused OTP for this phone
    const [otps] = await pool.query(
        `SELECT * FROM otp_codes 
         WHERE phone = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [formattedPhone, otpCode]
    );
    
    if (otps.length === 0) {
        return {
            success: false,
            message: 'Invalid or expired OTP'
        };
    }
    
    // Mark OTP as used
    await pool.query(
        'UPDATE otp_codes SET is_used = TRUE, verified_at = NOW() WHERE id = ?',
        [otps[0].id]
    );
    
    // Check if user exists
    const [users] = await pool.query(
        'SELECT * FROM users WHERE phone = ?',
        [formattedPhone]
    );
    
    let user;
    
    if (users.length === 0) {
        // Create new user for OTP login (no username/password needed)
        const [result] = await pool.query(
            'INSERT INTO users (phone, name, role, is_active) VALUES (?, ?, ?, ?)',
            [formattedPhone, 'Customer', 'customer', true]
        );
        
        user = {
            id: result.insertId,
            phone: formattedPhone,
            name: 'Customer',
            role: 'customer'
        };
        
        console.log('New user created via OTP:', user.id);
    } else {
        user = users[0];
        
        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );
    }
    
    // Return user without sensitive data
    const { password, ...userWithoutPassword } = user;
    
    return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
    };
}

// Clean up expired OTPs (can be called periodically)
async function cleanupExpiredOTPs() {
    const [result] = await pool.query(
        'DELETE FROM otp_codes WHERE expires_at < NOW() OR (is_used = TRUE AND verified_at < DATE_SUB(NOW(), INTERVAL 1 DAY))'
    );
    
    console.log('Cleaned up', result.affectedRows, 'expired OTPs');
    return result.affectedRows;
}

module.exports = {
    sendOTP,
    verifyOTPAndLogin,
    cleanupExpiredOTPs
};
