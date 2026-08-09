import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Deletion Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
        category,
      };

      const res = await api.get('/products', { params });
      if (res.data && res.data.success) {
        setProducts(res.data.data.products);
        setMeta(res.data.data.meta);
      } else {
        setError('Failed to fetch product catalog');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, page]);

  const canModify = ['ADMIN', 'WAREHOUSE'].includes(user?.role);

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/products/${deleteId}`);
      if (res.data && res.data.success) {
        setDeleteId(null);
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product from database');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* 1. Header with Title */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Warehouse Product Catalogue</h2>
          <p style={{ fontSize: '0.85rem' }}>Total unique SKUs registered: {meta.totalItems}</p>
        </div>
        {canModify && (
          <Link to="/products/create" className="btn btn-primary">
            ➕ Add Product SKU
          </Link>
        )}
      </div>

      {/* 2. Search & Category Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={filterToolbarStyle}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search product name or SKU code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Electricals">Electricals</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Apparel">Apparel</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Products Table */}
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
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '2.5rem' }}>🏷️</p>
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-secondary)' }}>No Products Seeded</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try refining search terms or add a new product.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Min Alert Qty</th>
                  <th>Warehouse Shelf</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLowStock = p.currentStock <= p.minimumStock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/products/${p.id}`} style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          {p.productName}
                        </Link>
                      </td>
                      <td><code style={{ fontSize: '0.8rem', fontWeight: '700' }}>{p.sku}</code></td>
                      <td>{p.category}</td>
                      <td>₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <strong style={isLowStock ? { color: 'var(--danger-color)' } : {}}>{p.currentStock}</strong>
                          {isLowStock && (
                            <span className="badge badge-danger" style={{ fontSize: '0.55rem', padding: '0.125rem 0.375rem' }}>
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{p.minimumStock}</td>
                      <td>{p.warehouseLocation}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/products/${p.id}`} style={actionLinkStyle}>
                            👁️ View Log
                          </Link>
                          {canModify && (
                            <>
                              <Link to={`/products/${p.id}/edit`} style={actionLinkEditStyle}>
                                ✏️ Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(p.id, p.productName)}
                                style={actionBtnDeleteStyle}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {!loading && products.length > 0 && (
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
              <h3 style={{ margin: 0 }}>Confirm Delete Catalogue SKU</h3>
              <button onClick={() => setDeleteId(null)} style={{ border: 0, background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete product <strong>{deleteName}</strong>?</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                ⚠️ WARNING: You cannot delete a product that has been confirmed in any historical sales challan.
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

export default Products;
