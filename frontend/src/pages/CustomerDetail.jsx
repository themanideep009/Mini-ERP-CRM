import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Follow up update inputs
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const customerRes = await api.get(`/customers/${id}`);
      if (customerRes.data && customerRes.data.success) {
        const custData = customerRes.data.data;
        setCustomer(custData);
        setNotes(custData.notes || '');
        setFollowUpDate(custData.followUpDate ? custData.followUpDate.split('T')[0] : '');
      }

      // Fetch all challans for this customer
      const challanRes = await api.get('/challans');
      if (challanRes.data && challanRes.data.success) {
        const allChallans = challanRes.data.data.challans;
        const customerChallans = allChallans.filter(c => c.customerId === id);
        setChallans(customerChallans);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch customer profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    if (!customer) return;
    
    setSubmittingNote(true);
    try {
      const updatedData = {
        customerName: customer.customerName,
        mobile: customer.mobile,
        email: customer.email,
        businessName: customer.businessName,
        gstNumber: customer.gstNumber,
        customerType: customer.customerType,
        address: customer.address,
        status: customer.status,
        followUpDate: followUpDate || null,
        notes,
      };

      const res = await api.put(`/customers/${id}`, updatedData);
      if (res.data && res.data.success) {
        setCustomer(res.data.data);
        alert('CRM log notes and follow-up date updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update notes');
    } finally {
      setSubmittingNote(false);
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

  if (error || !customer) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--danger-color)' }}>
        <p style={{ fontSize: '2.5rem' }}>👥</p>
        <h3 style={{ color: 'var(--danger-color)' }}>Customer Record Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>{error}</p>
        <Link to="/customers" className="btn btn-secondary">◀ Back to Customer List</Link>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <Link to="/customers" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            ◀ Back to Customer Registry
          </Link>
          <h2 style={{ margin: '0.25rem 0 0 0' }}>{customer.customerName}</h2>
        </div>
        {canModify && (
          <Link to={`/customers/${customer.id}/edit`} className="btn btn-secondary" style={{ borderColor: 'var(--warning-color)', color: 'var(--warning-color)' }}>
            ✏️ Edit Profile
          </Link>
        )}
      </div>

      <div className="grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Left Side: CRM Profile details */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase' }}>
            💼 Business Profile
          </h3>
          <div style={detailsGridStyle}>
            <div>
              <span style={labelStyle}>Contact Person</span>
              <p style={valueStyle}>{customer.customerName}</p>
            </div>
            <div>
              <span style={labelStyle}>Business/Firm Name</span>
              <p style={valueStyle}>{customer.businessName}</p>
            </div>
            <div>
              <span style={labelStyle}>Mobile Number</span>
              <p style={valueStyle}>{customer.mobile}</p>
            </div>
            <div>
              <span style={labelStyle}>Email Address</span>
              <p style={valueStyle}>{customer.email}</p>
            </div>
            <div>
              <span style={labelStyle}>GSTIN Code</span>
              <p style={valueStyle}><code style={{ color: 'var(--primary-color)' }}>{customer.gstNumber}</code></p>
            </div>
            <div>
              <span style={labelStyle}>Customer Classification</span>
              <p style={valueStyle}>
                <span className="badge badge-info">{customer.customerType}</span>
              </p>
            </div>
            <div>
              <span style={labelStyle}>Lead Status</span>
              <p style={valueStyle}>
                <span className={`badge ${customer.status === 'ACTIVE' ? 'badge-success' : customer.status === 'LEAD' ? 'badge-info' : 'badge-danger'}`}>
                  {customer.status}
                </span>
              </p>
            </div>
            <div>
              <span style={labelStyle}>Record Registered</span>
              <p style={{ ...valueStyle, fontSize: '0.8rem' }}>{new Date(customer.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={labelStyle}>Registered Business Address</span>
            <p style={{ ...valueStyle, border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}>
              {customer.address}
            </p>
          </div>
        </div>

        {/* Right Side: CRM Diaries & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* CRM note panel */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
              📔 CRM Follow-up Log
            </h3>
            <form onSubmit={handleUpdateNotes}>
              <div className="form-group">
                <label className="form-label">Next Scheduled Follow-up</label>
                <input
                  type="date"
                  className="form-input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={!canModify || submittingNote}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Notes & Logs</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  placeholder="Record summary of recent interactions, preferences or comments here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canModify || submittingNote}
                ></textarea>
              </div>

              {canModify && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={submittingNote}
                >
                  {submittingNote ? 'Saving Entry...' : '💾 Save CRM Update'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Associated Sales Challans */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
          📜 Associated Sales Challans History
        </h3>
        {challans.length === 0 ? (
          <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No sales challans recorded for this customer yet.
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Total Quantity</th>
                  <th>Challan Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{c.challanNumber}</td>
                    <td>{c.totalQuantity} units ordered</td>
                    <td>
                      <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-info' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/challans/${c.id}`} style={viewChallanLinkStyle}>
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
    </div>
  );
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

const viewChallanLinkStyle = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
};

export default CustomerDetail;
