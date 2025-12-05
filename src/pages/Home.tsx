import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, CalendarDays } from 'lucide-react';
import { dashboards } from '../data/dashboards';
import type { Dashboard } from '../data/dashboards';
import DashboardCard from '../components/DashboardCard';
import './Home.css';

const Home: React.FC = () => {
  const [recentDashboards, setRecentDashboards] = useState<Dashboard[]>([]);
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
      return 'Good morning';
    }
    if (currentHour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  useEffect(() => {
    // Load recently viewed dashboards
    const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewedDashboards') || '[]');
    const filteredRecent = dashboards.filter(dashboard => recentlyViewedIds.includes(dashboard.id));
    const orderedRecent = recentlyViewedIds.map((id: string) => filteredRecent.find(d => d.id === id)).filter(Boolean) as Dashboard[];
    setRecentDashboards(orderedRecent);

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
        <h2 className="section-title"><Clock size={20} /> Recently visited</h2>
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
        <h2 className="section-title"><Star size={20} /> Favorite dashboards</h2>
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
