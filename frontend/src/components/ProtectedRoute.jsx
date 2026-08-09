import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user has unauthorized role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const spinnerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  backgroundColor: 'var(--bg-primary)',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid var(--border-color)',
  borderTop: '4px solid var(--primary-color)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

export default ProtectedRoute;
