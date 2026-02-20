const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  const httpMethod = event.httpMethod || event.requestContext?.http?.method;
  console.log('HTTP Method:', httpMethod);
  console.log('Query Parameters:', event.queryStringParameters);
  
  // Handle OPTIONS for CORS
  if (httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }
  
  try {
    // Handle GET requests for analytics
    if (httpMethod === 'GET') {
      return await handleGetRequest(event);
    }
    
    // Handle POST requests for tracking
    if (httpMethod === 'POST') {
      return await handlePostRequest(event);
    }
    
    return createResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, { error: error.message });
  }
};

async function handlePostRequest(event) {
  const body = JSON.parse(event.body || '{}');
  const { visitorId, pageUrl } = body;
  
  if (!visitorId) {
    return createResponse(400, { error: 'Missing visitorId' });
  }
  
  await dynamodb.send(new PutCommand({
    TableName: process.env.VISITORS_TABLE,
    Item: {
      visitorId,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // Store date for easy querying
      pageUrl: pageUrl || '/',
      userAgent: event.headers['user-agent'] || 'unknown'
    }
  }));
  
  return createResponse(200, { success: true });
}

async function handleGetRequest(event) {
  const queryParams = event.queryStringParameters || {};
  const { startDate, endDate } = queryParams;
  
  if (!startDate || !endDate) {
    return createResponse(400, { error: 'Missing startDate or endDate parameters' });
  }
  
  // Scan the table for the date range
  const params = {
    TableName: process.env.VISITORS_TABLE,
    FilterExpression: '#date BETWEEN :startDate AND :endDate',
    ExpressionAttributeNames: {
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':startDate': startDate,
      ':endDate': endDate
    }
  };
  
  const result = await dynamodb.send(new ScanCommand(params));
  const items = result.Items || [];
  
  // Calculate statistics
  const uniqueVisitors = new Set(items.map(item => item.visitorId)).size;
  const totalPageViews = items.length;
  
  // Group by date for daily breakdown
  const dailyStats = {};
  items.forEach(item => {
    const date = item.date;
    if (!dailyStats[date]) {
      dailyStats[date] = {
        date,
        visitors: new Set(),
        pageViews: 0
      };
    }
    dailyStats[date].visitors.add(item.visitorId);
    dailyStats[date].pageViews++;
  });
  
  // Convert to array and format
  const dailyBreakdown = Object.values(dailyStats).map(day => ({
    date: day.date,
    visitors: day.visitors.size,
    pageViews: day.pageViews
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  return createResponse(200, {
    visitors: uniqueVisitors,
    pageViews: totalPageViews,
    dailyStats: dailyBreakdown,
    startDate,
    endDate
  });
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
