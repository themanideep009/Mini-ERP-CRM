import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorMessage from '../components/ErrorMessage.js';

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEdit && id) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/customers/${id}`);
          if (res.data.success) {
            const data = res.data.data;
            setFormData({
              customerName: data.customerName || '',
              mobile: data.mobile || '',
              email: data.email || '',
              businessName: data.businessName || '',
              gstNumber: data.gstNumber || '',
              customerType: data.customerType || 'RETAIL',
              address: data.address || '',
              status: data.status || 'LEAD',
              followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString().split('T')[0] : '',
              notes: data.notes || '',
            });
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch customer details');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      followUpDate: formData.followUpDate ? formData.followUpDate : null,
      notes: formData.notes ? formData.notes : null,
    };

    try {
      if (isEdit && id) {
        await api.put(`/customers/${id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading customer data..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
          <p className="text-secondary text-sm">Enter client details and CRM follow-up preferences</p>
        </div>
        <Link to="/customers" className="btn btn-secondary btn-sm">
          ← Back to Customers
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                className="form-control"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="e.g. Aman Sharma"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                name="businessName"
                className="form-control"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="e.g. Sharma Electronics & Retail"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                className="form-control"
                value={formData.mobile}
                onChange={handleChange}
                required
                placeholder="10 digit mobile number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="client@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST Number *</label>
              <input
                type="text"
                name="gstNumber"
                className="form-control"
                value={formData.gstNumber}
                onChange={handleChange}
                required
                placeholder="15-digit GSTIN code"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Type *</label>
              <select
                name="customerType"
                className="form-control"
                value={formData.customerType}
                onChange={handleChange}
                required
              >
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="form-control"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              rows={3}
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Full office/shop address..."
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">CRM Notes & Remarks</label>
            <textarea
              name="notes"
              rows={3}
              className="form-control"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Client requirements, payment terms, or interaction summary..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/customers" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
