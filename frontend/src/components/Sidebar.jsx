import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Determine visibility of tabs based on roles
  const canViewCRM = ['ADMIN', 'SALES', 'ACCOUNTS'].includes(user.role);
  const canViewInventory = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user.role);
  const canViewChallans = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user.role);

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainerStyle}>
        <span style={logoIconStyle}>📦</span>
        <div style={logoTextStyle}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', tracking: '0.05em' }}>ERP + CRM</h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>OPERATIONS PORTAL</span>
        </div>
      </div>

      <nav style={navStyle}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          <span>📊</span> Dashboard
        </NavLink>

        {canViewCRM && (
          <NavLink
            to="/customers"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            <span>👥</span> Customers (CRM)
          </NavLink>
        )}

        {canViewInventory && (
          <>
            <NavLink
              to="/products"
              style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            >
              <span>🏷️</span> Products
            </NavLink>
            <NavLink
              to="/inventory"
              style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            >
              <span>🏭</span> Inventory Stock
            </NavLink>
          </>
        )}

        {canViewChallans && (
          <NavLink
            to="/challans"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            <span>📜</span> Sales Challans
          </NavLink>
        )}
      </nav>

      <div style={footerStyle}>
        <div style={userSummaryStyle}>
          <div style={avatarStyle}>{user.name.charAt(0)}</div>
          <div style={{ minWidth: 0 }}>
            <p style={userNameStyle}>{user.name}</p>
            <span style={userRoleStyle}>{user.role}</span>
          </div>
        </div>
        <button onClick={logout} style={logoutButtonStyle}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

// Component styling objects
const sidebarStyle = {
  width: '260px',
  backgroundColor: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 90,
};

const logoContainerStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const logoIconStyle = {
  fontSize: '1.75rem',
};

const logoTextStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const navStyle = {
  padding: '1.5rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  flexGrow: 1,
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  color: 'var(--text-secondary)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all var(--transition-fast)',
};

const activeLinkStyle = {
  ...linkStyle,
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-accent)',
  borderLeft: '4px solid var(--primary-color)',
  paddingLeft: 'calc(1rem - 4px)',
};

const footerStyle = {
  padding: '1.25rem',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
};

const userSummaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  flexShrink: 0,
};

const userNameStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const userRoleStyle = {
  fontSize: '0.7rem',
  color: 'var(--primary-color)',
  fontWeight: '700',
  letterSpacing: '0.05em',
};

const logoutButtonStyle = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '0.5rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.825rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  textAlign: 'center',
};

export default Sidebar;
