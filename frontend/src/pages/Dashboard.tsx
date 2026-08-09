import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DashboardMetrics } from '../types/index.js';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';
import StatusBadge from '../components/StatusBadge.js';

const fmt = (n: number) => n?.toLocaleString('en-IN') ?? '0';
const currency = (n: number) =>
  '₹' + (n >= 1_00_000
    ? (n / 1_00_000).toFixed(1) + 'L'
    : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : fmt(n));

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
  desc?: string;
  color?: string;
  valueColor?: string;
  trend?: { value: number; label: string };
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, desc, color = 'blue', valueColor }) => (
  <div className={`metric-card metric-card-${color} animate-slideUp`}>
    <div className={`metric-icon-wrap bg-${color}`}>{icon}</div>
    <div className="metric-label">{label}</div>
    <div className="metric-value" style={valueColor ? { color: valueColor } : {}}>{value}</div>
    {desc && <div className="metric-desc">{desc}</div>}
  </div>
);

const DistBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) setMetrics(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  if (!metrics) return null;

  const { summary, lowStockProductsList, recentChallans, recentMovements, customerDistribution } = metrics;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const totalCustomers = (customerDistribution['ACTIVE'] || 0) + (customerDistribution['LEAD'] || 0) + (customerDistribution['INACTIVE'] || 0);

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</div>
          <div className="welcome-sub">
            Logged in as <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{user?.role}</span> &nbsp;·&nbsp; Here's your real-time operations overview
          </div>
        </div>
        <div className="flex gap-2">
          <div className="welcome-time">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} &nbsp;·&nbsp; {now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
            <Link to="/challans/create" className="btn btn-primary btn-sm">✦ New Challan</Link>
          )}
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" title="Refresh">↻</button>
        </div>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard color="blue"   icon="◈" label="Total Customers"    value={summary.totalCustomers}  desc="Registered CRM contacts" />
        <MetricCard color="indigo" icon="⬛" label="Product SKUs"       value={summary.totalProducts}   desc={`Valued at ${currency(summary.totalInventoryValue)}`} />
        <MetricCard color="green"  icon="📦" label="Total Stock Units"  value={fmt(summary.totalStock)} desc="Units available in warehouse" />
        <MetricCard color="red"    icon="⚠" label="Low Stock Alerts"   value={summary.lowStockCount}   desc="Below minimum threshold" valueColor={summary.lowStockCount > 0 ? 'var(--danger)' : 'var(--success)'} />
      </div>

      {/* ── Challan KPIs ── */}
      <div className="kpi-strip">
        {[
          { label: 'Total Challans', value: summary.totalChallans, color: 'var(--text-primary)', icon: '◎' },
          { label: 'CONFIRMED',      value: summary.confirmedChallans, color: 'var(--success)',   icon: '✔' },
          { label: 'DRAFT',          value: summary.draftChallans, color: 'var(--warning)',       icon: '⏳' },
          { label: 'Inventory Value',value: currency(summary.totalInventoryValue), color: '#a5b4fc', icon: '₹' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-cell">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: kpi.color, fontSize: '0.9rem' }}>{kpi.icon}</span>
              <span className="metric-label">{kpi.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main Tables ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Challans */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">◎ Recent Sales Challans</div>
              <div className="card-subtitle">Last 5 dispatch orders</div>
            </div>
            <Link to="/challans" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan No.</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.length === 0 ? (
                  <tr><td colSpan={4} className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No challans yet</td></tr>
                ) : recentChallans.map(ch => (
                  <tr key={ch.id}>
                    <td>
                      <Link to={`/challans/${ch.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                        {ch.challanNumber}
                      </Link>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{ch.customer?.customerName || 'N/A'}</td>
                    <td><StatusBadge status={ch.status} /></td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem' }}>{ch.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: summary.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {summary.lowStockCount > 0 ? '⚠ Low Stock Warnings' : '✔ Stock Health'}
              </div>
              <div className="card-subtitle">
                {summary.lowStockCount > 0 ? `${summary.lowStockCount} products need restocking` : 'All levels are healthy'}
              </div>
            </div>
            <Link to="/products?lowStock=true" className="btn btn-ghost btn-sm">Manage →</Link>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Current</th><th>Min</th></tr>
              </thead>
              <tbody>
                {lowStockProductsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center" style={{ color: 'var(--success)', padding: '2rem' }}>
                      ✔ All products are well-stocked!
                    </td>
                  </tr>
                ) : lowStockProductsList.map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/products/${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.82rem' }}>
                        {p.productName}
                      </Link>
                    </td>
                    <td><code style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{p.sku}</code></td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{p.currentStock}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.minimumStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Stock Log + Customer Distribution ── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Stock Movements */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">⊞ Recent Stock Movements</div>
              <div className="card-subtitle">Latest IN / OUT inventory logs</div>
            </div>
            <Link to="/inventory" className="btn btn-ghost btn-sm">Full Ledger →</Link>
          </div>
          <div style={{ padding: '0.5rem 1.5rem' }}>
            {recentMovements.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.855rem' }}>No stock movements recorded yet</div>
              </div>
            ) : recentMovements.map(m => (
              <div key={m.id} className="movement-item">
                <div className={`movement-badge ${m.movementType === 'IN' ? 'in' : 'out'}`}>
                  {m.movementType === 'IN' ? '+' : '−'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.product?.productName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.reason}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: m.quantityChanged > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {new Date(m.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">◈ Customer Pipeline</div>
              <div className="card-subtitle">{totalCustomers} total contacts</div>
            </div>
          </div>
          <div className="p-6">
            <DistBar label="Active Customers" count={customerDistribution['ACTIVE'] || 0}   total={totalCustomers} color="var(--success)" />
            <DistBar label="Leads (Pipeline)" count={customerDistribution['LEAD'] || 0}     total={totalCustomers} color="var(--warning)" />
            <DistBar label="Inactive"          count={customerDistribution['INACTIVE'] || 0} total={totalCustomers} color="var(--text-muted)" />

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/customers/create" className="btn btn-outline-primary btn-sm w-full">+ Add Customer</Link>
              <Link to="/customers" className="btn btn-ghost btn-sm w-full">View CRM →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
