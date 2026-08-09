import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ChallanDetail = () => {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const { user } = useAuth();

  const fetchChallanDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data && res.data.success) {
        setChallan(res.data.data);
      } else {
        setError('Failed to load sales challan details');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallanDetails();
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to CONFIRM this sales challan? This will check stock levels, deduct inventory, and record stock movements.')) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data && res.data.success) {
        setActionSuccess('Sales challan confirmed successfully! Inventory has been updated.');
        // Refresh details
        fetchChallanDetails();
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setActionError(err.response?.data?.message || 'Failed to confirm challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to CANCEL this confirmed sales challan? This will restore stock levels back to the warehouse inventory.')) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post(`/challans/${id}/cancel`);
      if (res.data && res.data.success) {
        setActionSuccess('Sales challan cancelled successfully! Inventory has been restored.');
        // Refresh details
        fetchChallanDetails();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setActionError(err.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setActionLoading(false);
    }
  };

  const canModify = ['ADMIN', 'SALES'].includes(user?.role);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--danger-color)' }}>
        <p style={{ fontSize: '2.5rem' }}>📜</p>
        <h3 style={{ color: 'var(--danger-color)' }}>Sales Challan Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>{error}</p>
        <Link to="/challans" className="btn btn-secondary">◀ Back to Challans Register</Link>
      </div>
    );
  }

  const grandTotal = challan.items.reduce((sum, item) => sum + item.subtotal, 0);
  const getStatusBadgeClass = (s) => {
    if (s === 'CONFIRMED') return 'badge-success';
    if (s === 'DRAFT') return 'badge-info';
    return 'badge-danger';
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Navigation and title */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <Link to="/challans" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            ◀ Back to Challans Register
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <h2 style={{ margin: 0 }}>Sales Challan {challan.challanNumber}</h2>
            <span className={`badge ${getStatusBadgeClass(challan.status)}`}>{challan.status}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canModify && challan.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }}
              disabled={actionLoading}
            >
              ✔️ Confirm Challan
            </button>
          )}

          {canModify && challan.status === 'CONFIRMED' && (
            <button
              onClick={handleCancel}
              className="btn btn-danger"
              disabled={actionLoading}
            >
              🚫 Cancel Challan (Restore Stock)
            </button>
          )}
        </div>
      </div>

      {/* Success and Error alerts */}
      {actionError && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span> <strong>Action Failed:</strong> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="card" style={{ borderColor: 'var(--secondary-color)', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>✨</span> {actionSuccess}
        </div>
      )}

      {/* Primary Details Panel split */}
      <div className="grid-cols-3" style={{ alignItems: 'start', marginBottom: '1.5rem' }}>
        {/* Customer / Billing details */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={sectionTitleStyle}>👥 Customer Billing Details</h3>
          <div style={detailsGridStyle}>
            <div>
              <span style={labelStyle}>Business / Firm Name</span>
              <p style={valueStyle}>{challan.customer.businessName}</p>
            </div>
            <div>
              <span style={labelStyle}>Contact Person</span>
              <p style={valueStyle}>{challan.customer.customerName}</p>
            </div>
            <div>
              <span style={labelStyle}>Mobile Number</span>
              <p style={valueStyle}>{challan.customer.mobile}</p>
            </div>
            <div>
              <span style={labelStyle}>Email Address</span>
              <p style={valueStyle}>{challan.customer.email}</p>
            </div>
            <div>
              <span style={labelStyle}>GSTIN Code</span>
              <p style={valueStyle}><code style={{ color: 'var(--primary-color)' }}>{challan.customer.gstNumber}</code></p>
            </div>
            <div>
              <span style={labelStyle}>Billing & Shipping Address</span>
              <p style={{ ...valueStyle, fontSize: '0.85rem' }}>{challan.customer.address}</p>
            </div>
          </div>
        </div>

        {/* Voucher meta card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <h3 style={sectionTitleStyle}>📜 Voucher Details</h3>
          <div>
            <span style={labelStyle}>Challan Number</span>
            <p style={{ ...valueStyle, color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: '700' }}>{challan.challanNumber}</p>
          </div>
          <div>
            <span style={labelStyle}>Officer Prepared By</span>
            <p style={valueStyle}>{challan.creator.name} ({challan.creator.email})</p>
          </div>
          <div>
            <span style={labelStyle}>Date Created</span>
            <p style={valueStyle}>{new Date(challan.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span style={labelStyle}>Last Modified</span>
            <p style={valueStyle}>{new Date(challan.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Challan Items Snapshot table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>🛒 Challan Items Snapshot Table</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical product rates are frozen inside snapshots</span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th>Product Description</th>
                <th>SKU Code</th>
                <th>Snapshot Price</th>
                <th>Qty</th>
                <th>Item Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong style={{ fontSize: '0.875rem' }}>{item.productNameSnapshot}</strong>
                  </td>
                  <td><code style={{ fontSize: '0.8rem', fontWeight: '700' }}>{item.skuSnapshot}</code></td>
                  <td>₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{item.quantity} units</td>
                  <td>₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '2px solid var(--border-color)' }}>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: '700', fontSize: '0.95rem' }}>GRAND TOTAL:</td>
                <td style={{ fontWeight: '700', fontSize: '0.95rem' }}>{challan.totalQuantity} units</td>
                <td style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--secondary-color)' }}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem',
  marginBottom: '1rem',
};

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1rem 1.5rem',
};

const labelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '700',
  textTransform: 'uppercase',
};

const valueStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginTop: '0.125rem',
};

export default ChallanDetail;
