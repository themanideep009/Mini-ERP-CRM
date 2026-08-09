import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

type Mode = 'login' | 'register';
type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

const DEMO_ACCOUNTS = [
  { role: 'ADMIN' as Role,     email: 'admin@example.com',     name: 'System Admin',        color: '#6366f1' },
  { role: 'SALES' as Role,     email: 'sales@example.com',     name: 'Sales Executive',     color: '#06b6d4' },
  { role: 'WAREHOUSE' as Role, email: 'warehouse@example.com', name: 'Warehouse Ops',       color: '#10b981' },
  { role: 'ACCOUNTS' as Role,  email: 'accounts@example.com',  name: 'Accounts Officer',    color: '#f59e0b' },
];

const GOOGLE_PRESET_ACCOUNTS = [
  { name: 'Arjun Mehta',        email: 'arjun.mehta@gmail.com',        avatar: 'A', role: 'ADMIN' as Role,     desc: 'Google Workspace Admin' },
  { name: 'Sneha Kapoor',       email: 'sneha.kapoor@gmail.com',       avatar: 'S', role: 'SALES' as Role,     desc: 'Google Sales Account' },
  { name: 'Dinesh Rawat',       email: 'dinesh.rawat@gmail.com',       avatar: 'D', role: 'WAREHOUSE' as Role, desc: 'Google Ops Account' },
  { name: 'Kavya Nair',         email: 'kavya.nair@gmail.com',          avatar: 'K', role: 'ACCOUNTS' as Role,  desc: 'Google Finance Account' },
];

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: 'SALES',     label: 'SALES',     desc: 'CRM, Leads & Challans' },
  { value: 'WAREHOUSE', label: 'WAREHOUSE', desc: 'Products & Stock' },
  { value: 'ACCOUNTS',  label: 'ACCOUNTS',  desc: 'Audits & Financials' },
  { value: 'ADMIN',     label: 'ADMIN',     desc: 'Full System Access' },
];

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );

  // Login state
  const [loginEmail, setLoginEmail]       = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register state
  const [regName, setRegName]       = useState('');
  const [regEmail, setRegEmail]     = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole]       = useState<Role>('SALES');
  const [showRegPass, setShowRegPass] = useState(false);

  // Google SSO Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [useCustomGoogle, setUseCustomGoogle] = useState(false);

  const [error,          setError]          = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [googleLoading,  setGoogleLoading]  = useState(false);
  const [toast,          setToast]          = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const clearState = () => { setError(''); };

  // ── GOOGLE AUTH EXECUTION ──────────────────────────────
  const executeGoogleAuth = async (email: string, name: string, role?: Role) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google-login', { email, name, role });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        setShowGoogleModal(false);
        showToast(`Signed in with Google as ${email}`);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }
    executeGoogleAuth(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0], 'ADMIN');
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      await api.post('/auth/register', { name: regName, email: regEmail, password: regPassword, role: regRole });
      const res = await api.post('/auth/login', { email: regEmail, password: regPassword });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setLoginEmail(acc.email);
    setLoginPassword('password123');
    setMode('login');
    setError('');
  };

  return (
    <div className="login-page">
      {/* Grid background */}
      <div className="login-bg-grid" />

      {/* Floating decorative blobs */}
      <div style={{ position:'absolute', top:'10%', left:'5%', width:320, height:320,
        background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents:'none', borderRadius:'50%', filter:'blur(40px)' }} />
      <div style={{ position:'absolute', bottom:'15%', right:'8%', width:240, height:240,
        background:'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        pointerEvents:'none', borderRadius:'50%', filter:'blur(40px)' }} />

      <div className="login-card">
        <div className="p-8">
          {/* Logo & Brand */}
          <div className="text-center mb-6">
            {/* Stocks-style SVG Logo */}
            <div style={{ margin: '0 auto 0.875rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 68, height: 68,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
              }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="30" x2="40" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <line x1="0" y1="10" x2="40" y2="10" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

                  <line x1="7" y1="26" x2="7" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="4.5" y="22" width="5" height="4" rx="1" fill="#ef4444"/>
                  <line x1="7" y1="18" x2="7" y2="22" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>

                  <line x1="16" y1="28" x2="16" y2="32" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="13.5" y="18" width="5" height="10" rx="1" fill="#10b981"/>
                  <line x1="16" y1="13" x2="16" y2="18" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>

                  <line x1="25" y1="25" x2="25" y2="30" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="22.5" y="14" width="5" height="11" rx="1" fill="#10b981"/>
                  <line x1="25" y1="10" x2="25" y2="14" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>

                  <line x1="34" y1="22" x2="34" y2="28" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="31.5" y="18" width="5" height="4" rx="1" fill="#ef4444"/>
                  <line x1="34" y1="12" x2="34" y2="18" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>

                  <path d="M4 31 L14 24 L22 17 L32 10" stroke="url(#trendGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="4"  cy="31" r="2" fill="#6366f1"/>
                  <circle cx="32" cy="10" r="2.5" fill="#06b6d4"/>

                  <defs>
                    <linearGradient id="trendGrad" x1="4" y1="31" x2="32" y2="10" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <h1 style={{ fontSize:'1.4rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--text-primary)', marginBottom:'0.2rem' }}>
              Mini ERP + CRM
            </h1>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Wholesale Operations Portal</p>
          </div>

          {/* Tab Switcher */}
          <div className="login-tabs mb-6">
            <button
              type="button"
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); clearState(); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); clearState(); }}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert mb-4" style={{ animation: 'slideUp 0.2s ease' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ─── SIGN IN FORM ─── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-slideUp">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    className="form-control"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ paddingRight:'2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(s => !s)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', lineHeight:1, display:'flex', alignItems:'center' }}
                    aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ padding:'0.75rem', fontSize:'0.9rem', marginTop:'0.25rem' }}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="spinner spinner-xs" style={{ borderTopColor:'white' }} /> Authenticating...</>
                ) : (
                  '→ Sign In to Portal'
                )}
              </button>

              {/* OR Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'0.25rem 0' }}>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
                <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:500, letterSpacing:'0.05em' }}>OR</span>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={googleLoading}
                style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.65rem',
                  padding:'0.7rem 1.25rem',
                  background:'#ffffff',
                  border:'1px solid #dadce0',
                  borderRadius:6,
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  fontFamily:'Google Sans, Roboto, Inter, sans-serif',
                  fontSize:'0.875rem',
                  fontWeight:500,
                  color:'#3c4043',
                  letterSpacing:'0.01em',
                  transition:'all 0.2s ease',
                  opacity: googleLoading ? 0.8 : 1,
                  boxShadow:'0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={e => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow='0 2px 8px rgba(0,0,0,0.18)'; (e.currentTarget as HTMLButtonElement).style.background='#f8f9fa'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 1px 3px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLButtonElement).style.background='#ffffff'; }}
              >
                {googleLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation:'spin 0.8s linear infinite' }}>
                      <circle cx="9" cy="9" r="7" fill="none" stroke="#4285F4" strokeWidth="2" strokeDasharray="22" strokeDashoffset="8" strokeLinecap="round"/>
                    </svg>
                    <span>Authenticating Google account...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google G Logo */}
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── REGISTER FORM ─── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-slideUp">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Rahul Verma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="rahul@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    className="form-control"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                    style={{ paddingRight:'2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(s => !s)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', lineHeight:1, display:'flex', alignItems:'center' }}
                    aria-label={showRegPass ? 'Hide password' : 'Show password'}
                  >
                    {showRegPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Employee Role Persona</label>
                <div className="grid grid-cols-2 gap-2" style={{ marginTop:'0.2rem' }}>
                  {ROLE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRegRole(opt.value)}
                      style={{
                        padding:'0.6rem 0.75rem',
                        borderRadius:'var(--radius-md)',
                        border: regRole === opt.value ? '1px solid var(--primary)' : '1px solid var(--border-base)',
                        background: regRole === opt.value ? 'var(--primary-light)' : 'var(--bg-input)',
                        cursor:'pointer',
                        textAlign:'left',
                        transition:'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize:'0.68rem', fontWeight:800, color: regRole === opt.value ? '#a5b4fc' : 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'1px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ padding:'0.75rem', fontSize:'0.9rem', marginTop:'0.25rem' }}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="spinner spinner-xs" style={{ borderTopColor:'white' }} /> Creating Account...</>
                ) : (
                  '✦ Create Account & Sign In'
                )}
              </button>

              {/* OR Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'0.25rem 0' }}>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
                <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:500, letterSpacing:'0.05em' }}>OR</span>
                <div style={{ flex:1, height:1, background:'var(--border-subtle)' }} />
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={googleLoading}
                style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.65rem',
                  padding:'0.7rem 1.25rem',
                  background:'#ffffff',
                  border:'1px solid #dadce0',
                  borderRadius:6,
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  fontFamily:'Google Sans, Roboto, Inter, sans-serif',
                  fontSize:'0.875rem',
                  fontWeight:500,
                  color:'#3c4043',
                  letterSpacing:'0.01em',
                  transition:'all 0.2s ease',
                  opacity: googleLoading ? 0.8 : 1,
                  boxShadow:'0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={e => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow='0 2px 8px rgba(0,0,0,0.18)'; (e.currentTarget as HTMLButtonElement).style.background='#f8f9fa'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 1px 3px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLButtonElement).style.background='#ffffff'; }}
              >
                {googleLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation:'spin 0.8s linear infinite' }}>
                      <circle cx="9" cy="9" r="7" fill="none" stroke="#4285F4" strokeWidth="2" strokeDasharray="22" strokeDashoffset="8" strokeLinecap="round"/>
                    </svg>
                    <span>Authenticating Google account...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toast Notification */}
          {toast && (
            <div style={{
              position:'fixed', bottom:'2rem', left:'50%', transform:'translateX(-50%)',
              background:'#1e293b', border:'1px solid rgba(99,102,241,0.3)',
              color:'#e2e8f0', padding:'0.75rem 1.25rem', borderRadius:10,
              fontSize:'0.82rem', fontWeight:500, zIndex:999,
              boxShadow:'0 8px 30px rgba(0,0,0,0.4)',
              display:'flex', alignItems:'center', gap:'0.6rem',
              maxWidth:380, textAlign:'center',
              animation:'slideUp 0.25s ease',
            }}>
              <span style={{ fontSize:'1rem' }}>ℹ️</span>
              {toast}
            </div>
          )}

          {/* Choose Account Type */}
          <div style={{ marginTop:'1.75rem', paddingTop:'1.25rem', borderTop:'1px solid var(--border-subtle)' }}>
            <p className="demo-section-label">Choose Account Type</p>
            <div className="demo-grid">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  className={`demo-btn ${loginEmail === acc.email && mode === 'login' ? 'active' : ''}`}
                  onClick={() => fillDemo(acc)}
                >
                  <div
                    className="demo-btn-role"
                    style={{ color: acc.color }}
                  >
                    {acc.role}
                  </div>
                  <div className="demo-btn-name">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── GOOGLE ACCOUNTS POPUP MODAL ── */}
      {showGoogleModal && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slideUp" style={{ maxWidth: 440, background: '#ffffff', color: '#202124', border: '1px solid #dadce0', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', borderRadius: 16 }}>
            {/* Google Header */}
            <div style={{ padding: '1.25rem 1.5rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #f1f3f4' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <svg width="32" height="32" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#202124', margin: 0 }}>Sign in with Google</h3>
              <p style={{ fontSize: '0.85rem', color: '#5f6368', marginTop: 4 }}>Choose a Google account to continue to Mini ERP + CRM</p>
            </div>

            {/* Account List */}
            <div style={{ padding: '0.75rem 1.25rem' }}>
              {!useCustomGoogle ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {GOOGLE_PRESET_ACCOUNTS.map(gAcc => (
                      <button
                        key={gAcc.email}
                        type="button"
                        onClick={() => executeGoogleAuth(gAcc.email, gAcc.name, gAcc.role)}
                        disabled={googleLoading}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem',
                          borderRadius: 10, border: '1px solid #e8eaed', background: '#ffffff',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: '#4285F4', color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                        }}>
                          {gAcc.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#202124' }}>{gAcc.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gAcc.email}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: 12 }}>
                          {gAcc.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f3f4', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setUseCustomGoogle(true)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem',
                        border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, color: '#1a73e8', fontSize: '0.85rem', fontWeight: 600
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ fontSize: '1.1rem' }}>👤</span>
                      <span>Use another Google account</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '0.5rem 0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: 4 }}>
                    Enter any Google or Gmail address:
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#3c4043', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={customGoogleName}
                      onChange={e => setCustomGoogleName(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #dadce0', fontSize: '0.875rem', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#3c4043', marginBottom: 4 }}>Google Email</label>
                    <input
                      type="email"
                      placeholder="user@gmail.com or @company.com"
                      value={customGoogleEmail}
                      onChange={e => setCustomGoogleEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #dadce0', fontSize: '0.875rem', outline: 'none' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setUseCustomGoogle(false)}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: 6, border: '1px solid #dadce0', background: '#fff', color: '#3c4043', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={googleLoading}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: 6, border: 'none', background: '#1a73e8', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {googleLoading ? 'Signing in...' : 'Continue'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.875rem 1.5rem', background: '#f8f9fa', borderTop: '1px solid #f1f3f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <span style={{ fontSize: '0.72rem', color: '#70757a' }}>Secured by Google Identity</span>
              <button
                type="button"
                onClick={() => { setShowGoogleModal(false); setUseCustomGoogle(false); }}
                style={{ background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
