const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const path = event.rawPath || event.path;
  const queryParams = event.queryStringParameters || {};
  
  try {
    // GET /stats/daily/{date}
    if (path.startsWith('/stats/daily/')) {
      const date = path.split('/')[3];
      const result = await dynamodb.send(new ScanCommand({
        TableName: process.env.ORDERS_TABLE,
        FilterExpression: 'begins_with(orderTime, :date)',
        ExpressionAttributeValues: { ':date': date }
      }));
      
      const stats = {
        total_orders: result.Items.length,
        total_revenue: result.Items.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        avg_order_value: result.Items.length ? result.Items.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / result.Items.length : 0,
        unique_customers: new Set(result.Items.map(o => o.customerPhone)).size
      };
      
      return createResponse(200, stats);
    }
    
    // GET /stats/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    if (path === '/stats/range') {
      const { startDate, endDate } = queryParams;
      
      const result = await dynamodb.send(new ScanCommand({
        TableName: process.env.ORDERS_TABLE
      }));
      
      // Filter by date range
      const filteredOrders = result.Items.filter(order => {
        const orderDate = order.orderTime.split('T')[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      const stats = {
        total_orders: filteredOrders.length,
        total_revenue: filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        avg_order_value: filteredOrders.length ? filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / filteredOrders.length : 0,
        orders_by_status: {
          pending: filteredOrders.filter(o => o.status === 'Pending').length,
          preparing: filteredOrders.filter(o => o.status === 'Preparing').length,
          delivering: filteredOrders.filter(o => o.status === 'Out for Delivery').length,
          delivered: filteredOrders.filter(o => o.status === 'Delivered').length
        }
      };
      
      return createResponse(200, stats);
    }
    
    // GET /stats/customers
    if (path === '/stats/customers') {
      const result = await dynamodb.send(new ScanCommand({
        TableName: process.env.ORDERS_TABLE
      }));
      
      // Group orders by customer
      const customerMap = {};
      result.Items.forEach(order => {
        const phone = order.customerPhone;
        if (!customerMap[phone]) {
          customerMap[phone] = {
            phone: phone,
            name: order.customerName,
            total_orders: 0,
            total_spent: 0,
            last_order: order.orderTime
          };
        }
        customerMap[phone].total_orders++;
        customerMap[phone].total_spent += order.totalAmount || 0;
        if (order.orderTime > customerMap[phone].last_order) {
          customerMap[phone].last_order = order.orderTime;
        }
      });
      
      const customers = Object.values(customerMap).sort((a, b) => b.total_spent - a.total_spent);
      
      return createResponse(200, customers);
    }
    
    // GET /stats/visitors/today
    if (path === '/stats/visitors/today') {
      const today = new Date().toISOString().split('T')[0];
      const result = await dynamodb.send(new ScanCommand({
        TableName: process.env.VISITORS_TABLE,
        FilterExpression: 'begins_with(#ts, :date)',
        ExpressionAttributeNames: { '#ts': 'timestamp' },
        ExpressionAttributeValues: { ':date': today }
      }));
      
      return createResponse(200, {
        unique_visitors: new Set(result.Items.map(v => v.visitorId)).size,
        page_views: result.Items.length
      });
    }
    
    // GET /stats/visitors/total
    if (path === '/stats/visitors/total') {
      const result = await dynamodb.send(new ScanCommand({
        TableName: process.env.VISITORS_TABLE
      }));
      
      return createResponse(200, {
        total_unique_visitors: new Set(result.Items.map(v => v.visitorId)).size
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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
