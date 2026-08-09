import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';

export const CustomerForm = () => {
  const { id } = useParams(); // undefined if creating
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState('RETAIL');
  const [status, setStatus] = useState('LEAD');
  const [address, setAddress] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchCustomer = async () => {
      setFetchLoading(true);
      try {
        const res = await api.get(`/customers/${id}`);
        if (res.data && res.data.success) {
          const cust = res.data.data;
          setCustomerName(cust.customerName);
          setMobile(cust.mobile);
          setEmail(cust.email);
          setBusinessName(cust.businessName);
          setGstNumber(cust.gstNumber);
          setCustomerType(cust.customerType);
          setStatus(cust.status);
          setAddress(cust.address);
          setFollowUpDate(cust.followUpDate ? cust.followUpDate.split('T')[0] : '');
          setNotes(cust.notes || '');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch customer profile data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCustomer();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setLoading(true);

    const customerPayload = {
      customerName,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      status,
      address,
      followUpDate: followUpDate || null,
      notes: notes || '',
    };

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/customers/${id}`, customerPayload);
      } else {
        res = await api.post('/customers', customerPayload);
      }

      if (res.data && res.data.success) {
        navigate(isEditMode ? `/customers/${id}` : '/customers');
      }
    } catch (err) {
      console.error('Customer form submit error:', err);
      const errData = err.response?.data;
      if (errData?.error === 'VALIDATION_ERROR' && errData?.details) {
        setValidationErrors(errData.details);
      } else {
        setError(errData?.message || 'An unexpected error occurred while saving customer profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    const errorObj = validationErrors.find(e => e.field === fieldName);
    return errorObj ? errorObj.message : null;
  };

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          ◀ Cancel and Return
        </Link>
        <h2 style={{ margin: '0.25rem 0 0 0' }}>{isEditMode ? 'Modify Customer CRM Profile' : 'Register New CRM Lead'}</h2>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
          ⚠️ {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--danger-color)', fontWeight: '700', marginBottom: '0.5rem' }}>Validation Checklist Failed:</p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}><strong>{err.field}</strong>: {err.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="grid-cols-2">
          {/* Customer Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contact Person Name</label>
            <input
              type="text"
              className="form-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Aman Sharma"
              required
              disabled={loading}
              style={getFieldError('customerName') ? inputErrorStyle : {}}
            />
            {getFieldError('customerName') && <span style={errorSpanStyle}>{getFieldError('customerName')}</span>}
          </div>

          {/* Business Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Business / Firm Name</label>
            <input
              type="text"
              className="form-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Sharma Electronics & Retail"
              required
              disabled={loading}
              style={getFieldError('businessName') ? inputErrorStyle : {}}
            />
            {getFieldError('businessName') && <span style={errorSpanStyle}>{getFieldError('businessName')}</span>}
          </div>
        </div>

        <div className="grid-cols-2">
          {/* Mobile */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mobile Number (10 Digits)</label>
            <input
              type="text"
              className="form-input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9876543210"
              required
              disabled={loading}
              style={getFieldError('mobile') ? inputErrorStyle : {}}
            />
            {getFieldError('mobile') && <span style={errorSpanStyle}>{getFieldError('mobile')}</span>}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aman.sharma@example.com"
              required
              disabled={loading}
              style={getFieldError('email') ? inputErrorStyle : {}}
            />
            {getFieldError('email') && <span style={errorSpanStyle}>{getFieldError('email')}</span>}
          </div>
        </div>

        <div className="grid-cols-3">
          {/* GST Number */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">GSTIN (15 Alphanumeric)</label>
            <input
              type="text"
              className="form-input"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 07AAAAA1111A1Z1"
              required
              disabled={loading}
              style={getFieldError('gstNumber') ? inputErrorStyle : {}}
            />
            {getFieldError('gstNumber') && <span style={errorSpanStyle}>{getFieldError('gstNumber')}</span>}
          </div>

          {/* Customer Type */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Classification Type</label>
            <select
              className="form-input"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              disabled={loading}
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">CRM Lifecycle Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">Registered Office Address</label>
          <textarea
            className="form-input"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Shop No. 12, Lajpat Nagar, New Delhi - 110024"
            required
            disabled={loading}
            style={getFieldError('address') ? inputErrorStyle : {}}
          ></textarea>
          {getFieldError('address') && <span style={errorSpanStyle}>{getFieldError('address')}</span>}
        </div>

        <div className="grid-cols-2">
          {/* Follow up Date */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Schedule Follow-up Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Initial Client Notes / Comments</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lead is ready to order speakers next month"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flexGrow: 1 }}
            disabled={loading}
          >
            {loading ? 'Saving Profile Details...' : '💾 Save Customer Profile'}
          </button>
          <Link to="/customers" className="btn btn-secondary" style={{ width: '150px' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

const inputErrorStyle = {
  borderColor: 'var(--danger-color)',
};

const errorSpanStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--danger-color)',
  marginTop: '0.25rem',
};

export default CustomerForm;
