import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PowerBIEmbed } from 'powerbi-client-react';
import * as models from 'powerbi-models';
import { dashboards } from '../data/dashboards';
import './DashboardViewer.css';

const DashboardViewer: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [embedConfig, setEmbedConfig] = useState<models.IReportEmbedConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbedToken = async () => {
      setLoading(true);
      const dashboard = dashboards.find(d => d.id === dashboardId);

      if (!dashboard) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/.netlify/functions/get-embed-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportId: dashboard.id,
            workspaceId: dashboard.workspaceId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch embed token.');
        }

        const data = await response.json();

        const config: models.IReportEmbedConfiguration = {
          type: 'report',
          id: data.reportId,
          embedUrl: `https://app.powerbi.com/reportEmbed`,
          accessToken: data.token,
          tokenType: models.TokenType.Embed,
          settings: {
            background: models.BackgroundType.Default,
            bars: {
              statusBar: {
                visible: false
              }
            }
          },
        };

        setEmbedConfig(config);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (dashboardId) {
      // Set the single last viewed dashboard for sidebar navigation
      localStorage.setItem('lastViewedDashboardId', dashboardId);
      window.dispatchEvent(new Event('storageUpdated'));

      // Update the list of recently viewed dashboards with timestamps
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewedDashboards') || '[]') as { id: string; timestamp: number }[];
      const updatedRecentlyViewed = [
        { id: dashboardId, timestamp: Date.now() },
        ...recentlyViewed.filter(item => item.id !== dashboardId)
      ].slice(0, 4); // Store last 4 unique
      localStorage.setItem('recentlyViewedDashboards', JSON.stringify(updatedRecentlyViewed));
    }
    fetchEmbedToken();
  }, [dashboardId]);

  if (loading) {
    return <div className="loading-text">Loading Report... Please wait.</div>;
  }

  if (!embedConfig) {
    return <div className="error-text">Error: Could not load report configuration. Please check credentials and permissions.</div>;
  }


  return (
    <div className="dashboard-viewer-container">
      <div className="dashboard-header">
        <Link to="/reporting" className="back-button" onClick={() => {
          localStorage.removeItem('lastViewedDashboardId');
          window.dispatchEvent(new Event('storageUpdated'));
        }}>&larr; Back to List</Link>
      </div>
      <PowerBIEmbed
        embedConfig={embedConfig}
        cssClassName="report-embed-class"
      />
    </div>
  );
};

export default DashboardViewer;
