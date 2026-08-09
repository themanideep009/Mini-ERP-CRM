import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        status,
      };

      const res = await api.get('/challans', { params });
      if (res.data && res.data.success) {
        setChallans(res.data.data.challans);
        setMeta(res.data.data.meta);
      } else {
        setError('Failed to fetch sales challans registry');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [status, page]);

  const canModify = ['ADMIN', 'SALES'].includes(user?.role);

  const getStatusBadgeClass = (s) => {
    if (s === 'CONFIRMED') return 'badge-success';
    if (s === 'DRAFT') return 'badge-info';
    return 'badge-danger';
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header section */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Sales Challans Registry</h2>
          <p style={{ fontSize: '0.85rem' }}>View, draft, and issue dispatch vouchers. Total entries: {meta.totalItems}</p>
        </div>
        {canModify && (
          <Link to="/challans/create" className="btn btn-primary">
            ➕ Create Sales Challan
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={toolbarStyle}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Filter By Status:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setStatus(''); setPage(1); }}
              className={`btn ${status === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={tabButtonStyle}
            >
              All Challans
            </button>
            <button
              onClick={() => { setStatus('DRAFT'); setPage(1); }}
              className={`btn ${status === 'DRAFT' ? 'btn-primary' : 'btn-secondary'}`}
              style={tabButtonStyle}
            >
              Drafts
            </button>
            <button
              onClick={() => { setStatus('CONFIRMED'); setPage(1); }}
              className={`btn ${status === 'CONFIRMED' ? 'btn-primary' : 'btn-secondary'}`}
              style={tabButtonStyle}
            >
              Confirmed
            </button>
            <button
              onClick={() => { setStatus('CANCELLED'); setPage(1); }}
              className={`btn ${status === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
              style={tabButtonStyle}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Challans Table */}
      {error && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : challans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '2.5rem' }}>📜</p>
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-secondary)' }}>No Challans Registered</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No vouchers match this criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan No.</th>
                  <th>Customer / Business</th>
                  <th>Total Ordered Qty</th>
                  <th>Status</th>
                  <th>Created By Officer</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/challans/${c.id}`} style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                        {c.challanNumber}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{c.customer.customerName}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {c.customer.businessName}
                      </span>
                    </td>
                    <td>{c.totalQuantity} items</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                    </td>
                    <td>{c.creator.name}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/challans/${c.id}`} style={actionLinkStyle}>
                        👁️ View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination control */}
      {!loading && challans.length > 0 && (
        <div className="pagination">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing Page <strong>{meta.currentPage}</strong> of <strong>{meta.totalPages}</strong>
          </span>
          <div className="pagination-buttons">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={meta.currentPage === 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              ◀ Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={meta.currentPage === meta.totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const toolbarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
};

const tabButtonStyle = {
  padding: '0.4rem 0.8rem',
  fontSize: '0.8rem',
};

const actionLinkStyle = {
  fontSize: '0.75rem',
  padding: '0.3rem 0.6rem',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
};

export default Challans;
