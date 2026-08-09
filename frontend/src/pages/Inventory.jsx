import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  // Stock Adjustment Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [qtyInput, setQtyInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
      };

      const res = await api.get('/products', { params });
      if (res.data && res.data.success) {
        setProducts(res.data.data.products);
        setMeta(res.data.data.meta);
      } else {
        setError('Failed to fetch warehouse stock levels');
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
      fetchInventory();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, page]);

  const handleOpenAdjust = (prod, type) => {
    setSelectedProduct(prod);
    setMovementType(type);
    setQtyInput('');
    setReasonInput('');
    setAdjustError('');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');
    const qty = parseInt(qtyInput);

    if (isNaN(qty) || qty <= 0) {
      setAdjustError('Please enter a valid positive quantity');
      return;
    }
    if (!reasonInput) {
      setAdjustError('Reason for stock adjustment is required');
      return;
    }

    setAdjustLoading(true);
    try {
      const payload = {
        productId: selectedProduct.id,
        quantityChanged: movementType === 'IN' ? qty : -qty,
        movementType,
        reason: reasonInput,
      };

      const res = await api.post('/stock-movements', payload);
      if (res.data && res.data.success) {
        setModalOpen(false);
        // Refresh grid
        fetchInventory();
      }
    } catch (err) {
      console.error('Stock adjust submit error:', err);
      setAdjustError(err.response?.data?.message || 'Stock transaction failed');
    } finally {
      setAdjustLoading(false);
    }
  };

  const canModify = ['ADMIN', 'WAREHOUSE'].includes(user?.role);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header section */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Warehouse Stock Balances</h2>
          <p style={{ fontSize: '0.85rem' }}>Track, audit, and log inventory entries. Current items catalogued: {meta.totalItems}</p>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search SKU code or product description to restock..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Inventory table */}
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
            <p style={{ fontSize: '2.5rem' }}>🏭</p>
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-secondary)' }}>No Inventory Balances Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Modify query parameters or add new SKUs in products.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Product Name</th>
                  <th>Warehouse Location</th>
                  <th>Current Stock</th>
                  <th>Min Alert Qty</th>
                  <th>Status</th>
                  <th>Stock Operations</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLowStock = p.currentStock <= p.minimumStock;
                  return (
                    <tr key={p.id}>
                      <td><code style={{ fontSize: '0.8rem', fontWeight: '700' }}>{p.sku}</code></td>
                      <td>
                        <Link to={`/products/${p.id}`} style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          {p.productName}
                        </Link>
                      </td>
                      <td>{p.warehouseLocation}</td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: isLowStock ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                          {p.currentStock}
                        </strong>
                      </td>
                      <td>{p.minimumStock} units</td>
                      <td>
                        <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                          {isLowStock ? '⚠️ Low Stock' : '🟢 Healthy'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <Link to={`/products/${p.id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                            👁️ View Ledger
                          </Link>
                          {canModify && (
                            <>
                              <button
                                onClick={() => handleOpenAdjust(p, 'IN')}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}
                              >
                                📥 IN
                              </button>
                              <button
                                onClick={() => handleOpenAdjust(p, 'OUT')}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                              >
                                📤 OUT
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

      {/* Pagination control */}
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

      {/* 4. Stock Adjustment Modal */}
      {modalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                {movementType === 'IN' ? '📥 Restock Warehouse Inventory' : '📤 Write-off / Deduct Inventory'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ border: 0, background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body">
                {adjustError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {adjustError}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)', fontSize: '0.85rem', gap: '0.25rem' }}>
                  <div className="flex-between">
                    <span>Product Name:</span>
                    <strong>{selectedProduct.productName}</strong>
                  </div>
                  <div className="flex-between">
                    <span>SKU Code:</span>
                    <code>{selectedProduct.sku}</code>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                    <span>Current Stock Balance:</span>
                    <strong>{selectedProduct.currentStock} units</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to {movementType === 'IN' ? 'Add' : 'Deduct'}</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 100"
                    min="1"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    required
                    disabled={adjustLoading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Audit Reason / reference Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={movementType === 'IN' ? 'e.g. Stock shipment arrival SKU-99' : 'e.g. Order dispatch discrepancy'}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    required
                    disabled={adjustLoading}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={adjustLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${movementType === 'IN' ? 'btn-primary' : 'btn-danger'}`}
                  disabled={adjustLoading}
                >
                  {adjustLoading ? 'Recording Transaction...' : 'Post Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
