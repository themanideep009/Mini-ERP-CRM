import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/customers/create')) return 'Add New Customer';
    if (path.includes('/customers/') && path.endsWith('/edit')) return 'Edit Customer Profile';
    if (path.startsWith('/customers/')) return 'Customer CRM Profile';
    if (path.startsWith('/customers')) return 'Customer CRM Database';
    
    if (path.startsWith('/products/create')) return 'Add New Product';
    if (path.includes('/products/') && path.endsWith('/edit')) return 'Edit Product Profile';
    if (path.startsWith('/products/')) return 'Product Inventory Profile';
    if (path.startsWith('/products')) return 'Product Catalogue';
    
    if (path.startsWith('/inventory')) return 'Inventory Stock Movements';
    
    if (path.startsWith('/challans/create')) return 'Create Sales Challan';
    if (path.startsWith('/challans/')) return 'Sales Challan Details';
    if (path.startsWith('/challans')) return 'Sales Challans Register';
    
    return 'Mini ERP + CRM';
  };

  return (
    <header className="top-navbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{getPageTitle()}</h1>
      </div>
      
      <div style={navbarRightStyle}>
        <div style={userBadgeStyle}>
          <span style={roleBadgeStyle(user.role)}>{user.role}</span>
          <div style={profileInfoStyle}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>
          <div className="profile-initials">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

const navbarRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const userBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.875rem',
  padding: '0.375rem 0.75rem',
  borderRadius: '9999px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'right',
  lineHeight: '1.2',
};

const roleBadgeStyle = (role) => {
  let color = '#6366f1';
  let bg = 'rgba(99, 102, 241, 0.1)';
  
  if (role === 'ADMIN') {
    color = '#f59e0b';
    bg = 'rgba(245, 158, 11, 0.1)';
  } else if (role === 'SALES') {
    color = '#10b981';
    bg = 'rgba(16, 185, 129, 0.1)';
  } else if (role === 'WAREHOUSE') {
    color = '#3b82f6';
    bg = 'rgba(59, 130, 246, 0.1)';
  } else if (role === 'ACCOUNTS') {
    color = '#ec4899';
    bg = 'rgba(236, 72, 153, 0.1)';
  }

  return {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '700',
    color,
    backgroundColor: bg,
    letterSpacing: '0.05em',
  };
};

export default Navbar;
