exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
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
        response_mode: 'streaming',
        conversation_id: conversation_id || '',
        user: user || 'default-user'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API Error:', errorText);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: errorText })
      };
    }

    // Read the streaming response and collect all chunks
    const reader = response.body;
    const chunks = [];
    let fullAnswer = '';
    let conversationId = '';
    let messageId = '';

    for await (const chunk of reader) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split('\n').filter(line => line.trim().startsWith('data:'));
      
      for (const line of lines) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '');
          const data = JSON.parse(jsonStr);
          
          if (data.event === 'message' || data.event === 'agent_message') {
            fullAnswer += data.answer || '';
            conversationId = data.conversation_id || conversationId;
            messageId = data.message_id || messageId;
          } else if (data.event === 'message_end') {
            conversationId = data.conversation_id || conversationId;
            messageId = data.id || messageId;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        answer: fullAnswer,
        conversation_id: conversationId,
        message_id: messageId
      })
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
