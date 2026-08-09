import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
        status,
        customerType: type,
      };
      
      const res = await api.get('/customers', { params });
      if (res.data && res.data.success) {
        setCustomers(res.data.data.customers);
        setMeta(res.data.data.meta);
      } else {
        setError('Failed to fetch customers list');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300); // Debounce query searches

    return () => clearTimeout(timer);
  }, [search, status, type, page]);

  const canModify = ['ADMIN', 'SALES'].includes(user?.role);

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/customers/${deleteId}`);
      if (res.data && res.data.success) {
        setDeleteId(null);
        // Refresh list
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (statusVal) => {
    if (statusVal === 'ACTIVE') return 'badge-success';
    if (statusVal === 'LEAD') return 'badge-info';
    return 'badge-danger';
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* 1. Header controls */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Active Customer Registry</h2>
          <p style={{ fontSize: '0.85rem' }}>Total registered customers: {meta.totalItems}</p>
        </div>
        {canModify && (
          <Link to="/customers/create" className="btn btn-primary">
            ➕ Add Customer
          </Link>
        )}
      </div>

      {/* 2. Filters & Searches toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={filterToolbarStyle}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search name, business, email or mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset page to 1
              }}
            />
          </div>
          
          <div style={selectFilterWrapper}>
            <select
              className="form-input"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              style={{ paddingRight: '1.5rem' }}
            >
              <option value="">All Customer Types</option>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>

          <div style={selectFilterWrapper}>
            <select
              className="form-input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Customer Data Table */}
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
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '2.5rem' }}>👥</p>
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-secondary)' }}>No Customers Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>GST Number</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`} style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {c.customerName}
                      </Link>
                    </td>
                    <td>{c.businessName}</td>
                    <td>{c.mobile}</td>
                    <td>{c.email}</td>
                    <td><code style={{ fontSize: '0.75rem' }}>{c.gstNumber}</code></td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c.customerType}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/customers/${c.id}`} style={actionLinkStyle}>
                          👁️ View
                        </Link>
                        {canModify && (
                          <>
                            <Link to={`/customers/${c.id}/edit`} style={actionLinkEditStyle}>
                              ✏️ Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(c.id, c.customerName)}
                              style={actionBtnDeleteStyle}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {!loading && customers.length > 0 && (
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

      {/* 5. Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Confirm Delete CRM Record</h3>
              <button onClick={() => setDeleteId(null)} style={{ border: 0, background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the customer <strong>{deleteName}</strong>?</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                ⚠️ This action is irreversible. Customer record will be removed from customer tables.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const filterToolbarStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  alignItems: 'center',
};

const selectFilterWrapper = {
  minWidth: '180px',
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

const actionLinkEditStyle = {
  ...actionLinkStyle,
  color: 'var(--warning-color)',
};

const actionBtnDeleteStyle = {
  ...actionLinkStyle,
  color: 'var(--danger-color)',
  background: 'none',
};

export default Customers;
