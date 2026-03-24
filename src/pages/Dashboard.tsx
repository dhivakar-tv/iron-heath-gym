import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" />;
    case 'trainer':
      return <Navigate to="/trainer-dashboard" />;
    case 'member':
      return <Navigate to="/member-dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

export default Dashboard;
