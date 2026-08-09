import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  roles?: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/customers', icon: '◈', label: 'Customers CRM', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { to: '/products', icon: '⬛', label: 'Products', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/inventory', icon: '⊞', label: 'Inventory', roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/challans', icon: '◎', label: 'Sales Challans', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
];

const Sidebar: React.FC = () => {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColorClass = (role?: string) => {
    switch (role) {
      case 'ADMIN':     return 'role-admin';
      case 'SALES':     return 'role-sales';
      case 'WAREHOUSE': return 'role-warehouse';
      case 'ACCOUNTS':  return 'role-accounts';
      default:          return '';
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.12))', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 16px rgba(99,102,241,0.2)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30" x2="40" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <line x1="7"  y1="26" x2="7"  y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="4.5" y="22" width="5" height="4" rx="1" fill="#ef4444"/>
            <line x1="7"  y1="18" x2="7"  y2="22" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="16" y1="28" x2="16" y2="32" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="13.5" y="18" width="5" height="10" rx="1" fill="#10b981"/>
            <line x1="16" y1="13" x2="16" y2="18" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="25" y1="25" x2="25" y2="30" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="22.5" y="14" width="5" height="11" rx="1" fill="#10b981"/>
            <line x1="25" y1="10" x2="25" y2="14" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="22" x2="34" y2="28" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="31.5" y="18" width="5" height="4" rx="1" fill="#ef4444"/>
            <line x1="34" y1="12" x2="34" y2="18" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 31 L14 24 L22 17 L32 10" stroke="url(#sTrend)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="32" cy="10" r="2" fill="#06b6d4"/>
            <defs>
              <linearGradient id="sTrend" x1="4" y1="31" x2="32" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">ERP + CRM</span>
          <span className="brand-subtitle">Wholesale Ops</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">Menu</span>

        {NAV_ITEMS.map((item) => {
          if (item.roles && !hasRole(...(item.roles as any[]))) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          );
        })}

        <span className="nav-section-title" style={{ marginTop: '0.5rem' }}>Quick Actions</span>

        {hasRole('ADMIN', 'SALES') && (
          <NavLink to="/challans/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">✦</span>
            <span className="nav-label">New Challan</span>
          </NavLink>
        )}

        {hasRole('ADMIN', 'SALES') && (
          <NavLink to="/customers/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">＋</span>
            <span className="nav-label">Add Customer</span>
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sign Out"
          >
            ⬡
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
