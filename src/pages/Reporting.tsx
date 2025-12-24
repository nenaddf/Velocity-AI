import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { dashboards } from '../data/dashboards';
import './Reporting.css';

const Reporting: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoriteDashboards') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const toggleFavorite = (dashboardId: string) => {
    const updatedFavorites = favorites.includes(dashboardId)
      ? favorites.filter(id => id !== dashboardId)
      : [...favorites, dashboardId];
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteDashboards', JSON.stringify(updatedFavorites));
  };

  const categories = useMemo(() => {
    const allCategories = dashboards.map(d => d.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredDashboards = useMemo(() => {
    return dashboards.filter(dashboard => {
      const matchesCategory = selectedCategory === 'All' || dashboard.category === selectedCategory;
      const matchesSearch = dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dashboard.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="reporting-page">
      <h1>Reporting Dashboards</h1>
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search dashboards..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Favorite</th>
            </tr>
          </thead>
          <tbody>
            {filteredDashboards.length > 0 ? (
              filteredDashboards.map((dashboard) => (
                <tr key={dashboard.id}>
                  <td><Link to={`/reporting/${dashboard.id}`}>{dashboard.title}</Link></td>
                  <td>{dashboard.description}</td>
                  <td><span className={`category-tag category-${dashboard.category.toLowerCase()}`}>{dashboard.category}</span></td>
                  <td>
                    <Star
                      className={`favorite-star ${favorites.includes(dashboard.id) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(dashboard.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No dashboards match your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reporting;
