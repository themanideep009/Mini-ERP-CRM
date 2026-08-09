import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Stock Adjustment Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN'); // IN or OUT
  const [qtyInput, setQtyInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const fetchProductAndLogs = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get(`/products/${id}`);
      if (prodRes.data && prodRes.data.success) {
        setProduct(prodRes.data.data);
      }

      const moveRes = await api.get(`/products/${id}/stock-movements`);
      if (moveRes.data && moveRes.data.success) {
        setMovements(moveRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch product profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndLogs();
  }, [id]);

  const handleOpenAdjust = (type) => {
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
        productId: id,
        quantityChanged: movementType === 'IN' ? qty : -qty,
        movementType,
        reason: reasonInput,
      };

      const res = await api.post('/stock-movements', payload);
      if (res.data && res.data.success) {
        setModalOpen(false);
        // Refresh details
        fetchProductAndLogs();
      }
    } catch (err) {
      console.error('Stock adjustment failed:', err);
      setAdjustError(err.response?.data?.message || 'Stock transaction failed');
    } finally {
      setAdjustLoading(false);
    }
  };

  const canModify = ['ADMIN', 'WAREHOUSE'].includes(user?.role);
  const canViewLogs = ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'].includes(user?.role);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--danger-color)' }}>
        <p style={{ fontSize: '2.5rem' }}>🏷️</p>
        <h3 style={{ color: 'var(--danger-color)' }}>Product SKU Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>{error}</p>
        <Link to="/products" className="btn btn-secondary">◀ Back to Catalog</Link>
      </div>
    );
  }

  const isLowStock = product.currentStock <= product.minimumStock;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* 1. Header Navigation */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <Link to="/products" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            ◀ Back to Catalogue
          </Link>
          <h2 style={{ margin: '0.25rem 0 0 0' }}>{product.productName}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canModify && (
            <>
              <button onClick={() => handleOpenAdjust('IN')} className="btn btn-secondary" style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>
                📥 Restock (IN)
              </button>
              <button onClick={() => handleOpenAdjust('OUT')} className="btn btn-secondary" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                📤 Write-off (OUT)
              </button>
              <Link to={`/products/${product.id}/edit`} className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
                ✏️ Edit SKU
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 2. Core Profile details */}
      <div className="grid-cols-3" style={{ alignItems: 'start', marginBottom: '1.5rem' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            📋 SKU Catalog Details
          </h3>
          <div style={detailsGridStyle}>
            <div>
              <span style={labelStyle}>Product Name</span>
              <p style={valueStyle}>{product.productName}</p>
            </div>
            <div>
              <span style={labelStyle}>SKU Code</span>
              <p style={valueStyle}><code style={{ color: 'var(--primary-color)' }}>{product.sku}</code></p>
            </div>
            <div>
              <span style={labelStyle}>Product Category</span>
              <p style={valueStyle}>{product.category}</p>
            </div>
            <div>
              <span style={labelStyle}>Base Unit Price</span>
              <p style={valueStyle}>₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span style={labelStyle}>Minimum Alert Quantity</span>
              <p style={valueStyle}>{product.minimumStock} units</p>
            </div>
            <div>
              <span style={labelStyle}>Warehouse Shelf Location</span>
              <p style={valueStyle}>{product.warehouseLocation}</p>
            </div>
          </div>
        </div>

        {/* Stock Level Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '190px', borderLeftWidth: '5px', borderLeftColor: isLowStock ? 'var(--danger-color)' : 'var(--secondary-color)' }}>
          <span style={labelStyle}>Stock Level Status</span>
          <div style={{ fontSize: '3rem', fontWeight: '800', margin: '0.25rem 0', color: isLowStock ? 'var(--danger-color)' : 'var(--secondary-color)' }}>
            {product.currentStock}
          </div>
          <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
            {isLowStock ? '⚠️ Low Stock Alert' : '🟢 Healthy Inventory'}
          </span>
        </div>
      </div>

      {/* 3. Chronological Stock Movement Logs */}
      {canViewLogs && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            📅 Historical Stock Movements Log
          </h3>
          {movements.length === 0 ? (
            <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No stock movements recorded for this item.
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Quantity Changed</th>
                    <th>Movement Type</th>
                    <th>Reason / Voucher</th>
                    <th>Logged By User</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((move) => {
                    const isIncrease = move.quantityChanged > 0;
                    return (
                      <tr key={move.id}>
                        <td style={{ fontWeight: '700', color: isIncrease ? 'var(--secondary-color)' : 'var(--danger-color)' }}>
                          {isIncrease ? '+' : ''}{move.quantityChanged} units
                        </td>
                        <td>
                          <span className={`badge ${move.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                            {move.movementType}
                          </span>
                        </td>
                        <td>{move.reason}</td>
                        <td><code style={{ fontSize: '0.75rem' }}>{move.createdBy}</code></td>
                        <td>{new Date(move.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Stock Adjustment Modal */}
      {modalOpen && (
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
                
                <div style={{ display: 'flex', justify: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <span>Current Available Stock:</span>
                  <strong>{product.currentStock} units</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to {movementType === 'IN' ? 'Add' : 'Deduct'}</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 50"
                    min="1"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    required
                    disabled={adjustLoading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Reason / Reference Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={movementType === 'IN' ? 'e.g. Purchase Invoice #PI-1123' : 'e.g. Broken/Damaged stock discard'}
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

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1.25rem 1.5rem',
};

const labelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '700',
  textTransform: 'uppercase',
};

const valueStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginTop: '0.125rem',
};

export default ProductDetail;
