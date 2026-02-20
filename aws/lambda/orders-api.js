const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const path = event.rawPath || event.path;
  const method = event.requestContext.http.method;
  
  try {
    // GET /orders - Get all orders
    if (path === '/orders' && method === 'GET') {
      const result = await dynamodb.send(new ScanCommand({ 
        TableName: process.env.ORDERS_TABLE 
      }));
      return createResponse(200, result.Items);
    }
    
    // GET /orders/customer/{phone} - Get orders by customer
    if (path.startsWith('/orders/customer/') && method === 'GET') {
      let phone = path.split('/')[3];
      
      // Try both with and without +91 prefix
      const phones = [
        phone,
        `+91${phone}`,
        phone.replace(/^\+91/, ''),
        phone.replace(/^91/, '')
      ];
      
      // Remove duplicates
      const uniquePhones = [...new Set(phones)];
      
      // Query for all phone variations
      const results = await Promise.all(
        uniquePhones.map(p => 
          dynamodb.send(new QueryCommand({
            TableName: process.env.ORDERS_TABLE,
            IndexName: 'CustomerPhoneIndex',
            KeyConditionExpression: 'customerPhone = :phone',
            ExpressionAttributeValues: { ':phone': p }
          }))
        )
      );
      
      // Combine all results and remove duplicates by orderId
      const allItems = results.flatMap(r => r.Items || []);
      const uniqueOrders = Array.from(
        new Map(allItems.map(item => [item.orderId, item])).values()
      );
      
      return createResponse(200, uniqueOrders);
    }
    
    // PATCH /orders/{orderId}/status - Update order status
    if (path.match(/\/orders\/[^/]+\/status/) && method === 'PATCH') {
      const orderId = path.split('/')[2];
      const body = JSON.parse(event.body);
      await dynamodb.send(new UpdateCommand({
        TableName: process.env.ORDERS_TABLE,
        Key: { orderId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': body.status }
      }));
      return createResponse(200, { success: true });
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
      'Access-Control-Allow-Methods': 'GET,PATCH,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
