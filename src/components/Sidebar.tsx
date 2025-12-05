import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Home, BarChart2, BrainCircuit } from 'lucide-react';
import logo from '../assets/Velocity-sellers-logo-1.webp';
import { useReportingPath } from '../hooks/useReportingPath';

const Sidebar: React.FC = () => {
  const reportingPath = useReportingPath();
  return (
    <div className="sidebar">
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
            <BrainCircuit />
            <span>AI</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
