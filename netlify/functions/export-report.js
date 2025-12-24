const msal = require('@azure/msal-node');
const axios = require('axios');

// MSAL config - This should be identical to your get-embed-token function
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

// Helper function to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.handler = async (event, context) => {
  const { reportId, workspaceId } = JSON.parse(event.body);

  if (!reportId || !workspaceId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Report and Workspace ID are required.' }) };
  }

  try {
    // 1. Get Access Token for Power BI API
    const authResponse = await cca.acquireTokenByClientCredential({ scopes: pbiApiScope });
    if (!authResponse || !authResponse.accessToken) {
      throw new Error('Failed to acquire access token');
    }
    const accessToken = authResponse.accessToken;

    // 2. Start the export job
    const exportUrl = `${pbiApiUrl}/groups/${workspaceId}/reports/${reportId}/ExportTo`;
    const exportResponse = await axios.post(exportUrl, 
      { format: 'PDF' }, 
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const exportId = exportResponse.data.id;

    // 3. Poll for the export status
    let exportStatus = '';
    let downloadUrl = '';
    const maxRetries = 10; // Poll for a maximum of 50 seconds (10 * 5s)
    for (let i = 0; i < maxRetries; i++) {
      const statusUrl = `${pbiApiUrl}/groups/${workspaceId}/reports/${reportId}/exports/${exportId}`;
      const statusResponse = await axios.get(statusUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      exportStatus = statusResponse.data.status;

      if (exportStatus === 'Succeeded') {
        downloadUrl = statusResponse.data.resourceLocation;
        break;
      } else if (exportStatus === 'Failed') {
        throw new Error('Power BI export job failed.');
      }

      await sleep(5000); // Wait 5 seconds before polling again
    }

    if (!downloadUrl) {
      throw new Error('Export job timed out.');
    }

    // 4. Return the download URL to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ downloadUrl }),
    };

  } catch (error) {
    console.error('--- Export Function Error ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify(error.response?.data || { message: error.message }),
    };
  }
};
