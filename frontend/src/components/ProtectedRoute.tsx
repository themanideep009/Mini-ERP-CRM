import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/index.js';
import LoadingSpinner from './LoadingSpinner.js';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return (
      <div className="access-denied-container">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold text-danger mb-2">403 - Access Denied</h2>
          <p className="text-secondary mb-4">
            Your role (<strong>{user.role}</strong>) does not have permission to view this page.
          </p>
          <a href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
