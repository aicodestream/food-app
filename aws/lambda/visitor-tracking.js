const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
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
        pageUrl: pageUrl || '/',
        userAgent: event.headers['user-agent'] || 'unknown'
      }
    }));
    
    return createResponse(200, { success: true });
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
