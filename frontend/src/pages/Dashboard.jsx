import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data && res.data.success) {
          setStats(res.data.data);
        } else {
          setError('Failed to load dashboard statistics.');
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Could not connect to the backend server. Make sure the backend server and database are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={spinnerContainerStyle}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Compiling operational statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--danger-color)' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</p>
        <h3 style={{ color: 'var(--danger-color)', marginBottom: '0.5rem' }}>Connection/Database Offline</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          {error}
        </p>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', display: 'inline-block', textAlign: 'left', fontSize: '0.85rem' }}>
          <p style={{ fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Quick Start Instructions:</p>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            <li>Open Docker Desktop (to spin up the PostgreSQL database).</li>
            <li>Run <code style={{ color: 'var(--primary-color)' }}>npm run dev</code> inside backend and frontend directories (or use <code style={{ color: 'var(--primary-color)' }}>docker-compose up --build</code>).</li>
            <li>Run database seed command if required.</li>
          </ol>
        </div>
      </div>
    );
  }

  const { summary, lowStockProducts, customerStatusDistribution, recentChallans, recentStockMovements, salesTrend, topProducts } = stats;

  // Find max sales trend amount to scale CSS chart bars
  const maxSalesAmount = salesTrend.reduce((max, t) => (t.amount > max ? t.amount : max), 0) || 1000;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* 1. Statistics Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title">Total Customers</div>
          <div className="card-value">{summary.totalCustomers}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: '600' }}>Active CRM leads</span>
        </div>
        <div className="card">
          <div className="card-title">Total Product Line</div>
          <div className="card-value">{summary.totalProducts}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique catalog SKUs</span>
        </div>
        <div className="card">
          <div className="card-title">Current Warehouse Stock</div>
          <div className="card-value">{summary.totalStock}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total units in shell</span>
        </div>
        <div className={`card ${summary.lowStockAlerts > 0 ? 'pulse-border' : ''}`} style={summary.lowStockAlerts > 0 ? { borderColor: 'rgba(239, 68, 68, 0.4)' } : {}}>
          <div className="card-title" style={summary.lowStockAlerts > 0 ? { color: 'var(--danger-color)' } : {}}>Low Stock Products</div>
          <div className="card-value" style={summary.lowStockAlerts > 0 ? { color: 'var(--danger-color)' } : {}}>{summary.lowStockAlerts}</div>
          <span style={{ fontSize: '0.75rem', color: summary.lowStockAlerts > 0 ? 'var(--danger-color)' : 'var(--text-muted)', fontWeight: '600' }}>
            {summary.lowStockAlerts > 0 ? '⚠️ Stock level below minimum' : 'All items restocked'}
          </span>
        </div>
      </div>

      {/* 2. Challan Stats Summary Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 1.5rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📜</span>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Total Sales Challans</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{summary.totalChallans}</p>
          </div>
        </div>
        <div style={dividerStyle}></div>
        <div>
          <span className="badge badge-success" style={{ marginRight: '0.5rem' }}>Confirmed</span>
          <strong style={{ fontSize: '1rem' }}>{summary.confirmedChallans}</strong>
        </div>
        <div style={dividerStyle}></div>
        <div>
          <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>Draft</span>
          <strong style={{ fontSize: '1rem' }}>{summary.draftChallans}</strong>
        </div>
        <div style={dividerStyle}></div>
        <div>
          <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>Cancelled</span>
          <strong style={{ fontSize: '1rem' }}>{summary.cancelledChallans}</strong>
        </div>
      </div>

      {/* 3. Dashboard Primary Analytics Grid */}
      <div className="dashboard-grid">
        {/* Left Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* A. Monthly Sales Trend Chart (Pure CSS Bar Chart) */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              📈 Sales Challan Monthly Trend (Confirmed Revenue)
            </h2>
            <div style={chartContainerStyle}>
              <div style={yAxisStyle}>
                <span>₹{Math.round(maxSalesAmount)}</span>
                <span>₹{Math.round(maxSalesAmount / 2)}</span>
                <span>₹0</span>
              </div>
              <div style={chartAreaStyle}>
                {salesTrend.map((t, idx) => {
                  const pctHeight = (t.amount / maxSalesAmount) * 80 + 5; // Min 5% height to be visible
                  return (
                    <div key={idx} style={chartColumnStyle}>
                      <div style={chartBarWrapperStyle}>
                        <div style={chartBarLabelStyle}>₹{t.amount.toLocaleString()}</div>
                        <div style={chartBarFillStyle(pctHeight)}></div>
                      </div>
                      <div style={chartXAxisLabelStyle}>{t.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* B. Recent Challans */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              📝 Recent Sales Challans
            </h2>
            {recentChallans.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No challans created yet.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Challan No.</th>
                      <th>Customer</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentChallans.map((challan) => (
                      <tr key={challan.id}>
                        <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{challan.challanNumber}</td>
                        <td>{challan.customer.businessName}</td>
                        <td>{challan.totalQuantity} items</td>
                        <td>
                          <span className={`badge ${challan.status === 'CONFIRMED' ? 'badge-success' : challan.status === 'DRAFT' ? 'badge-info' : 'badge-danger'}`}>
                            {challan.status}
                          </span>
                        </td>
                        <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* C. Customer Distribution by Status */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              👥 Customer CRM Segments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {customerStatusDistribution.map((item) => {
                const total = summary.totalCustomers || 1;
                const percentage = Math.round((item.count / total) * 100);
                return (
                  <div key={item.status}>
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600' }}>{item.status}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({percentage}%)</span>
                    </div>
                    <div style={progressContainerStyle}>
                      <div style={progressFillStyle(percentage, item.status)}></div>
                    </div>
                  </div>
                );
              })}
              {customerStatusDistribution.length === 0 && (
                <p style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No customer data seeded.</p>
              )}
            </div>
          </div>

          {/* D. Top Selling Products */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              🏆 Top Selling Products
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.map((p, idx) => (
                <div key={p.productId} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={{ fontWeight: '800', color: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : 'var(--text-muted)', width: '20px' }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{p.productName}</p>
                      <code style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.sku}</code>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary-color)' }}>{p.quantity} sold</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>₹{p.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders confirmed yet.</p>
              )}
            </div>
          </div>

          {/* E. Recent Stock Movements */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              🏭 Stock Movements Log
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentStockMovements.map((move) => (
                <div key={move.id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '0.375rem 0', borderBottom: '1px dotted var(--border-color)' }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{move.product.productName}</span>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{move.reason}</p>
                  </div>
                  <span className={`badge ${move.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`} style={{ flexShrink: 0 }}>
                    {move.movementType === 'IN' ? '+' : ''}{move.quantityChanged}
                  </span>
                </div>
              ))}
              {recentStockMovements.length === 0 && (
                <p style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)' }}>No inventory stock movements recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS style rules
const spinnerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6rem 0',
  width: '100%',
};

const dividerStyle = {
  width: '1px',
  height: '24px',
  backgroundColor: 'var(--border-color)',
};

const chartContainerStyle = {
  display: 'flex',
  height: '200px',
  width: '100%',
  padding: '0.5rem 0',
};

const yAxisStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '80%',
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  width: '60px',
  textAlign: 'right',
  paddingRight: '0.5rem',
  borderRight: '1px solid var(--border-color)',
};

const chartAreaStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  flexGrow: 1,
  height: '100%',
  paddingLeft: '0.5rem',
};

const chartColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '14%',
  height: '100%',
};

const chartBarWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  height: '80%',
  width: '60%',
  position: 'relative',
  cursor: 'pointer',
};

const chartBarLabelStyle = {
  position: 'absolute',
  top: '-15px',
  fontSize: '0.55rem',
  color: 'var(--text-secondary)',
  fontWeight: '700',
  width: '100%',
  textAlign: 'center',
};

const chartBarFillStyle = (height) => ({
  height: `${height}%`,
  width: '100%',
  backgroundColor: 'var(--primary-color)',
  borderRadius: '4px 4px 0 0',
  backgroundImage: 'linear-gradient(to top, var(--primary-hover), var(--primary-color))',
  boxShadow: 'var(--shadow-sm)',
  transition: 'height var(--transition-normal)',
});

const chartXAxisLabelStyle = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  marginTop: '0.5rem',
};

const progressContainerStyle = {
  width: '100%',
  height: '6px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const progressFillStyle = (pct, status) => {
  let bgColor = 'var(--primary-color)';
  if (status === 'ACTIVE') bgColor = 'var(--secondary-color)';
  if (status === 'INACTIVE') bgColor = 'var(--danger-color)';

  return {
    width: `${pct}%`,
    height: '100%',
    backgroundColor: bgColor,
    borderRadius: '3px',
  };
};

export default Dashboard;
