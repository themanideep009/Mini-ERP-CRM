import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoginLoading(true);

    const res = await login(email, password);
    setLoginLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={logoStyle}>📦</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.5rem 0 0.25rem 0' }}>MINI ERP + CRM</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Operations & Database Portal</p>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g. sales@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loginLoading}
          >
            {loginLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={demoPanelStyle}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '0.05em' }}>
            DEMO ACCOUNT QUICK LOGIN
          </p>
          <div style={demoGridStyle}>
            <button type="button" onClick={() => quickFill('admin@example.com')} style={demoBtnStyle('ADMIN')}>
              👑 Admin
            </button>
            <button type="button" onClick={() => quickFill('sales@example.com')} style={demoBtnStyle('SALES')}>
              💼 Sales
            </button>
            <button type="button" onClick={() => quickFill('warehouse@example.com')} style={demoBtnStyle('WAREHOUSE')}>
              🏭 Warehouse
            </button>
            <button type="button" onClick={() => quickFill('accounts@example.com')} style={demoBtnStyle('ACCOUNTS')}>
              💳 Accounts
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            All shares common password: <code style={{ color: 'var(--primary-color)' }}>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styling variables
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: 'var(--bg-primary)',
  padding: '1rem',
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg)',
  padding: '2rem 1.75rem',
  boxShadow: 'var(--shadow-lg)',
  animation: 'fadeIn 0.4s ease-out',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
};

const logoStyle = {
  fontSize: '2.5rem',
};

const errorBannerStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: 'var(--danger-color)',
  padding: '0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.85rem',
  marginBottom: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const demoPanelStyle = {
  marginTop: '1.75rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid var(--border-color)',
};

const demoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.5rem',
};

const demoBtnStyle = (role) => {
  let borderColor = 'var(--border-color)';
  let hoverBg = 'rgba(255, 255, 255, 0.05)';
  
  if (role === 'ADMIN') borderColor = 'rgba(245, 158, 11, 0.4)';
  if (role === 'SALES') borderColor = 'rgba(16, 185, 129, 0.4)';
  if (role === 'WAREHOUSE') borderColor = 'rgba(59, 130, 246, 0.4)';
  if (role === 'ACCOUNTS') borderColor = 'rgba(236, 72, 153, 0.4)';

  return {
    backgroundColor: 'var(--bg-tertiary)',
    border: `1px solid ${borderColor}`,
    color: 'var(--text-primary)',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
};

export default Login;
