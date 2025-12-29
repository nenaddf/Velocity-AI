import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    isAuthenticated && user && (
      <div className="profile-container">
        <span className="profile-email" title={user.email}>{user.email}</span>
      </div>
    )
  );
};

export default Profile;
