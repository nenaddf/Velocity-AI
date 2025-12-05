import React from 'react';
import type { Dashboard } from '../data/dashboards';
import './DashboardCard.css';

interface DashboardCardProps {
  dashboard: Dashboard;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard }) => {
  return (
    <div className="dashboard-card">
      <h3>{dashboard.title}</h3>
      <p>{dashboard.description}</p>
      <span className="dashboard-category">{dashboard.category}</span>
    </div>
  );
};

export default DashboardCard;
