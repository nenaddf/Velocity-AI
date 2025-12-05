const msal = require('@azure/msal-node');
const axios = require('axios');

// MSAL config
const config = {
  auth: {
    clientId: process.env.PBI_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.PBI_TENANT_ID}`,
    clientSecret: process.env.PBI_CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(config);

// Power BI API config
const pbiApiScope = ['https://analysis.windows.net/powerbi/api/.default'];
const pbiApiUrl = 'https://api.powerbi.com/v1.0/myorg';

// Main handler function
exports.handler = async (event, context) => {
  console.log('--- Invoking get-embed-token function ---');
  console.log('Using Tenant ID:', process.env.PBI_TENANT_ID);
  console.log('Using Client ID:', process.env.PBI_CLIENT_ID);
  console.log('Client Secret is present:', !!process.env.PBI_CLIENT_SECRET);

  const body = JSON.parse(event.body);
  const { reportId, workspaceId } = body;

  if (!reportId || !workspaceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Report ID and Workspace ID are required.' }),
    };
  }

  try {
    // 1. Get Access Token for Power BI API
    const authResponse = await cca.acquireTokenByClientCredential({ scopes: pbiApiScope });
    if (!authResponse || !authResponse.accessToken) {
      throw new Error('Failed to acquire access token');
    }
    console.log('Step 1 complete: Successfully acquired access token from Microsoft.');

    // 2. Get Embed Token for the specific report
    const requestUrl = `${pbiApiUrl}/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
    console.log('Step 2: Requesting embed token from URL:', requestUrl);

    const embedTokenResponse = await axios.post(requestUrl, 
      { accessLevel: 'View' },
      {
        headers: {
          'Authorization': `Bearer ${authResponse.accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const embedTokenData = embedTokenResponse.data;

    // 3. Return the embed token and details to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        token: embedTokenData.token,
        expiration: embedTokenData.expiration,
        reportId: reportId,
      }),
    };
  } catch (error) {
    console.error('--- Full Error Response ---');
    // Axios errors have a specific structure, let's log it
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }

    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify(error.response?.data || { message: error.message }),
    };
  }
};
