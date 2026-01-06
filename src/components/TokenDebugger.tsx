import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TokenDebugger: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const getToken = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently();
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setTokenInfo({
          token: token.substring(0, 50) + '...',
          payload
        });
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated || !tokenInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #333',
      padding: '15px',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Token Debug Info</h3>
      <div><strong>Audience (aud):</strong> {tokenInfo.payload.aud}</div>
      <div><strong>Issuer (iss):</strong> {tokenInfo.payload.iss}</div>
      <div><strong>Subject (sub):</strong> {tokenInfo.payload.sub}</div>
      <div><strong>Expires:</strong> {new Date(tokenInfo.payload.exp * 1000).toLocaleString()}</div>
      <details style={{ marginTop: '10px' }}>
        <summary>Full Payload</summary>
        <pre style={{ fontSize: '10px', overflow: 'auto' }}>
          {JSON.stringify(tokenInfo.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TokenDebugger;
