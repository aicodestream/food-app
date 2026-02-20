// Authentication related database queries
const { pool } = require('./config');
const bcrypt = require('bcrypt');

// Register new user
async function registerUser(userData) {
    const { username, password, name, phone, email } = userData;
    
    // Check if username exists
    const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );
    
    if (existing.length > 0) {
        throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query(
        'INSERT INTO users (username, password, name, phone, email, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, name, phone, email || null, 'customer']
    );
    
    return {
        id: result.insertId,
        username,
        name,
        phone,
        role: 'customer'
    };
}

// Login user
async function loginUser(username, password) {
    // Get user
    const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
    );
    
    if (users.length === 0) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    const user = users[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    // Update last login
    await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return { 
        success: true, 
        user: userWithoutPassword 
    };
}

// Get user by ID
async function getUserById(userId) {
    const [users] = await pool.query(
        'SELECT id, username, name, phone, email, role, created_at FROM users WHERE id = ?',
        [userId]
    );
    return users.length > 0 ? users[0] : null;
}

// Update user profile
async function updateUserProfile(userId, data) {
    const { name, phone, email } = data;
    await pool.query(
        'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phone, email, userId]
    );
}

// Change password
async function changePassword(userId, oldPassword, newPassword) {
    // Get current password
    const [users] = await pool.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
    );
    
    if (users.length === 0) {
        return { success: false, message: 'User not found' };
    }
    
    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, users[0].password);
    
    if (!validPassword) {
        return { success: false, message: 'Current password is incorrect' };
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
    );
    
    return { success: true, message: 'Password changed successfully' };
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    updateUserProfile,
    changePassword
};
