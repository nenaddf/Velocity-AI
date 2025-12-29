import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Sidebar.css';
import { Home, BarChart2, Sparkles } from 'lucide-react';
import logo from '../assets/Velocity-sellers-logo-1.webp';
import { useReportingPath } from '../hooks/useReportingPath';
import LogoutButton from './LogoutButton';
import Profile from './Profile';

const Sidebar: React.FC = () => {
  const reportingPath = useReportingPath();
  const { isAuthenticated } = useAuth0();

  return (
    <div className="sidebar">
      <div>
        <img src={logo} alt="Velocity Sellers Logo" className="sidebar-logo" />
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Home />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={reportingPath} key={reportingPath} className={({ isActive }) => (isActive ? 'active' : '')}>
              <BarChart2 />
              <span>Reporting</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Sparkles />
              <span>AI</span>
            </NavLink>
          </li>
        </ul>
      </div>
      {isAuthenticated && (
        <div className="sidebar-footer">
          <Profile />
          <LogoutButton />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
