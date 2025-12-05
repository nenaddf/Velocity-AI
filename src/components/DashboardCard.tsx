import React from 'react';
import type { Dashboard } from '../data/dashboards';
import './DashboardCard.css';

interface DashboardCardProps {
  dashboard: Dashboard & { timeAgo?: string };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard }) => {
  return (
    <div className="dashboard-card">
      <h3>{dashboard.title}</h3>
      <p>{dashboard.description}</p>
      <div className="card-footer">
        <span className="dashboard-category">{dashboard.category}</span>
        {dashboard.timeAgo && <span className="time-ago">{dashboard.timeAgo}</span>}
      </div>
    </div>
  );
};

export default DashboardCard;
