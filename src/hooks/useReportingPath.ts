import { useState, useEffect } from 'react';

const getReportingPath = () => {
  const lastViewedId = localStorage.getItem('lastViewedDashboardId');
  return lastViewedId ? `/reporting/${lastViewedId}` : '/reporting';
};

export const useReportingPath = () => {
  const [reportingPath, setReportingPath] = useState(getReportingPath());

  useEffect(() => {
    const handleStorageChange = () => {
      setReportingPath(getReportingPath());
    };

    // Custom event to notify of storage changes within the same tab
    window.addEventListener('storageUpdated', handleStorageChange);

    // Also listen to the standard storage event for cross-tab consistency
    window.addEventListener('storage', handleStorageChange);

    // Set initial path
    handleStorageChange();

    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return reportingPath;
};
