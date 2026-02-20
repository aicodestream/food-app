const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const crypto = require('crypto');

const secretsManager = new SecretsManagerClient({});

exports.handler = async (event) => {
  const path = event.rawPath || event.path;
  const method = event.requestContext.http.method;
  
  try {
    // POST /admin-login - Verify admin password
    if (path === '/admin-login' && method === 'POST') {
      const body = JSON.parse(event.body);
      const { password } = body;
      
      if (!password) {
        return createResponse(400, { error: 'Password is required' });
      }
      
      // Get admin password from Secrets Manager
      const secretName = process.env.ADMIN_SECRET_NAME || 'food-ordering-admin-password';
      
      try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const secretResponse = await secretsManager.send(command);
        const secret = JSON.parse(secretResponse.SecretString);
        
        // Verify password
        if (password === secret.password) {
          // Generate a simple session token
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
          
          return createResponse(200, {
            success: true,
            token: token,
            expiresAt: expiresAt,
            message: 'Login successful'
          });
        } else {
          return createResponse(401, {
            success: false,
            error: 'Invalid password'
          });
        }
      } catch (error) {
        console.error('Error fetching secret:', error);
        return createResponse(500, {
          success: false,
          error: 'Authentication service error'
        });
      }
    }
    
    // POST /admin-verify - Verify admin session token
    if (path === '/admin-verify' && method === 'POST') {
      const body = JSON.parse(event.body);
      const { token } = body;
      
      if (!token) {
        return createResponse(400, { error: 'Token is required' });
      }
      
      // For now, accept any token (simple implementation)
      // In production, store tokens in DynamoDB with expiration
      return createResponse(200, {
        valid: true,
        message: 'Session is valid'
      });
    }
    
    return createResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, { error: error.message });
  }
};

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
