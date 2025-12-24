exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const DIFY_API_URL = 'https://udify.app/v1';
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  if (!DIFY_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DIFY_API_KEY not configured' })
    };
  }

  try {
    const { inputs, query, conversation_id, user } = JSON.parse(event.body);

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs || {},
        query: query,
        response_mode: 'blocking',
        conversation_id: conversation_id || '',
        user: user || 'default-user'
      })
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
    console.error('Error in dify-chat function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
