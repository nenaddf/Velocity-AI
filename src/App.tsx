import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Reporting from './pages/Reporting';
import AI from './pages/AI';
import DashboardViewer from './pages/DashboardViewer';
import LoginButton from './components/LoginButton';
import logo from './assets/Velocity-sellers-logo-1.webp';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();
  const isReportPage = location.pathname.startsWith('/reporting/');
  const isAIPage = location.pathname === '/ai';

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Welcome to Velocity AI</h1>
        <p>Please log in to continue.</p>
        <LoginButton />
        <img src={logo} alt="Velocity AI Logo" className="login-logo" />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className={`main-content ${isReportPage || isAIPage ? 'main-content--no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<ProtectedRoute component={Home} />} />
          <Route path="/reporting" element={<ProtectedRoute component={Reporting} />} />
          <Route path="/reporting/:dashboardId" element={<ProtectedRoute component={DashboardViewer} />} />
          <Route path="/ai" element={<ProtectedRoute component={AI} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
