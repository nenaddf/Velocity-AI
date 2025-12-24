import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Reporting from './pages/Reporting';
import AI from './pages/AI';
import DashboardViewer from './pages/DashboardViewer';
import './App.css';

const App: React.FC = () => {
  const location = useLocation();
  const isReportPage = location.pathname.startsWith('/reporting/');
  return (
    <div className="app-container">
      <Sidebar />
      <main className={`main-content ${isReportPage ? 'main-content--no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/reporting/:dashboardId" element={<DashboardViewer />} />
          <Route path="/ai" element={<AI />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
