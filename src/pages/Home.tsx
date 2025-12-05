import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, CalendarDays } from 'lucide-react';
import { dashboards } from '../data/dashboards';
import type { Dashboard } from '../data/dashboards';
import DashboardCard from '../components/DashboardCard';
import './Home.css';

const Home: React.FC = () => {
  const [recentDashboards, setRecentDashboards] = useState<(Dashboard & { timeAgo: string })[]>([]);
  const [favoriteDashboards, setFavoriteDashboards] = useState<Dashboard[]>([]);

  const getFormattedDate = () => {
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const month = today.toLocaleDateString('en-US', { month: 'short' });
    const day = today.getDate();

    const getDayWithOrdinal = (d: number): string => {
      if (d > 3 && d < 21) return `${d}th`;
      switch (d % 10) {
        case 1: return `${d}st`;
        case 2: return `${d}nd`;
        case 3: return `${d}rd`;
        default: return `${d}th`;
      }
    };

    return `${weekday}, ${month} ${getDayWithOrdinal(day)}`;
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning 👋';
    }
    if (currentHour < 18) {
      return 'Good afternoon 👋';
    }
    return 'Good evening 👋';
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    // Load recently viewed dashboards
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewedDashboards') || '[]') as { id: string; timestamp: number }[];
    const enrichedRecent = recentlyViewed.map(item => {
      const dashboard = dashboards.find(d => d.id === item.id);
      return dashboard ? { ...dashboard, timeAgo: formatTimeAgo(item.timestamp) } : null;
    }).filter(Boolean) as (Dashboard & { timeAgo: string })[];
    setRecentDashboards(enrichedRecent);

    // Load favorite dashboards
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteDashboards') || '[]');
    const favoriteItems = dashboards.filter(dashboard => favoriteIds.includes(dashboard.id));
    setFavoriteDashboards(favoriteItems);
  }, []);

  return (
    <div>
      <div className="welcome-header">
        <div className="welcome-header-text">
          <h1>{getGreeting()}</h1>
          <p className="welcome-subtitle">Welcome to your Velocity AI hub.</p>
        </div>
                <div className="welcome-header-date">
          <CalendarDays size={20} />
          <span>{getFormattedDate()}</span>
        </div>
      </div>

      <div className="recent-dashboards">
        <h2 className="section-title"><Clock size={20} color="#007bff" /> Recently visited dashboards</h2>
        {recentDashboards.length > 0 ? (
          <div className="dashboard-grid">
            {recentDashboards.map(dashboard => (
              <Link to={`/reporting/${dashboard.id}`} key={dashboard.id} className="dashboard-card-link">
                <DashboardCard dashboard={dashboard} />
              </Link>
            ))}
          </div>
        ) : (
          <p>No recently visited dashboards.</p>
        )}
      </div>

      <div className="favorite-dashboards">
        <h2 className="section-title"><Star size={20} color="#ffc107" /> Favorite dashboards</h2>
        {favoriteDashboards.length > 0 ? (
          <div className="dashboard-grid">
            {favoriteDashboards.map(dashboard => (
              <Link to={`/reporting/${dashboard.id}`} key={dashboard.id} className="dashboard-card-link">
                <DashboardCard dashboard={dashboard} />
              </Link>
            ))}
          </div>
        ) : (
          <p>No favorite dashboards have been set.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
