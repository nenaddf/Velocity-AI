exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const DIFY_API_URL = 'https://api.dify.ai/v1';
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  if (!DIFY_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DIFY_API_KEY not configured' })
    };
  }

  try {
    const response = await fetch(`${DIFY_API_URL}/parameters`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Dify API Error:', data);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error in dify-parameters function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        fallback_views: [
          'consolidated_ad_performance_view',
          'consolidated_ad_performance_view_last_6_months',
          'campaign_performance_view',
          'product_performance_view'
        ]
      })
    };
  }
};
