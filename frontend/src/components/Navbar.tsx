import React from 'react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Operations Portal' }) => {
  const { user } = useAuth();

  // Breadcrumb-style title parts
  const parts = title.split(' — ');

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-header-title">{title}</h1>
      </div>
      <div className="navbar-right">
        {/* Live status dot */}
        <div className="role-tag">
          <span className="dot dot-success" />
          <span>{user?.role}</span>
        </div>

        {/* Notification bell placeholder */}
        <button className="notif-btn" title="Notifications">
          🔔
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'white',
            flexShrink: 0,
            border: '2px solid rgba(99,102,241,0.35)',
            cursor: 'default',
          }}
          title={user?.name}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
